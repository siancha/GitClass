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
exports.start = start;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const ngrok_1 = require("@ngrok/ngrok");
const codeAnalyzer_1 = require("../analysis/codeAnalyzer");
const axios_1 = __importDefault(require("axios"));
const deleteFolder_1 = require("../utils/deleteFolder");
const runTest_1 = require("../utils/runTest");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 1234;
const TEMP_FOLDER = process.env.TEMP_FOLDER || path_1.default.join("C:", "temp"); // Carpeta temporal para análisis
const SCRIPTS_FOLDER = path_1.default.join("C:", "temp", "GitClass", "src");
const SCRIPTS_TEST = path_1.default.join("C:", "temp", "GitClass");
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../public'));
// Servir archivos estáticos desde la carpeta 'public'
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use(body_parser_1.default.json());
// Verificar que la carpeta temp existe
if (!fs_1.default.existsSync(TEMP_FOLDER)) {
    fs_1.default.mkdirSync(TEMP_FOLDER);
    console.log(`📁 Carpeta temporal creada: ${TEMP_FOLDER}`);
}
app.get('/about', (req, res) => {
    res.render('about');
});
app.get('/documentacion', (req, res) => {
    res.render('documentacion');
});
app.get('/codeTest', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resultsPath = path_1.default.join(__dirname, '../reports/analysis_results.json');
    (0, codeAnalyzer_1.analizarCodigo)(SCRIPTS_FOLDER);
    try {
        const data = yield fs_1.default.promises.readFile(resultsPath, 'utf8');
        const analysisResults = yield JSON.parse(data);
        res.render('codeTest', { analysisResults });
    }
    catch (error) {
        console.error('Error reading analysis results:', error);
        res.status(500).send('Error reading analysis results');
    }
}));
app.get('/reports', (req, res) => {
    const resultsPath = path_1.default.join(__dirname, '../reports/jest-results.json');
    console.log('📄 Leyendo resultados de Jest:', resultsPath);
    let results = {};
    try {
        const data = fs_1.default.readFileSync(resultsPath, 'utf8');
        results = JSON.parse(data);
    }
    catch (error) {
        console.error('Error reading Jest results:', error);
        results = { error: 'No se pudo leer el archivo de resultados.' };
    }
    res.render('reports', { results });
});
// Endpoint para ejecutar los tests
app.post("/run-tests", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, codeAnalyzer_1.analizarCodigo)(SCRIPTS_FOLDER);
        yield (0, runTest_1.runTests)();
        res.sendStatus(200);
    }
    catch (error) {
        console.error("❌ Error ejecutando pruebas:", error);
        const errorMessage = error.message;
        res.status(500).send(errorMessage);
    }
}));
// Ruta del Webhook
app.post("/webhook/github", (req, res) => {
    // Eliminar el folder clonado si ya existe
    (0, deleteFolder_1.deleteFolderRecursive)(SCRIPTS_TEST);
    console.log("🔔 Webhook recibido:", req.headers["x-github-event"]);
    console.log("📦 Payload:", JSON.stringify(req.body, null, 2));
    const event = req.headers["x-github-event"];
    const payload = req.body;
    console.log("🔔 Webhook recibido:", event);
    if (event === "push") {
        const repoUrl = payload.repository.clone_url;
        const commitHash = payload.after;
        const repoName = payload.repository.name;
        console.log(`🔔 Nuevo commit detectado en ${repoName}`);
        console.log(`🔄 Clonando repositorio: ${repoUrl}`);
        const repoPath = path_1.default.join(TEMP_FOLDER, repoName);
        const safeRepoPath = `"${repoPath}"`;
        // Clonar el repositorio
        (0, child_process_1.exec)(`git clone ${repoUrl} ${safeRepoPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error al clonar repo: ${error.message}`);
                return res.sendStatus(500);
            }
            console.log(`✅ Repositorio clonado: ${repoPath}`);
            console.log(`📂 Analizando código...`);
            // Llamar a la función de análisis
            (0, codeAnalyzer_1.analizarCodigo)(SCRIPTS_FOLDER);
            // Enviar respuesta exitosa
            res.sendStatus(200);
        });
    }
    else {
        res.sendStatus(400);
    }
});
// 🟢 Ruta raíz para evitar errores 404
app.get("/", (req, res) => {
    console.log("🔔 Webhook recibido:", req.headers["x-github-event"]);
    console.log("📦 Payload:", JSON.stringify(req.body, null, 2));
    res.send("✅ Servidor Webhook activo");
});
// Iniciar servidor
// Función para iniciar el servidor
function start() {
    app.listen(PORT, () => __awaiter(this, void 0, void 0, function* () {
        console.log(`🚀 Servidor Webhook corriendo en http://localhost:${PORT}`);
        // Exponer servidor con Ngrok
        try {
            const listener = yield (0, ngrok_1.connect)({ addr: PORT, authtoken: process.env.NGROK_AUTHTOKEN });
            const ngrokUrl = listener.url();
            console.log(`🌍 Ngrok activo en: ${ngrokUrl}`);
            if (ngrokUrl) {
                console.log(`🌍 Ngrok activo en: ${ngrokUrl}`);
                // Guardar la URL de Ngrok en un archivo
                fs_1.default.writeFileSync("ngrok-url.txt", ngrokUrl);
                // Actualizar el webhook de GitHub
                const githubWebhookUrl = process.env.GITHUB_WEBHOOK_URL; // URL del webhook de GitHub
                if (!githubWebhookUrl) {
                    throw new Error("GITHUB_WEBHOOK_URL is not defined in the environment variables");
                }
                const webhookConfig = {
                    config: {
                        url: `${ngrokUrl}/webhook/github`,
                        content_type: "json"
                    }
                };
                yield axios_1.default.patch(githubWebhookUrl, webhookConfig, {
                    headers: {
                        Authorization: `token ${process.env.GITHUB_TOKEN}`,
                        Accept: "application/vnd.github.v3+json"
                    }
                });
                console.log("⚡ Webhook de GitHub actualizado con la nueva URL de Ngrok");
            }
            else {
                console.error("❌ Ngrok no pudo generar una URL");
            }
        }
        catch (error) {
            console.error("❌ Error iniciando Ngrok:", error);
        }
    }));
}
