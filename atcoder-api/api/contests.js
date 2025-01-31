const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/contests', async (req, res) => {
  try {
    // Fetch the AtCoder contests page
    const response = await axios.get('https://atcoder.jp/contests/');
    const $ = cheerio.load(response.data);

    // Extract upcoming contests
    const contests = [];
    $('#contest-table-upcoming tbody tr').each((index, element) => {
      const columns = $(element).find('td');
      
      const startTime = $(columns[0]).text().trim();
      const contestLink = $(columns[1]).find('a');
      const title = contestLink.text().trim();
      const url = `https://atcoder.jp${contestLink.attr('href')}`;
      const durationText = $(columns[2]).text().trim();
      
      // Convert duration to milliseconds
      const [hours, minutes] = durationText.split(':').map(Number);
      const duration = (hours * 60 + minutes) * 60 * 1000;

      contests.push({
        site: 'atcoder',
        title,
        url,
        startTime,
        duration
      });
    });

    res.json(contests);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch AtCoder contests',
      message: error.message 
    });
  }
});

module.exports = app;