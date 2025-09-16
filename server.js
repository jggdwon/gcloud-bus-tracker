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

app.use(express.static('.'));

const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});