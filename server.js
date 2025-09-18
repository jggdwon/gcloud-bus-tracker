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

app.get('/timetable-for-line', async (req, res) => {
    const { lineRef } = req.query;
    if (!lineRef) {
        return res.status(400).send('lineRef parameter is required');
    }

    const datasetIdCacheKey = `dataset_id_${lineRef}`;
    const timetableCacheKey = `timetable_${lineRef}`;

    // Check for cached timetable data first
    if (cache[timetableCacheKey] && Date.now() - cache[timetableCacheKey].timestamp < CACHE_DURATION_MS) {
        console.log(`Serving timetable for line ${lineRef} from cache.`);
        return res.send(cache[timetableCacheKey].data);
    }

    try {
        let datasetId = cache[datasetIdCacheKey]?.data;

        // If we don't have the dataset ID cached, find it
        if (!datasetId) {
            console.log(`No dataset ID cached for line ${lineRef}. Searching...`);
            const listUrl = `https://data.bus-data.dft.gov.uk/api/v1/dataset/?noc=HNTS&api_key=${apiKey}`;
            const listResponse = await axios.get(listUrl, { headers: { 'accept': 'application/json', 'User-Agent': 'BusTracker/1.0' } });
            const datasets = listResponse.data.results;
            const targetDataset = datasets.find(d => {
                const name = d.name.toLowerCase();
                const desc = d.description.toLowerCase();
                const line = lineRef.toLowerCase();
                return name.includes(line) || desc.includes(line);
            });

            if (targetDataset) {
                datasetId = targetDataset.id;
                cache[datasetIdCacheKey] = { data: datasetId, timestamp: Date.now() };
                console.log(`Found and cached dataset ID ${datasetId} for line ${lineRef}.`);
            } else {
                return res.status(404).send(`No timetable dataset found for line ${lineRef}`);
            }
        }

        // Now, use the dataset ID to get the actual data URL
        console.log(`Fetching metadata for dataset ${datasetId}`);
        const datasetUrl = `https://data.bus-data.dft.gov.uk/api/v1/dataset/${datasetId}/?api_key=${apiKey}`;
        const datasetResponse = await axios.get(datasetUrl, { headers: { 'User-Agent': 'BusTracker/1.0' } });
        
        const downloadUrl = datasetResponse.data.url;
        console.log(`Downloading timetable from: ${downloadUrl}`);
        const timetableResponse = await axios.get(downloadUrl, { headers: { 'User-Agent': 'BusTracker/1.0' } });

        cache[timetableCacheKey] = { data: timetableResponse.data, timestamp: Date.now() };
        res.send(timetableResponse.data);

    } catch (error) {
        console.error(`Error fetching timetable for line ${lineRef}:`, error.message);
        res.status(500).send(`Error fetching timetable for line ${lineRef}`);
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

const port = 9000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
