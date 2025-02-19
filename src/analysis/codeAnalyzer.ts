import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SCRIPTS_FOLDER = process.env.SCRIPTS_FOLDER || path.join("C:", "temp", "GitClass", "src", "analysis");

console.log(SCRIPTS_FOLDER);
// Función de análisis (por ahora solo imprime los archivos)
export async function analizarCodigo(repoPath:string) {
    try {
        const files = await fs.promises.readdir(SCRIPTS_FOLDER); // Esto ya es asincrónico con 'await'
        console.log('Archivos encontrados:', files);

        for (const file of files) {
            console.log(`📄 Analizando archivo: ${file}`);
            const filePath = path.join(SCRIPTS_FOLDER, file);
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            console.log(`Contenido de ${file}:`, fileContent);
            const lines = fileContent.split('\n');
            console.log(`Número de líneas: ${lines.length}`);
            const words = fileContent.split(/\s+/);
            console.log(`Número de palabras: ${words.length}`);
            const characters = fileContent.split('');
            console.log(`Número de caracteres: ${characters.length}`);
        }

    } catch (error) {
        console.error('Error analizando el código:', error);
    }
}

// Llamar a la función de análisis
analizarCodigo(SCRIPTS_FOLDER);