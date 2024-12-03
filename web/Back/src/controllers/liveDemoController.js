import path from "path";
import { exec } from "child_process";
import { yellowText } from '../../public/data-modal.js';

export default async function liveDemo(req, res) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { projectKey, projectName, techFront } = req.body;
    let runCommand;
    switch (techFront) {
        case 'Angular':
            runCommand = 'npx ng serve';
            break;
        case 'React':
            runCommand = 'npm start';
            break;
        case 'Vue':
            runCommand = 'npm run serve';
            break;
        default:
            break;
    }

    const projectDir = path.join(process.cwd(), "projects", projectKey);

    try {
        // Run front-end command
        const frontEndCommand = `cd ${path.resolve("projects", projectDir, projectName)} && ${runCommand}`;

        // Run back-end command
        const backEndCommand = `cd ${path.resolve("projects", projectDir, `${projectName}Back`)} && npm install && npm start`;

        // Wait for both commands to finish
        await Promise.all([
            exec(frontEndCommand),
            exec(backEndCommand)
        ]);
        console.log(yellowText, `\n \t Server and front started successfully \x1b[0m \x1b[33m\u2714.`);
        res.status(200).send('Projects (Server and front) are starting...');
    } catch (error) {
        console.error('An error occurred while starting the projects:', error);
        res.status(500).send('Error starting the projects.');
    }

}