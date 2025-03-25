// // New endpoint to extract all links from VA-Inventory-Control-03-16-2025.json and save them as links.json
// app.get('/links', (req, res) => {
//   try {
//     // 1. Read the JSON file created earlier
//     const data = fs.readFileSync('VA-Inventory-Control-03-16-2025.json', 'utf-8');
//     const sheetData = JSON.parse(data);

//     // 2. Identify the LINK column from the header row (first row)
//     const headers = sheetData[0];
//     const linkColumnIndex = headers.indexOf('LINK');
//     if (linkColumnIndex === -1) {
//       throw new Error('LINK column not found in JSON data.');
//     }

//     // 3. Extract links from each row starting from index 1
//     const links = sheetData.slice(1)
//       .map(row => row[linkColumnIndex])
//       .filter(link => link); // Filter out any falsy values

//     // 4. Write the extracted links to links.json
//     fs.writeFileSync('links.json', JSON.stringify(links, null, 2), 'utf-8');

//     res.send(`Successfully extracted ${links.length} links to links.json`);
//   } catch (error) {
//     console.error('Error extracting links:', error);
//     res.status(500).send('Error extracting links');
//   }
// });