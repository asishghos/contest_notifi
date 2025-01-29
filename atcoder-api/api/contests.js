// api/contests.js
import { Buffer } from 'buffer';

function formatDate(dateStr) {
  const [monthDay, timeStr] = dateStr.split(' ');
  const [month, day] = monthDay.split('/');
  const [hour, minute] = timeStr.split(':');
  
  const year = new Date().getFullYear();
  const date = new Date(year, month - 1, day, hour, minute);
  
  const options = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    hour12: true 
  };
  return date.toLocaleString('en-GB', options).replace(',', '');
}

async function scrapeAtCoderContests() {
  try {
    const response = await fetch('https://atcoder.jp/contests');
    const html = await response.text();
    
    // Find the upcoming contests table
    const tableMatch = html.match(/<div id="contest-table-upcoming"[\s\S]*?<\/table>/);
    if (!tableMatch) {
      console.log('No upcoming contests table found');
      return [];
    }
    
    const tableHtml = tableMatch[0];
    const contests = [];
    
    // Split into rows but skip header
    const rows = tableHtml.split('<tr').slice(2);
    
    for (const row of rows) {
      // More specific regex patterns
      const timeMatch = row.match(/<time class="fixtime fixtime-full">([^<]+)<\/time>/);
      const titleMatch = row.match(/<td class="text-left">\s*<a[^>]*>([^<]+)<\/a>/);
      const durationMatch = row.match(/<td class="text-center">(\d{1,2}:\d{2})<\/td>/);
      const urlMatch = row.match(/<td class="text-left">\s*<a href="([^"]+)"/);
      
      if (timeMatch && titleMatch && durationMatch && urlMatch) {
        const startTimeStr = timeMatch[1];
        const title = titleMatch[1].trim();
        const durationStr = durationMatch[1];
        const url = 'https://atcoder.jp' + urlMatch[1];
        
        // Log each successful match for debugging
        console.log('Found contest:', {
          title,
          startTime: startTimeStr,
          duration: durationStr,
          url
        });
        
        if (title.toLowerCase().includes('beginner')) {
          const [hours, minutes] = durationStr.split(':').map(Number);
          const duration = (hours * 60 + minutes) * 60 * 1000;
          
          contests.push({
            site: 'atcoder',
            title,
            url,
            startTime: formatDate(startTimeStr),
            duration,
          });
        }
      }
    }
    
    // Log final results
    console.log('Total contests found:', contests.length);
    return contests;
  } catch (error) {
    console.error('Error scraping AtCoder:', error);
    throw error;
  }
}

export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
      }
    });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        message: 'Only GET requests are supported'
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }

  try {
    const contests = await scrapeAtCoderContests();
    
    // Log response for debugging
    console.log('Sending response with contests:', contests);
    
    return new Response(
      JSON.stringify(contests),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch AtCoder contests',
        message: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}