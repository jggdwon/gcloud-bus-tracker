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
    updateInterval: 2000,
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
    appState.map.on('popupopen', function(e) {
        var px = appState.map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
        px.y -= e.popup._container.clientHeight/2; // find the height of the popup container, divide by 2, subtract from the Y axis
        appState.map.panTo(appState.map.unproject(px),{animate: true}); // pan to new center
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

function findNearbyBusStop(busLat, busLon) {
    for (const stopCode in appState.busStops) {
        const stop = appState.busStops[stopCode];
        if (getDistance(busLat, busLon, stop.Latitude, stop.Longitude) < config.atStopThreshold) {
            return stop;
        }
    }
    return null;
}

// --- Icon & UI ---
const createIcon = (html, className, size) => L.divIcon({ html, className, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

function createBusIcon(size, label, highlighted = false, isNearStop = false) {
    const html = `<div class="bus-icon-container"><i class="fa fa-bus"></i><span class="bus-label">${label}</span></div>`;
    return createIcon(html, `bus-icon size-${size} ${highlighted ? 'highlight' : ''} ${isNearStop ? 'nearby' : ''}`, size);
}

function getIconByZoom(type, zoom, label, highlighted = false, isNearStop = false) {
    const levels = config.zoomLevels[type === 'bus' ? 'busIcon' : 'busStopIcon'];
    const size = zoom < levels.small ? 40 : zoom < levels.medium ? 64 : 96;
    if (type === 'bus') {
        return createBusIcon(size, label, highlighted, isNearStop);
    } else {
        return createIcon('<i class="fa fa-dot-circle-o"></i>', `bus-stop-icon size-${size} ${highlighted ? 'highlight' : ''}`, size);
    }
}

function updatePopupContent(bus) {
    const isTracked = appState.followedBus === bus.itemIdentifier;
    let atStopText = '';
    if (bus.currentStopCode && appState.busStops[bus.currentStopCode]) {
        const stopName = appState.busStops[bus.currentStopCode].CommonName;
        const secondsAtStop = Math.round((Date.now() - bus.atStopSince) / 1000);
        atStopText = `<div class="at-stop-info"><b>At Stop:</b> ${stopName} <i class="fa fa-map-pin"></i><br><b>Time at stop:</b> ${secondsAtStop}s</div>`;
    }

    const trackingText = isTracked ? '<div class="tracking-text">TRACKING</div>' : '';
    const speedText = `<b>Speed:</b> ${bus.displaySpeed.toFixed(1)} mph<br>`;
    bus.marker.getPopup().setContent(`${trackingText}${atStopText}${speedText}<b>Line:</b> ${bus.lineRef}<br><b>Bus:</b> ${bus.vehicleRef}<br><b>Destination:</b> ${bus.destinationName}`);
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
        appState.map.setView(bus.marker.getLatLng(), 18);
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
            appState.map.setView(marker.getLatLng(), 17);
            marker.openPopup();
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
                if (dist > 0.005) { // ~8 meters, bus is moving
                    const timeDiffHours = (recordedAtTime.getTime() - bus.lastUpdateTime) / 3600000;
                    const currentSpeed = timeDiffHours > 0 ? dist / timeDiffHours : 0;
                    bus.speedHistory.push(currentSpeed);
                    if (bus.speedHistory.length > config.speedAvgSize) bus.speedHistory.shift();
                    bus.displaySpeed = bus.speedHistory.reduce((a, b) => a + b, 0) / bus.speedHistory.length;
                } else { // Bus is stationary
                    bus.displaySpeed *= 0.9; // Decay speed
                    if (bus.displaySpeed < 1) bus.displaySpeed = 0;
                }
                
                bus.lat = newLat;
                bus.lon = newLon;
                bus.lastUpdateTime = recordedAtTime.getTime();
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
                bus.marker.slideTo([newLat, newLon], { duration: 3000 });
                updatePopupContent(bus);
            } else { // New bus
                const marker = L.marker([newLat, newLon], { 
                    icon: getIconByZoom('bus', appState.map.getZoom(), lineRef, false, !!nearbyStop), 
                    label: lineRef
                }).addTo(appState.map);

                appState.buses[itemIdentifier] = {
                    marker, itemIdentifier,
                    lineRef: lineRef,
                    vehicleRef: mvj.getElementsByTagName("VehicleRef")[0]?.textContent || '????',
                    destinationName: mvj.getElementsByTagName("DestinationName")[0]?.textContent || 'N/A',
                    lat: newLat, lon: newLon,
                    lastUpdateTime: recordedAtTime.getTime(),
                    speedHistory: [], displaySpeed: 0,
                    atStopSince: null, currentStopCode: null,
                    isNearStop: !!nearbyStop,
                };
                marker.bindPopup('');
                updatePopupContent(appState.buses[itemIdentifier]);
                marker.on('click', () => handleBusClick(itemIdentifier));
                marker.on('slidemove', (e) => {
                    if (appState.followedBus === itemIdentifier) {
                        appState.map.panTo(e.latlng, { animate: false });
                    }
                });
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
    } finally {
        
    }
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
    ui.busList.innerHTML = '';
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