import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { connect } from "@ngrok/ngrok";
import { analizarCodigo } from "../analysis/codeAnalyzer";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1234;
const TEMP_FOLDER = process.env.TEMP_FOLDER || path.join("C:", "temp"); // Carpeta temporal para análisis
const SCRIPTS_FOLDER = path.join("C:", "temp", "GitClass", "src", "server");

app.use(bodyParser.json());

// Verificar que la carpeta temp existe
if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
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

        const repoPath = path.join(TEMP_FOLDER, repoName);
        const safeRepoPath = `"${repoPath}"`;

        // Si ya existe el repo en la carpeta, eliminarlo primero
        if (fs.existsSync(safeRepoPath)) {
            fs.rmSync(safeRepoPath, { recursive: true, force: true });
        }

        // Clonar el repositorio
        exec(`git clone ${repoUrl} ${safeRepoPath}`, (error, stdout, stderr) => {
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

// 🟢 Ruta raíz para evitar errores 404
app.get("/", (req, res) => {
    console.log("🔔 Webhook recibido:", req.headers["x-github-event"]);
    console.log("📦 Payload:", JSON.stringify(req.body, null, 2));
    res.send("✅ Servidor Webhook activo");
});

// Iniciar servidor
app.listen(PORT, async() => {
    console.log(`🚀 Servidor Webhook corriendo en http://localhost:${PORT}`);

    // Exponer servidor con Ngrok
    try {
        const listener = await connect({ addr: PORT, authtoken: process.env.NGROK_AUTHTOKEN});
        const ngrokUrl = listener.url();
        console.log(`🌍 Ngrok activo en: ${ngrokUrl}`);
        if (ngrokUrl) {
            console.log(`🌍 Ngrok activo en: ${ngrokUrl}`);

            // Guardar la URL de Ngrok en un archivo
            fs.writeFileSync("ngrok-url.txt", ngrokUrl);

            // Actualizar el webhook de GitHub
            const githubWebhookUrl = `https://api.github.com/repos/siancha/GitClass/hooks/529804741`; // Reemplaza {hook_id} con el ID del webhook
            const webhookConfig = {
                config: {
                    url: `${ngrokUrl}/webhook/github`,
                    content_type: "json"
                }
            };

            await axios.patch(githubWebhookUrl, webhookConfig, {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json"
                }
            });

            console.log("⚡ Webhook de GitHub actualizado con la nueva URL de Ngrok");
        } else {
            console.error("❌ Ngrok no pudo generar una URL");
        }
    } catch (error) {
        console.error("❌ Error iniciando Ngrok:", error);
    }
});
