import fs from 'fs';
import path from 'path';

export async function loadTestResults(): Promise<any> {
    const filePath = path.join(__dirname, '../reports/jest-results.json');
    //const filePath = path.join(__dirname, '../../jest-results.json');
    try {
        const data = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading test results:', error);
        throw error;
    }
}

console.log('🔔 Cargando resultados de pruebas...')
loadTestResults().then((results) => {
    console.log('✅ Resultados de pruebas cargados:', results);
});
