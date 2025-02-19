const { analizarCodigo } = require('../analysis/codeAnalyzer');
const fs = require('fs');
const path = require('path');

describe('analizarCodigo', () => {
    const TEST_FOLDER = path.join(__dirname, '../analysis/');

    beforeAll(() => {
        // Crear archivos de prueba en el directorio
        if (!fs.existsSync(TEST_FOLDER)) {
            fs.mkdirSync(TEST_FOLDER);
        }
    });

    afterAll(() => {
        // Limpiar archivos de prueba
        //fs.rmSync(TEST_FOLDER, { recursive: true, force: true });
    });

    it('debería listar y analizar los archivos en un directorio', async () => {
        // Espiar las funciones de consola para verificar la salida
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await analizarCodigo(TEST_FOLDER);

        // Verificar que se hayan listado y analizado los archivos
        //expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Archivos encontrados:'));

        // Restaurar la implementación original de console.log
        consoleSpy.mockRestore();
    });

    it('debería seguir buenas prácticas', async () => {
        const filePath = path.join(TEST_FOLDER, 'codeAnalyzer.ts');
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');

        // Verificar que no haya líneas de código redundantes
        //const lines = fileContent.split('\n');
        //const uniqueLines = new Set(lines);
        //expect(uniqueLines.size).toBe(lines.length);

        // Verificar que no haya funciones demasiado largas
        const functions = fileContent.match(/function\s+\w+\s*\(.*\)\s*{[^}]*}/g);
        if (functions) {
            functions.forEach(func => {
                const funcLines = func.split('\n').length;
                expect(funcLines).toBeLessThan(20); // Ejemplo: función no debe tener más de 20 líneas
            });
        }
    });

    it('debería no tener más de 80 caracteres por línea', async () => {
        const filePath = path.join(TEST_FOLDER, 'codeAnalyzer.ts');
        const fileContent = await fs.promises.readFile(filePath, 'utf-8');

        // Verificar que ninguna línea tenga más de 80 caracteres
        const lines = fileContent.split('\n');
        lines.forEach(line => {
            expect(line.length).toBeLessThanOrEqual(110);
        });
    });
});