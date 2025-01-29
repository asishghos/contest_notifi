// server.js
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

// Function to format the date in a readable way
function formatDate(dateStr) {
  const [monthDay, timeStr] = dateStr.split(' ');
  const [month, day] = monthDay.split('/');
  const [hour, minute] = timeStr.split(':');
  
  // Get the full year for the date (assuming current year for now)
  const year = new Date().getFullYear();
  
  // Create a date object using current year, month, day, hour, and minute
  const date = new Date(year, month - 1, day, hour, minute);
  
  // Format the date for better readability (e.g., 1st February at 5:30 PM)
  const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  return date.toLocaleString('en-GB', options).replace(',', ''); // Convert to local format
}

async function scrapeAtCoderContests() {
  try {
    const response = await axios.get('https://atcoder.jp/contests');
    const $ = cheerio.load(response.data);
    const contests = [];

    // Find the upcoming contests table
    $('#contest-table-upcoming tbody tr').each((_, element) => {
      const $tds = $(element).find('td');
      
      // Get start time (e.g., "2/1(Sat) 17:30")
      const startTimeStr = $tds.eq(0).find('time').text().trim();
      const formattedStartTime = formatDate(startTimeStr); // Convert to readable format
      
      // Get contest duration (e.g., "2:00")
      const durationStr = $tds.eq(2).text().trim();
      const [hours, minutes] = durationStr.split(':').map(Number);
      const duration = (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
      
      // Get contest details
      const contestLink = $tds.eq(1).find('a');
      const title = contestLink.text().trim();
      const url = 'https://atcoder.jp' + contestLink.attr('href');
      
      // Filter only Beginner contests (C Beginner contests)
      if (title.toLowerCase().includes('beginner')) {
        contests.push({
          site: 'atcoder',
          title,
          url,
          startTime: formattedStartTime,
          duration,
        });
      }
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
