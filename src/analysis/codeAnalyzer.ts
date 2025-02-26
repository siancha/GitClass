import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SCRIPTS_FOLDER = process.env.SCRIPTS_FOLDER || path.join("C:", "temp", "GitClass", "src", "tests");

console.log(`SCRIPTS_FOLDER: ${SCRIPTS_FOLDER}`);

// Función de análisis (por ahora solo imprime los archivos)
export async function analizarCodigo(repoPath:string) {
    try {
        const files = await fs.promises.readdir(repoPath); // Esto ya es asincrónico con 'await'
        console.log('Archivos encontrados:', files);

        for (const file of files) {
            console.log(`📄 Analizando archivo: ${file}`);
            const filePath = path.join(repoPath, file);
            const fileContent = await fs.promises.readFile(filePath, 'utf-8');
            console.log(`Contenido de ${file}:`, fileContent);
            const lines = fileContent.split('\n');
            console.log(`Número de líneas: ${lines.length}`);
            const words = fileContent.split(/\s+/);
            console.log(`Número de palabras: ${words.length}`);
            const characters = fileContent.split('');
            console.log(`Número de caracteres: ${characters.length}`);

            // Análisis adicional
            const commentLines = lines.filter(line => line.trim().startsWith('//')).length;
            console.log(`Número de líneas de comentarios: ${commentLines}`);

            const functionMatches = fileContent.match(/function\s+\w+\s*\(/g) || [];
            console.log(`Número de funciones: ${functionMatches.length}`);

            const variableMatches = fileContent.match(/(const|let|var)\s+\w+/g) || [];
            console.log(`Número de variables: ${variableMatches.length}`);

            // Complejidad Ciclomática
            const complexity = calculateCyclomaticComplexity(fileContent);
            console.log(`Complejidad ciclomática: ${complexity}`);

            // Profundidad de Anidamiento
            const maxNestingDepth = calculateMaxNestingDepth(lines);
            console.log(`Profundidad máxima de anidamiento: ${maxNestingDepth}`);

            // Longitud de las Funciones
            const functionDetails = calculateFunctionDetails(fileContent);
            console.log(`Detalles de las funciones:`, functionDetails);
        
        }

    } catch (error) {
        const messageError = (error as Error).message;
        console.error('Error analizando el código:', messageError);
    }
}

// Función para calcular la complejidad ciclomática
function calculateCyclomaticComplexity(content: string): number {
    const matches = content.match(/if|else|for|while|case|catch|throw|return|&&|\|\|/g) || [];
    return matches.length + 1;
}

// Función para calcular la profundidad máxima de anidamiento
function calculateMaxNestingDepth(lines: string[]): number {
    let maxDepth = 0;
    let currentDepth = 0;
    for (const line of lines) {
        if (line.includes('{')) {
            currentDepth++;
            if (currentDepth > maxDepth) {
                maxDepth = currentDepth;
            }
        }
        if (line.includes('}')) {
            currentDepth--;
        }
    }
    return maxDepth;
}

// Función para calcular los detalles de las funciones
function calculateFunctionDetails(content: string): { name: string, length: number, startLine: number, endLine: number }[] {
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}/g;
    const functions = [];
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
        const functionName = match[1];
        const functionBody = match[0];
        const startLine = content.substring(0, match.index).split('\n').length;
        const endLine = startLine + functionBody.split('\n').length - 1;
        functions.push({
            name: functionName,
            length: functionBody.split('\n').length,
            startLine: startLine,
            endLine: endLine
        });
    }
    return functions;
}


// Llamar a la función de análisis
analizarCodigo(SCRIPTS_FOLDER);
