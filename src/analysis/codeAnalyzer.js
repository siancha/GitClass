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
const SCRIPTS_FOLDER = process.env.SCRIPTS_FOLDER || path_1.default.join("C:", "temp", "GitClass", "src", "analysis");
console.log(SCRIPTS_FOLDER);
// Función de análisis (por ahora solo imprime los archivos)
function analizarCodigo(repoPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const files = yield fs_1.default.promises.readdir(SCRIPTS_FOLDER); // Esto ya es asincrónico con 'await'
            console.log('Archivos encontrados:', files);
            for (const file of files) {
                console.log(`📄 Analizando archivo: ${file}`);
                const filePath = path_1.default.join(SCRIPTS_FOLDER, file);
                const fileContent = yield fs_1.default.promises.readFile(filePath, 'utf-8');
                console.log(`Contenido de ${file}:`, fileContent);
                const lines = fileContent.split('\n');
                console.log(`Número de líneas: ${lines.length}`);
                const words = fileContent.split(/\s+/);
                console.log(`Número de palabras: ${words.length}`);
                const characters = fileContent.split('');
                console.log(`Número de caracteres: ${characters.length}`);
            }
        }
        catch (error) {
            console.error('Error analizando el código:', error);
        }
    });
}
// Llamar a la función de análisis
analizarCodigo(SCRIPTS_FOLDER);
