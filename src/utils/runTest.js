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
exports.runTests = runTests;
exports.codeTest = codeTest;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            console.log("Ejecutando Jest...");
            (0, child_process_1.exec)("jest --json --outputFile=src/reports/jest-results.json", (error, stdout, stderr) => __awaiter(this, void 0, void 0, function* () {
                if (error) {
                    console.error(`Error ejecutando Jest: ${stderr}`);
                    return reject(error);
                }
                console.log("Jest ejecutado con éxito");
                resolve();
            }));
        });
    });
}
function codeTest() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs_1.default.readFile(path_1.default.join(__dirname, '../reports/analysis_results.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading analysis results:', err);
                return console.error('Error reading analysis results:', err);
            }
            const analysisResults = JSON.parse(data);
            return analysisResults;
        });
    });
}
