async function fetchData() {
  const debugOutput = document.getElementById('debug-output');
  debugOutput.innerHTML = 'fetchData() called.';

  const minLon = -0.70;
  const minLat = 53.53;
  const maxLon = -0.60;
  const maxLat = 53.63;

  const apiUrl = `/api?boundingBox=${minLon},${minLat},${maxLon},${maxLat}`;
  debugOutput.innerHTML += `<br>Requesting URL: ${apiUrl}`;

  try {
    const response = await fetch(apiUrl);
    debugOutput.innerHTML += `<br>Response status: ${response.status}`;
    const data = await response.text();
    document.getElementById('bus-data').textContent = data;
  } catch (error) {
    debugOutput.innerHTML += `<br>Error: ${error.message}`;
    console.error('Error fetching bus data:', error);
  }
}

fetchData();

