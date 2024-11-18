import { exec } from "child_process";
import fs from "fs/promises";
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

export default async function generateNestResource(selectedTable, projectKey, projectNameBack) {
    try {
        const projectDir = path.resolve("projects", projectKey, projectNameBack);

        const command = `nest g resource ${selectedTable.name}`;
        const { stdout, stderr } = await execPromise(command, { cwd: projectDir, shell: true });

        if (stderr) {
            console.error(`stderr: ${stderr}`);
        } 

        await deleteNodeModules(projectDir);

    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
    }
}

async function deleteNodeModules(projectPath) {
    const nodeModulesPath = path.join(projectPath, 'node_modules');

    try {
        await fs.access(nodeModulesPath);

        await fs.rm(nodeModulesPath, { recursive: true, force: true });

        console.log(`Successfully deleted ${nodeModulesPath}`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('node_modules directory does not exist');
        } else {
            console.error(`Error while deleting node_modules: ${error.message}`);
        }
    }
}
