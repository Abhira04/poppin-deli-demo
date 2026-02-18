const https = require('https');

const SHEET_ID = '1OIGx_iPzHohQ0lcOeNdC0czcZiMQYrCK77sqTgXYBgg';
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

function fetchSheet() {
    console.log(`Fetching ${url}...`);

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Response length:', data.length);

            const jsonStart = data.indexOf('{');
            const jsonEnd = data.lastIndexOf('}');

            if (jsonStart === -1 || jsonEnd === -1) {
                console.error('Invalid JSON response');
                console.log('Snippet:', data.substring(0, 100));
                return;
            }

            const jsonString = data.substring(jsonStart, jsonEnd + 1);
            try {
                const jsonData = JSON.parse(jsonString);

                if (!jsonData.table || !jsonData.table.rows) {
                    console.error('No table data found');
                    return;
                }

                const { cols, rows } = jsonData.table;
                console.log('Columns found:', cols.map(c => c.label || c.id));

                console.log('First 3 Rows:');
                rows.slice(0, 3).forEach(row => {
                    const values = row.c.map(cell => cell ? (cell.v || '') : '');
                    console.log(values);
                });
            } catch (e) {
                console.error('Failed to parse JSON:', e);
            }
        });

    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
}

fetchSheet();
