import { exec } from "child_process";
import fs from "fs";
import path from "path";


export async function runTests(): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log("Ejecutando Jest...");
        exec("jest --json --outputFile=src/reports/jest-results.json", async (error, stdout, stderr) => {
            if (error) {
                console.error(`Error ejecutando Jest: ${stderr}`);
                return reject(error);
            }
            console.log("Jest ejecutado con éxito");
            resolve();
        });
    });
}

export async function codeTest(): Promise<void> {
    await fs.readFile(path.join(__dirname, '../reports/analysis_results.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading analysis results:', err);
                return console.error('Error reading analysis results:', err);
            }
            const analysisResults = JSON.parse(data);
            return analysisResults;
        });
}

