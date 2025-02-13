"use strict";
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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const TEMP_FOLDER = path_1.default.join(__dirname, "../../temp"); // Carpeta temporal para análisis
app.use(body_parser_1.default.json());
// Verificar que la carpeta temp existe
if (!fs_1.default.existsSync(TEMP_FOLDER)) {
    fs_1.default.mkdirSync(TEMP_FOLDER);
}
// Ruta del Webhook
app.post("/webhook/github", (req, res) => {
    const event = req.headers["x-github-event"];
    const payload = req.body;
    if (event === "push") {
        const repoUrl = payload.repository.clone_url;
        const commitHash = payload.after;
        const repoName = payload.repository.name;
        console.log(`🔔 Nuevo commit detectado en ${repoName}`);
        console.log(`🔄 Clonando repositorio: ${repoUrl}`);
        const repoPath = path_1.default.join(TEMP_FOLDER, repoName);
        // Si ya existe el repo en la carpeta, eliminarlo primero
        if (fs_1.default.existsSync(repoPath)) {
            fs_1.default.rmSync(repoPath, { recursive: true, force: true });
        }
        // Clonar el repositorio
        (0, child_process_1.exec)(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error al clonar repo: ${error.message}`);
                return res.sendStatus(500);
            }
            console.log(`✅ Repositorio clonado: ${repoPath}`);
            console.log(`📂 Analizando código...`);
            // Llamar a la función de análisis
            analizarCodigo(repoPath);
            res.sendStatus(200);
        });
    }
    else {
        res.sendStatus(400);
    }
});
// Función de análisis (por ahora solo imprime los archivos)
function analizarCodigo(repoPath) {
    fs_1.default.readdir(repoPath, (err, files) => {
        if (err) {
            console.error("❌ Error al leer archivos:", err);
            return;
        }
        console.log("📂 Archivos en el repo:", files);
    });
}
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Webhook corriendo en http://localhost:${PORT}`);
});
