const fs = require('fs');
const path = require('path');

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const results = await window.electronAPI.getJestResults();
        const resultsElement = document.getElementById('results');
        resultsElement.textContent = JSON.stringify(results, null, 2);
    } catch (error) {
        console.error('Error al obtener resultados de Jest:', error);
    }
});