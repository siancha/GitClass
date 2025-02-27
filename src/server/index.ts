import express from "express";
import bodyParser from "body-parser";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { connect } from "@ngrok/ngrok";
import { analizarCodigo } from "../analysis/codeAnalyzer";
import axios from "axios";
import { deleteFolderRecursive } from "../utils/deleteFolder";
import { runTests } from "../utils/runTest";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1234;
const TEMP_FOLDER = process.env.TEMP_FOLDER || path.join("C:", "temp"); // Carpeta temporal para análisis
const SCRIPTS_FOLDER = path.join("C:", "temp", "GitClass", "src");
const SCRIPTS_TEST = path.join("C:", "temp", "GitClass");

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public'));
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

app.use(bodyParser.json());

// Verificar que la carpeta temp existe
if (!fs.existsSync(TEMP_FOLDER)) {
    fs.mkdirSync(TEMP_FOLDER);
    console.log(`📁 Carpeta temporal creada: ${TEMP_FOLDER}`);
}

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/documentacion', (req, res) => {
    res.render('documentacion');
});



app.get('/codeTest', async (req, res) => {
    const resultsPath = path.join(__dirname, '../reports/analysis_results.json');
    analizarCodigo(SCRIPTS_FOLDER);

    try {
        const data = await fs.promises.readFile(resultsPath, 'utf8');
        const analysisResults = await JSON.parse(data);
        res.render('codeTest', { analysisResults });
    } catch (error) {
        console.error('Error reading analysis results:', error);
        res.status(500).send('Error reading analysis results');
    }
});

app.get('/reports', (req, res) => {
    const resultsPath = path.join(__dirname, '../reports/jest-results.json');
    console.log('📄 Leyendo resultados de Jest:', resultsPath);
    let results = {};

    try {
        const data = fs.readFileSync(resultsPath, 'utf8');
        results = JSON.parse(data);
    } catch (error) {
        console.error('Error reading Jest results:', error);
        results = { error: 'No se pudo leer el archivo de resultados.' };
    }

    res.render('reports', { results });
});

// Endpoint para ejecutar los tests
app.post("/run-tests", async (req, res) => {
    try {
        await analizarCodigo(SCRIPTS_FOLDER);
        await runTests();
        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error ejecutando pruebas:", error);
        const errorMessage = (error as Error).message;
        res.status(500).send(errorMessage);
    }
});
// Ruta del Webhook
app.post("/webhook/github", (req, res) => {
    // Eliminar el folder clonado si ya existe
    deleteFolderRecursive(SCRIPTS_TEST);
    
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

        const repoPath = path.join(TEMP_FOLDER, repoName);
        const safeRepoPath = `"${repoPath}"`;

        // Clonar el repositorio
        exec(`git clone ${repoUrl} ${safeRepoPath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error al clonar repo: ${error.message}`);
                return res.sendStatus(500);
            }

            console.log(`✅ Repositorio clonado: ${repoPath}`);
            console.log(`📂 Analizando código...`);

            // Llamar a la función de análisis
            analizarCodigo(SCRIPTS_FOLDER);
            // Enviar respuesta exitosa
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
// Función para iniciar el servidor
export function start() {
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
                const githubWebhookUrl = process.env.GITHUB_WEBHOOK_URL as string; // URL del webhook de GitHub
                if (!githubWebhookUrl) {
                    throw new Error("GITHUB_WEBHOOK_URL is not defined in the environment variables");
                }
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
}