import fs from "fs-extra";
import path from "path";
import archiver from "archiver";


export async function archiveProject(projectName, projectKey, projectsDir) {
    return new Promise((resolve, reject) => {
        console.log("Archiving project:", projectName);

        const projectPath = path.join(projectsDir, projectKey);
        const zipPath = path.join(projectsDir, `${projectName}.zip`);

        if (!fs.existsSync(projectPath)) {
            return reject(new Error("Project directory not found."));
        }

        const output = fs.createWriteStream(zipPath);
        const archive = archiver("zip", {
            zlib: { level: 9 },
        });

        output.on("close", () => {
            resolve(zipPath);
        });

        output.on("error", (err) => {
            console.error(`Error writing to zip file: ${err}`);
            reject(err);
        });

        archive.on("error", (err) => {
            console.error(`Archiving Error: ${err}`);
            reject(err);
        });

        archive.pipe(output);

        //archive.directory(projectPath, false);

        archive.glob("**/*", {
            cwd: projectPath,
            ignore: [
                `${projectName}/node_modules/**`,
                `${projectName}Back/node_modules/**`
            ]
        });

        archive.finalize();
    });
}