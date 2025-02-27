"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analizarCodigo = analizarCodigo;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const SCRIPTS_FOLDER = process.env.SCRIPTS_FOLDER || path_1.default.join("C:", "temp", "GitClass", "src", "tests");
console.log(`SCRIPTS_FOLDER: ${SCRIPTS_FOLDER}`);
// Función de análisis (por ahora solo imprime los archivos)
function analizarCodigo(repoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const allAnalysisResults = [];
        try {
            const files = yield fs_1.default.promises.readdir(repoPath); // Lista los archivos y carpetas
            console.log('Archivos encontrados:', files);
            for (const file of files) {
                const filePath = path_1.default.join(repoPath, file);
                const stat = yield fs_1.default.promises.stat(filePath); // Obtenemos información del archivo o directorio
                if (stat.isDirectory()) {
                    console.log(`🚪 Encontrada carpeta: ${filePath}`);
                    // Si es un directorio, hacer un análisis recursivo
                    const folderAnalysisResults = yield analizarCodigo(filePath);
                    allAnalysisResults.push({
                        folder: filePath,
                        results: folderAnalysisResults,
                    });
                }
                else {
                    // Filtrar por extensión (.ts o .js)
                    const extname = path_1.default.extname(file).toLowerCase();
                    if (extname === '.ts' || extname === '.js') {
                        //console.log(`📄 Analizando archivo: ${filePath}`);
                        const fileContent = yield fs_1.default.promises.readFile(filePath, 'utf-8');
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
            const outputPath = path_1.default.join('src', 'reports', 'analysis_results.json');
            try {
                yield fs_1.default.promises.writeFile(outputPath, JSON.stringify(allAnalysisResults, null, 2));
                console.log('Resultados guardados en analysis_results.json');
            }
            catch (error) {
                console.error('Error al guardar el archivo:', error);
            }
        }
        catch (error) {
            const messageError = error.message;
            console.error('Error analizando el código:', messageError);
        }
        return allAnalysisResults;
    });
}
// Función para calcular la complejidad ciclomática
function calculateCyclomaticComplexity(content) {
    const matches = content.match(/if|else|for|while|case|catch|throw|return|&&|\|\|/g) || [];
    return matches.length + 1;
}
// Función para calcular la profundidad máxima de anidamiento
function calculateMaxNestingDepth(lines) {
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
function calculateFunctionDetails(content) {
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
