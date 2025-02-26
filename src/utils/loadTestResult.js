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
exports.loadTestResults = loadTestResults;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadTestResults() {
    return __awaiter(this, void 0, void 0, function* () {
        const filePath = path_1.default.join(__dirname, '../reports/jest-results.json');
        //const filePath = path.join(__dirname, '../../jest-results.json');
        try {
            const data = yield fs_1.default.promises.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error loading test results:', error);
            throw error;
        }
    });
}
console.log('🔔 Cargando resultados de pruebas...');
loadTestResults().then((results) => {
    console.log('✅ Resultados de pruebas cargados:', results);
});
