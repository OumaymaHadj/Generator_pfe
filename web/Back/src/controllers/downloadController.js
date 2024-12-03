import fs from "fs-extra";
import path from "path";
import { archiveProject } from "../generateANDownload/downloadProject.js";

export default async function downloadProject(req, res) {
    try {
        const { projectName, projectKey } = req.body;


        const projectsDir = path.resolve("projects");

        if (!fs.existsSync(projectsDir)) {
            return res.status(404).send('Project directory not found.');
        }

        const zipPath = await archiveProject(projectName, projectKey, projectsDir);
        console.log("zipPath:", zipPath);

        // Check if the zip file was successfully created
        if (fs.existsSync(zipPath)) {
            res.download(zipPath, `${projectName}.zip`, (err) => {
                if (err) {
                    console.error(`Download Error: ${err}`);
                    return res.status(500).send('Error downloading the file.');
                } else {
                    // Clean up the project directory and the zip file after successful download
                    /*try {
                      fs.rmSync(path.join(projectsDir, projectKey), { recursive: true, force: true });
                      fs.unlinkSync(zipPath);
                    } catch (cleanupErr) {
                      console.error(`Cleanup Error: ${cleanupErr}`);
                    }*/
                }
            });
        } else {
            return res.status(404).send('ZIP file not found.');
        }
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({ error: 'An error occurred while downloading the project.' });
    }
}