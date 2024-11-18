import fs from "fs-extra";
import path from "path";
import * as cheerio from 'cheerio';

export default function createProject(projectName, projectsDir) {


    updatePackageJsonAngular(projectName, projectsDir)
    updateStyles(projectName, projectsDir);
    updateAppComponentHtml(projectName, projectsDir);
    updateIndexHtml(projectName, projectsDir);
    updateAngularJSON(projectName, projectsDir);


}


async function updatePackageJsonAngular(projectName, projectsDir) {
    const packageJsonPath = path.join(projectsDir, projectName, "package.json");

    try {
        const packageJsonData = await fs.readFile(packageJsonPath, "utf8");
        const packageJson = JSON.parse(packageJsonData);

        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }

        if (packageJson.devDependencies) {
            delete packageJson.devDependencies;
        }

        const srcFilePath = path.join(process.cwd(), "public/json/package.json");
        const srcPackageJsonData = await fs.readFile(srcFilePath, "utf8");
        const srcPackageJson = JSON.parse(srcPackageJsonData);

        packageJson.dependencies = {
            ...srcPackageJson.dependencies
        };

        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");

        console.log("\tpackage.json file updated \u2714.");
    } catch (error) {
        console.error("Error updating package.json:", error);
    }
}

async function updateStyles(projectName, projectsDir) {
    const destCssFilePath = path.join(projectsDir, projectName, "src/styles.css");
    const srcCssFilePath = path.join(
        process.cwd(),
        "public/stylesheet/styles.css"
    );

    fs.readFile(srcCssFilePath, "utf8", (err, data) => {
        if (err) {
            console.error(`Error reading CSS file: ${err}`);
            return;
        }

        fs.writeFile(destCssFilePath, data, "utf8", (err) => {
            if (err) {
                console.error(`Error writing CSS file to project: ${err}`);
                return;
            }

            console.log("\tCSS file updated \u2714.");
        });
    });
}

async function updateAppComponentHtml(projectName, projectDir) {
    const appFilePath = path.resolve(projectDir, projectName, "src", "app", "app.component.html")
    const appContent = `<router-outlet />`;

    try {
        await fs.writeFile(appFilePath, appContent.trim(), "utf8");
        console.log("App component has been updated successfully!");
    } catch (error) {
        console.error("An error occurred while generating main.js:", error);
    }
}

async function updateIndexHtml(projectName, projectsDir) {
    const destIndexFilePath = path.join(projectsDir, projectName, "src/index.html");
    const srcIndexFilePath = path.join(process.cwd(), "public/html/index.html");

    try {
        const [srcIndexContent, destIndexContent] = await Promise.all([
            fs.readFile(srcIndexFilePath, 'utf-8'),
            fs.readFile(destIndexFilePath, 'utf-8')
        ]);

        const $src = cheerio.load(srcIndexContent);
        const $dest = cheerio.load(destIndexContent);

        const linkTags = $src('link').toArray();

        linkTags.forEach(linkTag => {
            $dest('head').append(linkTag);
        });

        await fs.writeFile(destIndexFilePath, $dest.html(), 'utf-8');
        console.log("Successfully updated index.html with new <link> tags.");
    } catch (error) {
        console.error("Error updating index.html:", error);
    }
}

async function updateAngularJSON(projectName, projectsDir) {
    const destIndexFilePath = path.join(projectsDir, projectName, "angular.json");

    try {
        const angularConfig = JSON.parse(fs.readFileSync(destIndexFilePath, 'utf8'));

        const stylesToAdd = [
            "src/styles.css",
            "node_modules/primeicons/primeicons.css",
            "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
            "node_modules/primeng/resources/primeng.min.css"
        ];

        const projectArchitect = angularConfig.projects[projectName].architect.build.options;

        if (!projectArchitect.styles) {
            projectArchitect.styles = [];
        }

        stylesToAdd.forEach(style => {
            if (!projectArchitect.styles.includes(style)) {
                projectArchitect.styles.push(style);
            }
        });

        fs.writeFileSync(destIndexFilePath, JSON.stringify(angularConfig, null, 2), 'utf8');

        console.log('angular.json updated successfully.');
    } catch (error) {
        console.error('Error updating angular.json:', error);
    }

}