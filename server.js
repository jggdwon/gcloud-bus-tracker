const express = require('express');
const axios = require('axios');
const app = express();

const apiKey = '5e8712586106b035a1b77be6315c7af2c9ced860';

app.get('/api', async (req, res) => {
  try {
    const queryString = req.url.split('?')[1];
    const targetUrl = `https://data.bus-data.dft.gov.uk/api/v1/datafeed?${queryString}&api_key=${apiKey}`;

    console.log(`Proxying request to: ${targetUrl}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      }
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error in proxy:', error.message);
    res.status(500).send('Error in proxy');
  }
});

function parseCsv(csv) {
    const lines = csv.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }
        result.push(obj);
    }
    return result;
}

app.get('/bus-stops', async (req, res) => {
  try {
    const targetUrl = 'https://naptan.api.dft.gov.uk/v1/access-nodes?atcoAreaCodes=227&dataFormat=csv';
    console.log(`Fetching bus stops from: ${targetUrl}`);

    const response = await axios.get(targetUrl, {
      headers: {
        'accept': 'text/csv',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      }
    });

    const parsedData = parseCsv(response.data);
    res.json(parsedData);
  } catch (error) {
    console.error('Error fetching bus stops:', error.message);
    res.status(500).send('Error fetching bus stops');
  }
});

app.get('/timetables', async (req, res) => {
  try {
    const listUrl = `https://data.bus-data.dft.gov.uk/api/v1/dataset/?adminArea=227&api_key=${apiKey}`;
    console.log(`Fetching timetables list from: ${listUrl}`);

    const listResponse = await axios.get(listUrl, {
      headers: {
        'accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
      }
    });

    const firstDataset = listResponse.data.results[0];
    if (firstDataset) {
      const targetUrl = firstDataset.url;
      console.log(`Fetching timetable data from: ${targetUrl}`);

      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'
        }
      });
      console.log('Timetable data:', response.data);
      res.send(response.data);
    } else {
      res.status(404).send('No timetable datasets found');
    }
  } catch (error) {
    console.error('Error fetching timetables:', error.message);
    res.status(500).send('Error fetching timetables');
  }
});

app.use(express.static('.'));

const port = 80;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});