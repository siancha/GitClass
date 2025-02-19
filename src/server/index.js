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
app.use(body_parser_1.default.json());
// Verificar que la carpeta temp existe
if (!fs_1.default.existsSync(TEMP_FOLDER)) {
    fs_1.default.mkdirSync(TEMP_FOLDER);
}
// Ruta del Webhook
app.post("/webhook/github", (req, res) => {
    console.log("🔔 Webhook recibido:", req.headers["x-github-event"]);
    console.log("📦 Payload:", JSON.stringify(req.body, null, 2));
    const event = req.headers["x-github-event"];
    const payload = req.body;
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
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
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
