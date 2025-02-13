import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { connect } from "@ngrok/ngrok";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1234;
const TEMP_FOLDER = path.join(__dirname, "../../temp"); // Carpeta temporal para análisis

app.use(bodyParser.json());

// Verificar que la carpeta temp existe
if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
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

        const repoPath = path.join(TEMP_FOLDER, repoName);

        // Si ya existe el repo en la carpeta, eliminarlo primero
        if (fs.existsSync(repoPath)) {
            fs.rmSync(repoPath, { recursive: true, force: true });
        }

        // Clonar el repositorio
        exec(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
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
    } else {
        res.sendStatus(400);
    }
});

// Función de análisis (por ahora solo imprime los archivos)
function analizarCodigo(repoPath: string) {
    fs.readdir(repoPath, (err, files) => {
        if (err) {
            console.error("❌ Error al leer archivos:", err);
            return;
        }

        console.log("📂 Archivos en el repo:", files);
    });
}

// Iniciar servidor
app.listen(PORT, async() => {
    console.log(`🚀 Servidor Webhook corriendo en http://localhost:${PORT}`);

    // Exponer servidor con Ngrok
    try {
        const listener = await connect({ addr: PORT, authtoken: process.env.NGROK_AUTHTOKEN });
        console.log(`🌍 Ngrok activo en: ${listener.url()}`);

        console.log("⚡ Usa esta URL en GitHub Webhooks");
    } catch (error) {
        console.error("❌ Error iniciando Ngrok:", error);
    }
});
