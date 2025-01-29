// server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

async function scrapeAtCoderContests() {
  try {
    const response = await axios.get('https://atcoder.jp/contests');
    const $ = cheerio.load(response.data);
    const contests = [];

    // Find the upcoming contests table
    $('#contest-table-upcoming tbody tr').each((_, element) => {
      const $tds = $(element).find('td');
      
      // Get start time
      const startTimeStr = $tds.eq(0).find('time').attr('datetime');
      const startTime = new Date(startTimeStr).getTime();
      
      // Get duration
      const durationStr = $tds.eq(2).text().trim();
      const [hours, minutes] = durationStr.split(':').map(Number);
      const duration = (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
      
      // Get contest details
      const contestLink = $tds.eq(1).find('a');
      const title = contestLink.text().trim();
      const url = 'https://atcoder.jp' + contestLink.attr('href');
      
      contests.push({
        site: 'atcoder',
        title,
        url,
        startTime,
        duration,
      });
    });

    return contests;
  } catch (error) {
    console.error('Error scraping AtCoder:', error);
    return [];
  }
}

app.get('/api/atcoder/contests', async (req, res) => {
  try {
    const contests = await scrapeAtCoderContests();
    res.json(contests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AtCoder contests' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});