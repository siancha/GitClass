import fs from 'fs/promises';

export async function deleteFolderRecursive(folderPath: string) {
    try {
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log(`✅ Carpeta eliminada: ${folderPath}`);
    } catch (error) {
        console.error('❌ Error eliminando el folder:', error);
    } 
}
