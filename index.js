const express = require('express');
const fs = require('fs');
const { chromium } = require('playwright');

const app = express();

// Endpoint to read links.json, extract the first link, access it via Playwright,
// wait for the network to be idle, then wait an additional 3 seconds before closing.
app.get('/scrape', async (req, res) => {
  try {
    // 1. Read links.json and parse it
    const linksData = fs.readFileSync('links.json', 'utf-8');
    const links = JSON.parse(linksData);

    if (!Array.isArray(links) || links.length === 0) {
      throw new Error('No links found in links.json');
    }

    const firstLink = links[0];

    // 2. Launch Playwright (Chromium) and open a new page
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    // 3. Navigate to the first link (using default wait), then explicitly wait for network idle
    await page.goto(firstLink);
    await page.waitForLoadState('networkidle');

    // 4. Wait for an additional 3 seconds using a promise with setTimeout
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Close the browser
    await browser.close();

    res.send(`Successfully accessed the link: ${firstLink} and closed it after 3 seconds.`);
  } catch (error) {
    console.error('Error accessing the link:', error);
    res.status(500).send('Error occurred while accessing the link');
  }
});

// Default endpoint with instructions
app.get('/', (req, res) => {
  res.send('Use /scrape to access the first link from links.json and close it after 3 seconds.');
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
