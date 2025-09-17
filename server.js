const express = require('express');
const axios = require('axios');
const app = express();

// --- Configuration ---
if (!process.env.BODS_API_KEY) {
    console.warn('WARNING: BODS_API_KEY environment variable not set. Using fallback key.');
    process.env.BODS_API_KEY = '5e8712586106b035a1b77be6315c7af2c9ced860';
}
const apiKey = process.env.BODS_API_KEY;
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// --- In-Memory Cache ---
const cache = {
    busStops: { data: null, timestamp: 0 },
    timetables: { data: null, timestamp: 0 },
};

// --- Utility Functions ---
function parseCsv(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 1) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentline = lines[i].split(',');
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]?.trim().replace(/"/g, '');
        }
        result.push(obj);
    }
    return result;
}

// --- API Routes ---
app.get('/api', async (req, res) => {
  try {
    const queryString = req.url.split('?')[1];
    const targetUrl = `https://data.bus-data.dft.gov.uk/api/v1/datafeed?${queryString}&api_key=${apiKey}`;
    const response = await axios.get(targetUrl, { headers: { 'User-Agent': 'BusTracker/1.0' } });
    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error in proxy:', error.message);
    res.status(500).send('Error in proxy');
  }
});

app.get('/bus-stops', async (req, res) => {
    if (Date.now() - cache.busStops.timestamp < CACHE_DURATION_MS) {
        console.log('Serving bus stops from cache.');
        return res.json(cache.busStops.data);
    }
    try {
        const targetUrl = 'https://naptan.api.dft.gov.uk/v1/access-nodes?atcoAreaCodes=227&dataFormat=csv';
        console.log('Fetching fresh bus stops data.');
        const response = await axios.get(targetUrl, { headers: { 'accept': 'text/csv', 'User-Agent': 'BusTracker/1.0' } });
        const parsedData = parseCsv(response.data);
        cache.busStops = { data: parsedData, timestamp: Date.now() };
        res.json(parsedData);
    } catch (error) {
        console.error('Error fetching bus stops:', error.message);
        res.status(500).send('Error fetching bus stops');
    }
});

app.get('/timetables', async (req, res) => {
    if (Date.now() - cache.timetables.timestamp < CACHE_DURATION_MS) {
        console.log('Serving timetables from cache.');
        return res.send(cache.timetables.data);
    }
    try {
        const listUrl = `https://data.bus-data.dft.gov.uk/api/v1/dataset/?adminArea=227&api_key=${apiKey}`;
        console.log('Fetching fresh timetables list.');
        const listResponse = await axios.get(listUrl, { headers: { 'accept': 'application/json', 'User-Agent': 'BusTracker/1.0' } });
        const firstDataset = listResponse.data.results[0];
        if (firstDataset) {
            const response = await axios.get(firstDataset.url, { headers: { 'User-Agent': 'BusTracker/1.0' } });
            cache.timetables = { data: response.data, timestamp: Date.now() };
            res.send(response.data);
        } else {
            res.status(404).send('No timetable datasets found');
        }
    } catch (error) {
        console.error('Error fetching timetables:', error.message);
        res.status(500).send('Error fetching timetables');
    }
});

// --- Static File Serving & Server Start ---

// Disable caching for all static files
app.use(express.static(__dirname, {
    etag: false,
    lastModified: false,
    setHeaders: (res, path, stat) => {
        res.set('Cache-Control', 'no-store');
    },
}));

const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
