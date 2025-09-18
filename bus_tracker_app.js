/**
 * Bus Tracker Application - Final Stable Version v13
 * Added 'Time at Stop' counter.
 */

// --- Application State & Config ---
const config = {
    boundingBox: '-0.70,53.53,-0.60,53.63',
    map: { center: [53.58, -0.65], zoom: 13, maxZoom: 18 },
    zoomLevels: {
        busIcon: { small: 14, medium: 16 },
        busStopIcon: { small: 15, medium: 17 },
        busStopLayer: 15,
    },
    speedAvgSize: 5,
    atStopThreshold: 0.0186411, // miles, approx 30 meters
};

const appState = {
    buses: {},
    busStops: {},
    busStopMarkers: {},
    followedBus: null,
    map: null,
    busStopsLayer: L.layerGroup(),
    routeLayer: L.layerGroup(),
    fetchIntervalId: null,
    heartbeatIntervalId: null,
    updateInterval: 2000,
    isPanningProgrammatically: false,
};

// --- DOM Elements ---
const ui = {};

// --- Map Initialization ---
function initMap() {
    appState.map = L.map('map', { maxZoom: config.map.maxZoom, zoomControl: false }).setView(config.map.center, config.map.zoom);
    appState.routeLayer.addTo(appState.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(appState.map);
    appState.map.on('zoomend', handleMapZoom);
    appState.map.on('click', unfollowBus);
    appState.map.on('dragstart', unfollowBus);
    appState.map.on('zoomstart', unfollowBus);
    appState.map.on('keydown', unfollowBus);
    appState.map.on('popupopen', function(e) {
        appState.isPanningProgrammatically = true;
        var px = appState.map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
        px.y -= e.popup._container.clientHeight/2; // find the height of the popup container, divide by 2, subtract from the Y axis
        appState.map.panTo(appState.map.unproject(px),{animate: true}); // pan to new center
        setTimeout(() => { appState.isPanningProgrammatically = false; }, 1200);
    });
}

// --- Helper Functions ---
const toRad = (deg) => deg * Math.PI / 180;
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // miles
    const rlat1 = toRad(lat1), rlat2 = toRad(lat2);
    const dLat = rlat2 - rlat1, dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return 2 * R * Math.asin(Math.sqrt(a));
};

const toDegrees = (rad) => rad * 180 / Math.PI;

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = toRad(lon2 - lon1);
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    return (toDegrees(Math.atan2(y, x)) + 360) % 360;
}

function predictPosition(lat, lon, bearing, speedMph, timeSeconds) {
    if (speedMph < 1 || bearing === null) {
        return { lat, lon };
    }
    const R = 3958.8; // Earth's radius in miles
    const distance = (speedMph * timeSeconds) / 3600; // distance in miles

    const latRad = toRad(lat);
    const lonRad = toRad(lon);
    const bearingRad = toRad(bearing);

    const lat2Rad = Math.asin(Math.sin(latRad) * Math.cos(distance / R) +
                           Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearingRad));
    const lon2Rad = lonRad + Math.atan2(Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(latRad),
                                     Math.cos(distance / R) - Math.sin(latRad) * Math.sin(lat2Rad));

    return { lat: toDegrees(lat2Rad), lon: toDegrees(lon2Rad) };
}

function getPointBehind(lat, lon, bearing, distanceMiles) {
    if (bearing === null) {
        return { lat, lon };
    }
    // To go backward, we add 180 degrees to the bearing.
    const reverseBearing = (bearing + 180) % 360;
    
    const R = 3958.8; // Earth's radius in miles

    const latRad = toRad(lat);
    const lonRad = toRad(lon);
    const bearingRad = toRad(reverseBearing);

    const lat2Rad = Math.asin(Math.sin(latRad) * Math.cos(distanceMiles / R) +
                           Math.cos(latRad) * Math.sin(distanceMiles / R) * Math.cos(bearingRad));
    const lon2Rad = lonRad + Math.atan2(Math.sin(bearingRad) * Math.sin(distanceMiles / R) * Math.cos(latRad),
                                     Math.cos(distanceMiles / R) - Math.sin(latRad) * Math.sin(lat2Rad));

    return { lat: toDegrees(lat2Rad), lon: toDegrees(lon2Rad) };
}

function findNearbyBusStop(busLat, busLon) {
    for (const stopCode in appState.busStops) {
        const stop = appState.busStops[stopCode];
        if (getDistance(busLat, busLon, stop.Latitude, stop.Longitude) < config.atStopThreshold) {
            return stop;
        }
    }
    return null;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function getColorFromLineRef(lineRef) {
    const hash = simpleHash(lineRef);
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
}

// --- Icon & UI ---
const createIcon = (html, className, size) => L.divIcon({ html, className, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

function createBusIcon(size, label, color, highlighted = false, isNearStop = false) {
    const gradient = `radial-gradient(circle, ${color} 0%, ${color} 50%, rgba(0,0,0,0) 70%)`;
    const style = `background: ${gradient}; opacity: 0.8;`;
    const html = `<div class="bus-icon-container" style="${style}"><i class="fa fa-bus"></i><span class="bus-label">${label}</span></div>`;
    return createIcon(html, `bus-icon size-${size} ${highlighted ? 'highlight' : ''} ${isNearStop ? 'nearby' : ''}`, size);
}

function getIconByZoom(type, zoom, label, highlighted = false, isNearStop = false) {
    const levels = config.zoomLevels[type === 'bus' ? 'busIcon' : 'busStopIcon'];
    if (type === 'bus') {
        const size = zoom < levels.small ? 40 : zoom < levels.medium ? 64 : 96;
        const color = getColorFromLineRef(label);
        return createBusIcon(size, label, color, highlighted, isNearStop);
    } else {
        const size = zoom < levels.small ? 20 : zoom < levels.medium ? 32 : 48;
        return createIcon('<i class="fa fa-dot-circle-o"></i>', `bus-stop-icon size-${size} ${highlighted ? 'highlight' : ''}`, size);
    }
}

function getSpeedColor(speed) {
    const clampedSpeed = Math.min(Math.max(speed, 0), 20); // Clamp speed between 0 and 20
    const hue = 39 + (120 - 39) * (clampedSpeed / 20); // Interpolate hue from orange (39) to green (120)
    return `hsl(${hue}, 100%, 50%)`;
}

function getCounterColor(seconds) {
    const clampedSeconds = Math.min(Math.max(seconds, 0), 60);
    const hue = 120 - (120 * (clampedSeconds / 60)); // 120 is green, 0 is red
    return `hsl(${hue}, 100%, 50%)`;
}

function updatePopupContent(bus, movementState = '', debugInfo = {}) {
    const isTracked = appState.followedBus === bus.itemIdentifier;
    let atStopText = '';
    if (bus.currentStopCode && appState.busStops[bus.currentStopCode]) {
        const stopName = appState.busStops[bus.currentStopCode].CommonName;
        const secondsAtStop = Math.round((Date.now() - bus.atStopSince) / 1000);
        atStopText = `<div class="at-stop-info"><b>At Stop:</b> ${stopName} <i class="fa fa-map-pin"></i><br><b>Time at stop:</b> ${secondsAtStop}s</div>`;
    }

    let indicatorClass = '';
    if (movementState === 'moved') indicatorClass = 'flash-green';
    if (movementState === 'stationary') indicatorClass = 'flash-red';
    
    const secondsSinceUpdate = Math.round((Date.now() - (bus.lastMovedTime || bus.lastPollTime)) / 1000);
    const displaySeconds = Math.min(secondsSinceUpdate, 999);
    const shadowColor = getCounterColor(displaySeconds);
    const shadowStyle = `text-shadow: -1px -1px 0 ${shadowColor}, 1px -1px 0 ${shadowColor}, -1px 1px 0 ${shadowColor}, 1px 1px 0 ${shadowColor};`;

    const indicatorHTML = `<span class="update-heart ${indicatorClass}"><span class="heart-counter" style="${shadowStyle}">${displaySeconds}</span></span>`;

    const speedColor = getSpeedColor(bus.displaySpeed);
    const speedHTML = `<span class="speed-value" style="background-color: ${speedColor};">${bus.displaySpeed.toFixed(1)}</span> mph`;
    
    const bearing = bus.bearing !== null ? bus.bearing : 0;
    const compassHTML = `<div class="compass-container"><div class="north-indicator">N</div><div class="compass-needle" style="--bearing: ${bearing}deg;"></div></div>`;

    const topLineHTML = `<div class="top-line">${indicatorHTML} ${speedHTML} ${compassHTML}</div>`;
    const distText = debugInfo.distance ? `<b>Dist:</b> ${debugInfo.distance.toFixed(5)} mi<br>` : '';
    
    const content = `
        ${topLineHTML}
        ${atStopText}
        ${distText}
        <b>Line:</b> ${bus.lineRef}<br>
        <b>Bus:</b> ${bus.vehicleRef}<br>
        <b>Destination:</b> ${bus.destinationName}
    `;
    bus.marker.getPopup().setContent(content);
}

function showErrorPopup(error) {
    const errorMessage = `${error.name}: ${error.message}\n\n${error.stack}`;
    ui.errorMessage.textContent = errorMessage;
    ui.errorOverlay.classList.remove('hidden');
}

// --- Event Handlers ---
function handleMapZoom() {
    const zoom = appState.map.getZoom();
    if (zoom >= config.zoomLevels.busStopLayer && ui.busStopToggle.checked) {
        if (!appState.map.hasLayer(appState.busStopsLayer)) appState.map.addLayer(appState.busStopsLayer);
    } else {
        if (appState.map.hasLayer(appState.busStopsLayer)) appState.map.removeLayer(appState.busStopsLayer);
    }
    for (const key in appState.buses) {
        const bus = appState.buses[key];
        bus.marker.setIcon(getIconByZoom('bus', zoom, bus.lineRef, appState.followedBus === key, bus.isNearStop));
    }
    appState.busStopsLayer.eachLayer(layer => layer.setIcon(getIconByZoom('stop', zoom)));
}

function unfollowBus() {
    if (appState.isPanningProgrammatically) {
        return;
    }
    if (appState.followedBus && appState.buses[appState.followedBus]) {
        const bus = appState.buses[appState.followedBus];
        bus.marker.setIcon(getIconByZoom('bus', appState.map.getZoom(), bus.lineRef, false, bus.isNearStop));
    }
    appState.followedBus = null;
}

function handleBusClick(itemIdentifier) {
    if (appState.followedBus === itemIdentifier) {
        unfollowBus();
    } else {
        unfollowBus();
        appState.followedBus = itemIdentifier;
        const bus = appState.buses[itemIdentifier];
        bus.marker.setIcon(getIconByZoom('bus', appState.map.getZoom(), bus.lineRef, true, bus.isNearStop));
        appState.isPanningProgrammatically = true;
        appState.map.setView(bus.marker.getLatLng(), 18);
        setTimeout(() => { appState.isPanningProgrammatically = false; }, 1200);
    }
    ui.sidebar.classList.remove('active');
}

function handleListClick(event) {
    const target = event.target.closest('li');
    if (!target || !target.dataset.id) return;
    const { id, type } = target.dataset;
    if (type === 'bus') {
        handleBusClick(id);
        const marker = appState.buses[id]?.marker;
        if (marker && !marker.isPopupOpen()) marker.openPopup();
    } else if (type === 'stop') {
        const marker = appState.busStopMarkers[id];
        if (marker) {
            appState.isPanningProgrammatically = true;
            appState.map.setView(marker.getLatLng(), 17);
            marker.openPopup();
            setTimeout(() => { appState.isPanningProgrammatically = false; }, 1200);
        }
    }
    ui.sidebar.classList.remove('active');
}

// --- Data Fetching & Processing ---
async function fetchBusStops() {
    try {
        const response = await fetch('/bus-stops');
        if (!response.ok) throw new Error(`API error fetching bus stops: ${response.status} ${response.statusText}`);
        const data = await response.json();
        if (!data || !Array.isArray(data)) throw new Error('Received invalid data for bus stops.');
        if (data.length === 0) return;

        data.sort((a, b) => (a.CommonName || '').localeCompare(b.CommonName || ''));
        const fragment = document.createDocumentFragment();
        data.forEach(stop => {
            if (stop.ATCOCode && stop.Latitude && stop.Longitude) {
                appState.busStops[stop.ATCOCode] = stop;
                const marker = L.marker([stop.Latitude, stop.Longitude], { icon: getIconByZoom('stop', appState.map.getZoom()) }).addTo(appState.busStopsLayer);
                marker.bindPopup(`<b>${stop.CommonName}</b><br>${stop.Street}`);
                appState.busStopMarkers[stop.ATCOCode] = marker;
                const listItem = document.createElement('li');
                listItem.dataset.id = stop.ATCOCode;
                listItem.dataset.type = 'stop';
                listItem.innerHTML = stop.CommonName;
                fragment.appendChild(listItem);
            }
        });
        ui.busStopList.innerHTML = '';
        ui.busStopList.appendChild(fragment);
    } catch (error) {
        console.error(error);
        showErrorPopup(error);
    }
}

async function fetchData() {
    const pollTime = Date.now();
    try {
        const response = await fetch(`/api?boundingBox=${config.boundingBox}`);
        if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);
        
        ui.statusMessage.textContent = '';
        const xmlDoc = new DOMParser().parseFromString(await response.text(), "text/xml");
        const vehicleActivities = Array.from(xmlDoc.getElementsByTagName("VehicleActivity"));
        const currentVehicleIds = new Set();

        vehicleActivities.forEach(va => {
            const mvj = va.getElementsByTagName("MonitoredVehicleJourney")[0];
            const recordedAtTime = new Date(va.getElementsByTagName("RecordedAtTime")[0].textContent);
            if (!mvj || isNaN(recordedAtTime.getTime())) return;

            const itemIdentifier = va.getElementsByTagName("ItemIdentifier")[0].textContent;
            currentVehicleIds.add(itemIdentifier);

            const newLat = parseFloat(mvj.getElementsByTagName("Latitude")[0].textContent);
            const newLon = parseFloat(mvj.getElementsByTagName("Longitude")[0].textContent);
            if (isNaN(newLat) || isNaN(newLon)) return;

            const bus = appState.buses[itemIdentifier];
            const nearbyStop = findNearbyBusStop(newLat, newLon);
            const lineRef = mvj.getElementsByTagName("LineRef")[0]?.textContent || 'N/A';

            if (bus) { // Existing bus
                const dist = getDistance(bus.lat, bus.lon, newLat, newLon);
                let movementState = 'stationary';
                const timeDiffSeconds = (recordedAtTime.getTime() - bus.lastUpdateTime) / 1000;
                
                if (dist > 0.005 && timeDiffSeconds > 0) { // ~8 meters, bus is moving
                    movementState = 'moved';
                    bus.lastMovedTime = pollTime;
                    const timeDiffHours = timeDiffSeconds / 3600;
                    const currentSpeed = dist / timeDiffHours;
                    bus.speedHistory.push(currentSpeed);
                    if (bus.speedHistory.length > config.speedAvgSize) bus.speedHistory.shift();
                    bus.displaySpeed = bus.speedHistory.reduce((a, b) => a + b, 0) / bus.speedHistory.length;
                    
                    const bearingFromApi = mvj.getElementsByTagName("Bearing")[0]?.textContent;
                    if (bearingFromApi) {
                        bus.bearing = parseFloat(bearingFromApi);
                    } else {
                        bus.bearing = calculateBearing(bus.lat, bus.lon, newLat, newLon);
                    }

                    // Predict the future position based on the time to the next update.
                    const predictedPosition = predictPosition(newLat, newLon, bus.bearing, currentSpeed, timeDiffSeconds);
                    
                    // Animate to the predicted position over the exact time delta.
                    bus.marker.slideTo([predictedPosition.lat, predictedPosition.lon], {
                        duration: timeDiffSeconds * 1000,
                        keepAtCenter: false,
                    });

                } else { // Bus is stationary or update is old
                    if (!bus.lastMovedTime) {
                        bus.lastMovedTime = bus.lastPollTime;
                    }
                    // If the bus has stopped, we let the current animation finish naturally.
                    // The staleBusChecker will eventually snap it to the final position if needed.
                    // We just decay the speed for the UI.
                    bus.displaySpeed *= 0.9; // Decay speed
                    if (bus.displaySpeed < 1) bus.displaySpeed = 0;
                }
                
                // ALWAYS update the internal state to the latest actual position
                bus.lat = newLat;
                bus.lon = newLon;
                bus.lastUpdateTime = recordedAtTime.getTime();
                bus.lastPollTime = pollTime;
                bus.isNearStop = !!nearbyStop;

                if (nearbyStop) {
                    if (bus.currentStopCode !== nearbyStop.ATCOCode) {
                        bus.atStopSince = Date.now();
                        bus.currentStopCode = nearbyStop.ATCOCode;
                    }
                } else {
                    bus.atStopSince = null;
                    bus.currentStopCode = null;
                }

                bus.marker.setIcon(getIconByZoom('bus', appState.map.getZoom(), bus.lineRef, appState.followedBus === itemIdentifier, bus.isNearStop));
                if (appState.followedBus === itemIdentifier) {
                    // Gently pan the map to keep the bus in view, but don't force center
                    appState.map.panTo([newLat, newLon], { animate: true, duration: 1.0 });
                }
                updatePopupContent(bus, movementState, { distance: dist });
            } else { // New bus
                const bearingFromApi = mvj.getElementsByTagName("Bearing")[0]?.textContent;
                const bearing = bearingFromApi ? parseFloat(bearingFromApi) : null;
                
                // Spawn the bus slightly behind its actual position to animate it in
                const spawnPoint = getPointBehind(newLat, newLon, bearing, 0.02); // approx 32 meters

                const marker = L.marker([spawnPoint.lat, spawnPoint.lon], { 
                    icon: getIconByZoom('bus', appState.map.getZoom(), lineRef, false, !!nearbyStop), 
                    label: lineRef
                }).addTo(appState.map);

                appState.buses[itemIdentifier] = {
                    marker, itemIdentifier,
                    lineRef: lineRef,
                    vehicleRef: mvj.getElementsByTagName("VehicleRef")[0]?.textContent || '????',
                    destinationName: mvj.getElementsByTagName("DestinationName")[0]?.textContent || 'N/A',
                    lat: newLat, lon: newLon, // Store the ACTUAL position
                    lastUpdateTime: recordedAtTime.getTime(),
                    lastPollTime: pollTime,
                    lastMovedTime: pollTime,
                    speedHistory: [], displaySpeed: 0, bearing: bearing,
                    atStopSince: null, currentStopCode: null,
                    isNearStop: !!nearbyStop,
                };
                
                // Animate the marker to its actual starting position
                marker.slideTo([newLat, newLon], {
                    duration: 2000,
                    keepAtCenter: false,
                });

                marker.bindPopup('');
                updatePopupContent(appState.buses[itemIdentifier], 'new');
                marker.on('click', () => handleBusClick(itemIdentifier));
            }
        });

        for (const key in appState.buses) {
            if (!currentVehicleIds.has(key)) {
                appState.map.removeLayer(appState.buses[key].marker);
                delete appState.buses[key];
            }
        }
        updateBusList();
    } catch (error) {
        console.error(error);
        showErrorPopup(error);
        ui.statusMessage.textContent = `Updates paused due to error.`;
        if (appState.fetchIntervalId) {
            clearInterval(appState.fetchIntervalId);
            appState.fetchIntervalId = null;
        }
        if (appState.heartbeatIntervalId) {
            clearInterval(appState.heartbeatIntervalId);
            appState.heartbeatIntervalId = null;
        }
    } finally {
        
    }
}

function startStaleBusChecker() {
    const STALE_TIMEOUT_MS = 15000;
    const CHECK_INTERVAL_MS = 2000;

    setInterval(() => {
        const now = Date.now();
        for (const key in appState.buses) {
            const bus = appState.buses[key];
            const timeSinceLastUpdate = now - bus.lastPollTime;

            if (timeSinceLastUpdate > STALE_TIMEOUT_MS) {
                // If the marker is not at its actual last known position, slide it there.
                const currentPos = bus.marker.getLatLng();
                if (getDistance(currentPos.lat, currentPos.lng, bus.lat, bus.lon) > 0.001) {
                     console.log(`Bus ${bus.vehicleRef} is stale. Snapping to actual position.`);
                    bus.marker.slideTo([bus.lat, bus.lon], {
                        duration: 1000 // A gentle slide to the final spot
                    });
                }
            }
        }
    }, CHECK_INTERVAL_MS);
}

function updateBusList() {
    const listFragment = document.createDocumentFragment();
    Object.values(appState.buses).sort((a, b) => a.lineRef.localeCompare(b.lineRef)).forEach(bus => {
        const listItem = document.createElement('li');
        listItem.dataset.id = bus.itemIdentifier;
        listItem.dataset.type = 'bus';
        listItem.dataset.vehicleRef = bus.vehicleRef;
        listItem.innerHTML = `<b>${bus.lineRef}</b> to ${bus.destinationName} (ID: ${bus.vehicleRef.slice(-4)})`;
        listFragment.appendChild(listItem);
    });
    // Clear the list more efficiently
    while (ui.busList.firstChild) {
        ui.busList.removeChild(ui.busList.firstChild);
    }
    ui.busList.appendChild(listFragment);
}

// --- Initialization ---
function startAutoUpdate() {
    if (appState.fetchIntervalId) clearInterval(appState.fetchIntervalId);
    appState.fetchIntervalId = setInterval(fetchData, appState.updateInterval);
}

function init() {
    Object.assign(ui, {
        busList: document.getElementById('bus-list'),
        busStopList: document.getElementById('bus-stop-list'),
        busStopToggle: document.getElementById('bus-stop-toggle'),
        statusMessage: document.getElementById('status-message'),
        errorOverlay: document.getElementById('error-overlay'),
        errorMessage: document.getElementById('error-message'),
        copyErrorBtn: document.getElementById('copy-error-btn'),
        closeErrorBtn: document.getElementById('close-error-btn'),
        menuToggle: document.getElementById('menu-toggle'),
        sidebar: document.getElementById('sidebar'),
    });

    initMap();
    
    setupEventListeners();
    fetchBusStops();
    fetchData();
    startAutoUpdate();
    startStaleBusChecker();
}

function setupEventListeners() {
    
    ui.busStopToggle.addEventListener('change', handleMapZoom);
    document.querySelectorAll('.tab-link').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-link, .tab-content').forEach(el => el.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab).classList.add('active');
        });
    });
    ui.busList.addEventListener('click', handleListClick);
    ui.busStopList.addEventListener('click', handleListClick);

    ui.closeErrorBtn.addEventListener('click', () => ui.errorOverlay.classList.add('hidden'));
    ui.copyErrorBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(ui.errorMessage.textContent);
        ui.copyErrorBtn.textContent = 'Copied!';
        setTimeout(() => { ui.copyErrorBtn.textContent = 'Copy'; }, 2000);
    });

    ui.menuToggle.addEventListener('click', () => {
        ui.sidebar.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', init);