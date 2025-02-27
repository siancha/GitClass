import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const SCRIPTS_FOLDER = process.env.SCRIPTS_FOLDER || path.join("C:", "temp", "GitClass", "src", "tests");

console.log(`SCRIPTS_FOLDER: ${SCRIPTS_FOLDER}`);

// Función de análisis (por ahora solo imprime los archivos)
export async function analizarCodigo(repoPath:string) {
    const allAnalysisResults: any[] = [];
    try {
        const files = await fs.promises.readdir(repoPath); // Lista los archivos y carpetas
        console.log('Archivos encontrados:', files);

        for (const file of files) {
            const filePath = path.join(repoPath, file);
            const stat = await fs.promises.stat(filePath); // Obtenemos información del archivo o directorio

            if (stat.isDirectory()) {
                console.log(`🚪 Encontrada carpeta: ${filePath}`);
                // Si es un directorio, hacer un análisis recursivo
                const folderAnalysisResults = await analizarCodigo(filePath);
                allAnalysisResults.push({
                    folder: filePath,
                    results: folderAnalysisResults,
                });
            } else {
                // Filtrar por extensión (.ts o .js)
                const extname = path.extname(file).toLowerCase();
                if (extname === '.ts' || extname === '.js') {
                    //console.log(`📄 Analizando archivo: ${filePath}`);
                    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
                    //console.log(`Contenido de ${file}:`, fileContent);
                    const lines = fileContent.split('\n');
                    //console.log(`Número de líneas: ${lines.length}`);
                    const words = fileContent.split(/\s+/);
                    //console.log(`Número de palabras: ${words.length}`);
                    const characters = fileContent.split('');
                    //console.log(`Número de caracteres: ${characters.length}`);

                    // Análisis adicional
                    const commentLines = lines.filter(line => line.trim().startsWith('//')).length;
                    //console.log(`Número de líneas de comentarios: ${commentLines}`);

                    const functionMatches = fileContent.match(/function\s+\w+\s*\(|const\s+\w+\s*=\s*function\s*\(|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{|let\s+\w+\s*=\s*function\s*\(|let\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{|var\s+\w+\s*=\s*function\s*\(|var\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{|export\s+function\s+\w+\s*\(/g) || [];
                    //console.log(`Número de funciones: ${functionMatches.length}`);

                    const variableMatches = fileContent.match(/(const|let|var)\s+\w+/g) || [];
                    //console.log(`Número de variables: ${variableMatches.length}`);

                    // Complejidad Ciclomática
                    const complexity = calculateCyclomaticComplexity(fileContent);
                    //console.log(`Complejidad ciclomática: ${complexity}`);

                    // Profundidad de Anidamiento
                    const maxNestingDepth = calculateMaxNestingDepth(lines);
                    //console.log(`Profundidad máxima de anidamiento: ${maxNestingDepth}`);

                    // Longitud de las Funciones
                    const functionDetails = calculateFunctionDetails(fileContent);
                    //console.log(`Detalles de las funciones:`, functionDetails);

                    // Almacenar los resultados del archivo en el array
                    allAnalysisResults.push({
                        filePath,
                        numberOfLines: lines.length,
                        numberOfWords: words.length,
                        numberOfCharacters: characters.length,
                        numberOfComments: commentLines,
                        numberOfFunctions: functionMatches.length,
                        numberOfVariables: variableMatches.length,
                        cyclomaticComplexity: complexity,
                        maxNestingDepth,
                        functionDetails,
                    });
                }
            }
        }
    // Guardar los resultados al finalizar el análisis de todas las carpetas
    const outputPath = path.join('src', 'reports', 'analysis_results.json');
    try {
        await fs.promises.writeFile(outputPath, JSON.stringify(allAnalysisResults, null, 2));
        console.log('Resultados guardados en analysis_results.json');
    } catch (error) {
        console.error('Error al guardar el archivo:', error);
    } 

    } catch (error) {
        const messageError = (error as Error).message;
        console.error('Error analizando el código:', messageError);
    }

    return allAnalysisResults;
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
    const functionRegex = /export\s+function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}|function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}|const\s+\w+\s*=\s*function\s*\([^)]*\)\s*{[^}]*}|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*}|let\s+\w+\s*=\s*function\s*\([^)]*\)\s*{[^}]*}|let\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*}|var\s+\w+\s*=\s*function\s*\([^)]*\)\s*{[^}]*}|var\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*}/g;
    const functions = [];
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
        const functionName = match[1] || match[2];
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
//analizarCodigo(SCRIPTS_FOLDER);
