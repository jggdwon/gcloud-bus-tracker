const map = L.map('map', {
    maxZoom: 18
}).setView([53.58, -0.65], 13);
const busList = document.getElementById('bus-list');
const markers = {};
const updateIndicator = document.getElementById('update-indicator');
let openPopupInfo = null;

const busStopsLayer = L.layerGroup(); // Don't add to map initially
const routeLayer = L.layerGroup().addTo(map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function createBusIcon(size, highlighted = false) {
    return L.divIcon({
        html: '<i class="fa fa-bus"></i>',
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

function getIconByZoom(zoom, highlighted = false) {
    if (zoom < 14) {
        return highlighted ? iconSmallHighlight : iconSmall;
    } else if (zoom < 16) {
        return highlighted ? iconMediumHighlight : iconMedium;
    } else {
        return highlighted ? iconLargeHighlight : iconLarge;
    }
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
    const newBusIcon = getIconByZoom(zoom);
    for (const key in markers) {
        markers[key].setIcon(newBusIcon);
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

function getRouteForBus(lineRef, datedVehicleJourneyRef) {
    if (!timetableData) {
        return null;
    }

    console.log("Searching for route with lineRef:", lineRef, "and datedVehicleJourneyRef:", datedVehicleJourneyRef);

    // Find the VehicleJourney
    const vehicleJourneys = timetableData.getElementsByTagName('VehicleJourney');
    let journey = null;
    for (let i = 0; i < vehicleJourneys.length; i++) {
        const vj = vehicleJourneys[i];
        const ticketMachineEl = vj.getElementsByTagName('TicketMachine')[0];
        if (ticketMachineEl) {
            const journeyCodeEl = ticketMachineEl.getElementsByTagName('JourneyCode')[0];
            if (journeyCodeEl) {
                const journeyCode = journeyCodeEl.textContent;
                if (journeyCode === datedVehicleJourneyRef) {
                    journey = vj;
                    break;
                }
            }
        }
    }

    if (!journey) {
        console.log("VehicleJourney not found");
        return null;
    }

    // Find the JourneyPattern
    const journeyPatternRef = journey.getElementsByTagName('JourneyPatternRef')[0].textContent;
    const journeyPattern = timetableData.querySelector(`JourneyPattern[id="${journeyPatternRef}"]`);

    if (!journeyPattern) {
        console.log("JourneyPattern not found");
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
    if (markers[key].isPopupOpen()) {
      openPopupInfo = {
        key: key,
        content: markers[key].getPopup().getContent()
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
            map.removeLayer(markers[key]);
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
        const directionRef = monitoredVehicleJourney.getElementsByTagName("DirectionRef")[0].textContent;
        const destinationName = monitoredVehicleJourney.getElementsByTagName("DestinationName")[0].textContent;
        const datedVehicleJourneyRef = monitoredVehicleJourney.getElementsByTagName("DatedVehicleJourneyRef")[0].textContent;

        const popupContent = `<b>Line:</b> ${lineRef}<br><b>Direction:</b> ${directionRef}<br><b>Destination:</b> ${destinationName}`;

        let marker;
        if (markers[itemIdentifier]) {
          // Update existing marker
          marker = markers[itemIdentifier];
          marker.setLatLng([latitude, longitude]);
          marker.getPopup().setContent(popupContent);
        } else {
          // Create new marker
          marker = L.marker([latitude, longitude], {
            icon: getIconByZoom(map.getZoom())
          }).addTo(map);
          marker.bindPopup(popupContent);
          markers[itemIdentifier] = marker;
        }

        const listItem = document.createElement('li');
        listItem.innerHTML = `<b>Line:</b> ${lineRef} to ${destinationName}`;
        listItem.onclick = () => {
          map.setView([latitude, longitude], 15);
          marker.openPopup();

          routeLayer.clearLayers();
          const route = getRouteForBus(lineRef, datedVehicleJourneyRef);
          if (route) {
              const polyline = L.polyline(route.coords, {color: 'red'}).addTo(routeLayer);
              map.fitBounds(polyline.getBounds());
              
              route.stopRefs.forEach(stopRef => {
                  const stopMarker = busStopMarkers[stopRef];
                  if(stopMarker) {
                      stopMarker.setIcon(getBusStopIconByZoom(map.getZoom(), true));
                  }
              });
          }
        };
        listItem.onmouseover = () => {
          marker.setIcon(getIconByZoom(map.getZoom(), true));
        };
        listItem.onmouseout = () => {
          marker.setIcon(getIconByZoom(map.getZoom(), false));
        };
        busList.appendChild(listItem);
      }
    }

    // Re-open the popup if it was open before the update
    if (openPopupInfo && markers[openPopupInfo.key]) {
      markers[openPopupInfo.key].openPopup();
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

const updateIntervalSelect = document.getElementById('update-interval');
let updateInterval = parseInt(updateIntervalSelect.value);
let intervalId = null;

function startAutoUpdate() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  intervalId = setInterval(fetchData, updateInterval);
}

updateIntervalSelect.addEventListener('change', (event) => {
  updateInterval = parseInt(event.target.value);
  startAutoUpdate();
});

startAutoUpdate();
fetchData();
fetchBusStops();
fetchTimetables();
