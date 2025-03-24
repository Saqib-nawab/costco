const express = require('express');
const XLSX = require('xlsx');
const fs = require('fs');
const { chromium } = require('playwright');

const app = express();

// Endpoint to convert XLSX to JSON and save it as VA-Inventory-Control-03-16-2025.json
app.get('/convert', (req, res) => {
  try {
    // 1. Read the Excel file
    const workbook = XLSX.readFile('VA-Inventory-Control-03-16-2025.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // 2. Convert the worksheet to a JSON array-of-arrays (each row as an array)
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // 3. Write the JSON data to a file
    fs.writeFileSync('VA-Inventory-Control-03-16-2025.json', JSON.stringify(sheetData, null, 2), 'utf-8');

    res.send('JSON file (VA-Inventory-Control-03-16-2025.json) created successfully.');
  } catch (error) {
    console.error('Error converting XLSX to JSON:', error);
    res.status(500).send('Error converting XLSX to JSON');
  }
});

// Endpoint to read VA-Inventory-Control-03-16-2025.json, extract the first LINK, and access it via Playwright
app.get('/scrape', async (req, res) => {
  try {
    // 1. Read the JSON file created earlier
    const data = fs.readFileSync('VA-Inventory-Control-03-16-2025.json', 'utf-8');
    const sheetData = JSON.parse(data);

    // 2. Identify the LINK column from the header row (first row)
    const headers = sheetData[0];
    const linkColumnIndex = headers.indexOf('LINK');
    if (linkColumnIndex === -1) {
      throw new Error('LINK column not found in JSON data.');
    }

    // 3. Get the first data row (assumed to be at index 1)
    const firstDataRow = sheetData[1];
    const firstLink = firstDataRow[linkColumnIndex];
    if (!firstLink) {
      throw new Error('No link found in the first data row.');
    }

    // 4. Launch Playwright (Chromium) in non-headless mode and open a new page
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();

    // 5. Navigate to the first link, waiting until the network is idle
    await page.goto(firstLink, { waitUntil: 'networkidle' });

    // 6. Wait for an additional 10 seconds to ensure the page has fully loaded
    await new Promise(resolve => setTimeout(resolve, 30000));

    // 7. Close the browser
    await browser.close();

    res.send(`Successfully accessed the link: ${firstLink}`);
  } catch (error) {
    console.error('Error accessing the link:', error);
    res.status(500).send('Error occurred while accessing the link');
  }
});

// Default endpoint with instructions
app.get('/', (req, res) => {
  res.send('Use /convert to generate VA-Inventory-Control-03-16-2025.json and /scrape to access the link from the JSON file.');
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
