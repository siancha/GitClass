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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 1234;
const TEMP_FOLDER = process.env.TEMP_FOLDER || path_1.default.join("C:", "temp"); // Carpeta temporal para análisis
const SCRIPTS_FOLDER = path_1.default.join("C:", "temp", "GitClass", "src", "server");
const SCRIPTS_TEST = path_1.default.join("C:", "temp", "GitClass", "src", "tests");
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
    console.log("Ejecutando Jest...");
    (0, child_process_1.exec)("jest --json --outputFile=temp-test-results.json", (error, stdout, stderr) => __awaiter(void 0, void 0, void 0, function* () {
        if (error) {
            console.error(`Error ejecutando Jest: ${stderr}`);
            return res.status(500).json({ error: "Error ejecutando Jest", details: stderr });
        }
        // Importar fs para leer el archivo generado por Jest
        const resultsFile = "temp-test-results.json";
        try {
            const data = yield fs_1.default.promises.readFile(resultsFile, "utf8");
            const results = JSON.parse(data);
            res.json(results);
        }
        catch (err) {
            console.error("Error leyendo los resultados de Jest:", err);
            res.status(500).json({ error: "No se pudieron leer los resultados de Jest" });
        }
    }));
}));
// Ruta del Webhook
app.post("/webhook/github", (req, res) => {
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
        // Si ya existe el repo en la carpeta, eliminarlo primero
        if (fs_1.default.existsSync(safeRepoPath)) {
            fs_1.default.rmSync(safeRepoPath, { recursive: true, force: true });
        }
        console.log(`📂 Carpeta temporal limpia: ${safeRepoPath}`);
        // Clonar el repositorio
        (0, child_process_1.exec)(`git clone ${repoUrl} ${safeRepoPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error al clonar repo: ${error.message}`);
                return res.sendStatus(500);
            }
            console.log(`✅ Repositorio clonado: ${repoPath}`);
            console.log(`📂 Analizando código...`);
            // Llamar a la función de análisis
            (0, codeAnalyzer_1.analizarCodigo)(repoPath);
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
                const githubWebhookUrl = `https://api.github.com/repos/siancha/GitClass/hooks/529804741`; // Reemplaza {hook_id} con el ID del webhook
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
