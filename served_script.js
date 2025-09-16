const map = L.map('map', {
    maxZoom: 18
}).setView([53.58, -0.65], 13);
const busList = document.getElementById('bus-list');
const markers = {};
const updateIndicator = document.getElementById('update-indicator');
let openPopupInfo = null;
let currentSelectedBusMarker = null;
let currentSelectedBusListItem = null;
let currentSelectedBusStopMarker = null;
let currentSelectedBusStopListItem = null;

const busStopsLayer = L.layerGroup(); // Don't add to map initially
const routeLayer = L.layerGroup().addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const busTab = document.getElementById('buses-tab');
const stopsTab = document.getElementById('stops-tab');
const busTabBtn = document.querySelector('.tab-btn[data-tab="buses"]');
const stopsTabBtn = document.querySelector('.tab-btn[data-tab="stops"]');

busTabBtn.addEventListener('click', () => {
  busTab.classList.add('active');
  stopsTab.classList.remove('active');
  busTabBtn.classList.add('active');
  stopsTabBtn.classList.remove('active');
});

stopsTabBtn.addEventListener('click', () => {
  stopsTab.classList.add('active');
  busTab.classList.remove('active');
  stopsTabBtn.classList.add('active');
  busTabBtn.classList.remove('active');
});

function createBusIcon(size, highlighted = false, lineRef, rotationAngle = 0) {
    return L.divIcon({
        html: `<div class="bus-number">${lineRef}</div><i class="fa fa-arrow-up bus-arrow" style="transform: translate(-50%, -50%) rotate(${rotationAngle}deg);"></i>`,
        className: `bus-icon size-${size} ${highlighted ? 'highlight' : ''}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
}

const iconSmall = createBusIcon(20);
const iconMedium = createBusIcon(32);
const iconLarge = createBusIcon(48);
const iconSmallHighlight = createBusIcon(20, true);
const iconMediumHighlight = createBusIcon(32, true);
const iconLargeHighlight = createBusIcon(48, true);

function createBusStopIcon(size, highlighted = false) {
    return L.divIcon({
        html: '<i class="fa fa-dot-circle-o"></i>',
        className: `bus-stop-icon size-${size} ${highlighted ? 'highlight' : ''}`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
}

const busStopIconSmall = createBusStopIcon(10);
const busStopIconMedium = createBusStopIcon(16);
const busStopIconLarge = createBusStopIcon(24);
const busStopIconSmallHighlight = createBusStopIcon(10, true);
const busStopIconMediumHighlight = createBusStopIcon(16, true);
const busStopIconLargeHighlight = createBusStopIcon(24, true);

function getIconByZoom(zoom, highlighted = false, lineRef, rotationAngle = 0) {
    const size = zoom < 14 ? 20 : zoom < 16 ? 32 : 48;
    return createBusIcon(size, highlighted, lineRef, rotationAngle);
}

function getBusStopIconByZoom(zoom, highlighted = false) {
    if (zoom < 15) {
        return highlighted ? busStopIconSmallHighlight : busStopIconSmall;
    } else if (zoom < 17) {
        return highlighted ? busStopIconMediumHighlight : busStopIconMedium;
    } else {
        return highlighted ? busStopIconLargeHighlight : busStopIconLarge;
    }
}

map.on('zoomend', () => {
    const zoom = map.getZoom();

    // Show/hide bus stops
    if (zoom >= 15) {
        if (!map.hasLayer(busStopsLayer)) {
            map.addLayer(busStopsLayer);
        }
    } else {
        if (map.hasLayer(busStopsLayer)) {
            map.removeLayer(busStopsLayer);
        }
    }

    // Resize bus icons
    for (const key in markers) {
        const marker = markers[key].marker;
        const highlighted = marker.options.icon.options.className.includes('highlight');
        const lineRef = marker.options.lineRef;
        marker.setIcon(getIconByZoom(zoom, highlighted, lineRef, markers[key].bearing));
    }

    // Resize bus stop icons
    const newBusStopIcon = getBusStopIconByZoom(zoom);
    busStopsLayer.eachLayer(layer => {
        layer.setIcon(newBusStopIcon);
    });
});

const busStopList = document.getElementById('bus-stop-list');
const busStops = {};
const busStopMarkers = {};

async function fetchBusStops() {
    try {
        const response = await fetch('/bus-stops');
        const data = await response.json();

        busStopList.innerHTML = '';
        data.forEach(stop => {
            if (stop.ATCOCode) {
                busStops[stop.ATCOCode] = stop;
            }
            if (stop.Latitude && stop.Longitude) {
                const marker = L.marker([stop.Latitude, stop.Longitude], {
                    icon: getBusStopIconByZoom(map.getZoom())
                }).addTo(busStopsLayer);
                marker.bindPopup(`<b>${stop.CommonName}</b><br>${stop.Street}`);
                busStopMarkers[stop.ATCOCode] = marker;

                const listItem = document.createElement('li');
                listItem.innerHTML = stop.CommonName;
                listItem.onclick = () => {
                    map.setView([stop.Latitude, stop.Longitude], 17);
                    marker.openPopup();
                };
                listItem.onmouseover = () => {
                    marker.setIcon(getBusStopIconByZoom(map.getZoom(), true));
                };
                listItem.onmouseout = () => {
                    marker.setIcon(getBusStopIconByZoom(map.getZoom(), false));
                };
                busStopList.appendChild(listItem);
            }
        });
    } catch (error) {
        console.error('Error fetching bus stops:', error);
    }
}

let timetableData = null;

async function fetchTimetables() {
    try {
        const response = await fetch('/timetables');
        const data = await response.text();
        const parser = new DOMParser();
        timetableData = parser.parseFromString(data, "text/xml");
        console.log('Timetables data parsed:', timetableData);
    } catch (error) {
        console.error('Error fetching timetables:', error);
    }
}

function getRouteForBus(lineRef, directionRef, departureTime) {
    if (!timetableData) {
        return null;
    }

    // Find the VehicleJourney
    const vehicleJourneys = timetableData.getElementsByTagName('VehicleJourney');
    let journey = null;
    for (let i = 0; i < vehicleJourneys.length; i++) {
        const vj = vehicleJourneys[i];
        const lineRefEl = vj.getElementsByTagName('LineRef')[0];
        const directionRefEl = vj.getElementsByTagName('DirectionRef')[0];
        const departureTimeEl = vj.getElementsByTagName('DepartureTime')[0];

        if (lineRefEl && directionRefEl && departureTimeEl) {
            const vjLineRef = lineRefEl.textContent;
            const vjDirectionRef = directionRefEl.textContent;
            const vjDepartureTime = departureTimeEl.textContent;

            if (vjLineRef.endsWith(lineRef) && vjDirectionRef === directionRef && vjDepartureTime === departureTime) {
                journey = vj;
                break;
            }
        }
    }

    if (!journey) {
        return null;
    }

    // Find the JourneyPattern
    const journeyPatternRef = journey.getElementsByTagName('JourneyPatternRef')[0].textContent;
    const journeyPattern = timetableData.querySelector(`JourneyPattern[id="${journeyPatternRef}"]`);

    if (!journeyPattern) {
        return null;
    }

    // Get the stop points
    const stopPoints = [];
    const journeyPatternSectionRefs = journeyPattern.getElementsByTagName('JourneyPatternSectionRefs');
    for (let i = 0; i < journeyPatternSectionRefs.length; i++) {
        const sectionRef = journeyPatternSectionRefs[i].textContent;
        const journeyPatternSection = timetableData.querySelector(`JourneyPatternSection[id="${sectionRef}"]`);
        if (journeyPatternSection) {
            const timingLinks = journeyPatternSection.getElementsByTagName('JourneyPatternTimingLink');
            for (let j = 0; j < timingLinks.length; j++) {
                const fromStop = timingLinks[j].getElementsByTagName('From')[0].getElementsByTagName('StopPointRef')[0].textContent;
                stopPoints.push(fromStop);
                if (j === timingLinks.length - 1) {
                    const toStop = timingLinks[j].getElementsByTagName('To')[0].getElementsByTagName('StopPointRef')[0].textContent;
                    stopPoints.push(toStop);
                }
            }
        }
    }
    
    const routeCoords = [];
    stopPoints.forEach(stopRef => {
        const stop = busStops[stopRef];
        if (stop && stop.Latitude && stop.Longitude) {
            routeCoords.push([stop.Latitude, stop.Longitude]);
        }
    });

    return {
        stopRefs: stopPoints,
        coords: routeCoords
    };
}

async function fetchData() {
  updateIndicator.classList.add('loading');

  // Store the currently open popup
  for (const key in markers) {
    if (markers[key].marker.isPopupOpen()) {
      openPopupInfo = {
        key: key,
        content: markers[key].marker.getPopup().getContent()
      };
      break;
    }
  }

  const apiUrl = '/api?boundingBox=-0.70,53.53,-0.60,53.63';

  try {
    const response = await fetch(apiUrl);
    const data = await response.text();

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");

    const vehicleActivities = xmlDoc.getElementsByTagName("VehicleActivity");

    // Create a set of current vehicle identifiers for efficient lookup
    const currentVehicleIds = new Set();
    for (let i = 0; i < vehicleActivities.length; i++) {
        const itemIdentifier = vehicleActivities[i].getElementsByTagName("ItemIdentifier")[0].textContent;
        currentVehicleIds.add(itemIdentifier);
    }

    // Remove markers for buses that are no longer in the feed
    for (const key in markers) {
        if (!currentVehicleIds.has(key)) {
            map.removeLayer(markers[key].marker);
            delete markers[key];
        }
    }
    
    busList.innerHTML = '';

    for (let i = 0; i < vehicleActivities.length; i++) {
      const vehicleActivity = vehicleActivities[i];
      const itemIdentifier = vehicleActivity.getElementsByTagName("ItemIdentifier")[0].textContent;
      const vehicleLocation = vehicleActivity.getElementsByTagName("VehicleLocation")[0];
      const longitude = vehicleLocation.getElementsByTagName("Longitude")[0].textContent;
      const latitude = vehicleLocation.getElementsByTagName("Latitude")[0].textContent;

      const monitoredVehicleJourney = vehicleActivity.getElementsByTagName("MonitoredVehicleJourney")[0];
      if (monitoredVehicleJourney) {
        const lineRef = monitoredVehicleJourney.getElementsByTagName("LineRef")[0].textContent;
        const destinationName = monitoredVehicleJourney.getElementsByTagName("DestinationName")[0].textContent;
        const bearing = monitoredVehicleJourney.getElementsByTagName("Bearing")?.[0]?.textContent;

        const popupContent = `<b>Line:</b> ${lineRef}<br><b>Destination:</b> ${destinationName}`;

        let marker;
        if (markers[itemIdentifier]) {
          // Update existing marker
          marker = markers[itemIdentifier].marker;
          const duration = Date.now() - markers[itemIdentifier].lastUpdate;
          marker.slideTo([latitude, longitude], {duration: duration, keepAtCenter: false});
          marker.setRotationAngle(bearing ? parseInt(bearing) : 0); // Re-add rotation for now
          marker.getPopup().setContent(popupContent);
          markers[itemIdentifier].lastUpdate = Date.now();
        } else {
          // Create new marker
          marker = L.marker([latitude, longitude], {
            rotationAngle: bearing ? parseInt(bearing) : 0 // Re-add rotation for now
          }).addTo(map);
          marker.bindPopup(popupContent);
          markers[itemIdentifier] = {marker: marker, lastUpdate: Date.now()};
        }

        marker.options.lineRef = lineRef;

        const listItem = document.createElement('li');
        listItem.innerHTML = `<b>Line:</b> ${lineRef} to ${destinationName}`;
        listItem.onclick = () => {
          map.setView([latitude, longitude], 15);
          marker.openPopup();
        };
        busList.appendChild(listItem);
      }
    }

    // Re-open the popup if it was open before the update
    if (openPopupInfo && markers[openPopupInfo.key]) {
      markers[openPopupInfo.key].marker.openPopup();
    }
    openPopupInfo = null;

  } catch (error) {
    console.error('Error fetching or parsing bus data:', error);
  } finally {
    setTimeout(() => {
      updateIndicator.classList.remove('loading');
    }, 500);
  }
}

const updateNowBtn = document.getElementById('update-now-btn');
updateNowBtn.addEventListener('click', fetchData);

const updateIntervalRadios = document.querySelectorAll('input[name="update-interval"]');
let updateInterval = 500;
let intervalId = null;

function startAutoUpdate() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(fetchData, updateInterval);
}

updateIntervalRadios.forEach(radio => {
  radio.addEventListener('change', (event) => {
    updateInterval = parseInt(event.target.value);
    startAutoUpdate();
  });
});

startAutoUpdate();
fetchData();
fetchBusStops();
fetchTimetables();