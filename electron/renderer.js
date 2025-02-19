const fs = require('fs');
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
    const resultsPath = path.join(__dirname, '../jest-results.json');
    console.log('Reading Jest results from:', resultsPath);
    fs.readFile(resultsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading Jest results:', err);
            return;
        }

        const results = JSON.parse(data);
        const resultsElement = document.getElementById('results');
        resultsElement.textContent = JSON.stringify(results, null, 2);
    });
});