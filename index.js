const express = require('express');
const XLSX = require('xlsx');
const puppeteer = require('puppeteer');

const app = express();

app.get('/', async (req, res) => {
    try {
        // 1. Read the Excel file
        const workbook = XLSX.readFile('VA-Inventory-Control-03-16-2025.xlsx');
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // 2. Convert the first sheet to JSON array-of-arrays (header: 1 keeps raw rows)
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        //    The first row is the header row. We find which column is "LINK".
        const headers = sheetData[0];
        const linkColumnIndex = headers.indexOf('LINK');

        //    The second row (index 1) should be the first data row
        const firstDataRow = sheetData[1];
        const firstLink = firstDataRow[linkColumnIndex];

        // 3. Launch Puppeteer (in non-headless mode to open Chrome visibly)
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // 4. Navigate to the first link
        await page.goto(firstLink, { waitUntil: 'networkidle2' });

        // (Optional) Do whatever scraping or interaction you want here
        // For now, we just show that we've accessed the link.

        // Close the browser if you want, or keep it open
        // await browser.close();

        // Send a response back to the browser
        res.send(`Successfully accessed the link: ${firstLink}`);
    } catch (error) {
        console.error('Error accessing the link:', error);
        res.status(500).send('Error occurred while accessing the link');
    }
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
