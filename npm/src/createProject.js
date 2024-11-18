import fs from "fs-extra";
import path from "path";
import os from "os";
import { fileURLToPath } from 'url';
import { showLoading } from "./db/myDB.js";
import { exec } from "child_process";
import { promisify } from "util";
import createProject from "./front/angular/createProject.js"
import gatherDatabaseInfo from './databaseInfo.js'

const execAsync = promisify(exec);

let projectKey;
export { projectKey };

export  async function generateProject(answers) {
  const { projectName, techFront, techBack, database } = answers;

  console.log(answers);

  if (!projectName) {
    console.log("Le nom du projet est requis.");
    return;
  }


  const projectNameBack = projectName + "Back";
  const loadingInterval = showLoading();

  try {
    const projectKey = await generateKey(25);
    const projectsDir = path.join(os.homedir(), projectKey);

    if (!fs.existsSync(projectsDir)) {
      fs.mkdirSync(projectsDir, { recursive: true });
    }

    switch (techFront) {
      case "Angular":
        await execAsync(`npx @angular/cli new ${projectName} --skip-install`, {
          cwd: projectsDir,
        });
        createProject(projectName, projectsDir);
        break;

      case "React":
        await copyProject(projectName, projectKey, "project-react");
        break;

      case "Vue":
        await copyProject(projectName, projectKey, "project-vue");
        break;

      default:
        clearInterval(loadingInterval);
        console.log("Technologie front-end non supportée.");
        return;
    }

    switch (techBack) {
      case "Express":
        await copyProject(projectNameBack, projectKey, "project-express");
        break;

      default:
        clearInterval(loadingInterval);
        console.log("Technologie back-end non supportée.");
        return;
    }

    updatePackageJson(projectsDir, database, projectNameBack);

    clearInterval(loadingInterval);

    console.log("Projet créé avec succès.");
    gatherDatabaseInfo(answers,projectKey);

  } catch (error) {
    clearInterval(loadingInterval);
    console.error("Erreur lors de la génération du projet:", error);
    console.error("Détails de l'erreur:", error.message);
  }
}

async function generateKey(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }
  return key;
}

async function copyProject(projectName, projectKey, projectTech) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const rootDir = path.resolve(__dirname, '../');
  const sourceDir = path.join(rootDir, `utils/${projectTech}`);
  try {
    const destPath = path.join(
      os.homedir(),
      projectKey,
      projectName
    );

    if (!fs.existsSync(destPath)) {
      await fs.mkdir(destPath, { recursive: true });
    }
    await fs.copy(sourceDir, destPath);
  } catch (error) {
    console.error("Erreur lors de la copie du dossier:", error);
  }
}


async function updatePackageJson(projectDir, dbType, projectNameBack) {
  const packageJsonPath = path.join(
    projectDir,
    projectNameBack,
    "package.json"
  );

  try {
    const packageJsonData = await fs.readFile(packageJsonPath, "utf8");

    const packageJson = JSON.parse(packageJsonData);

    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }

    if (dbType === "mysql") {
      packageJson.dependencies["mysql2"] = "^3.11.0";
    } else if (dbType === "mongoDB") {
      packageJson.dependencies["mongoose"] = "^8.5.2";
    } else if (dbType === "postgres") {
      packageJson.dependencies["pg"] = "^8.12.0";
    } else {
      console.log("Unsupported database type.");
    }

    const updatedPackageJson = JSON.stringify(packageJson, null, 2);

    await fs.writeFile(packageJsonPath, updatedPackageJson, "utf8");

    //console.log(`${dbType} dependency added successfully!`);
  } catch (error) {
    console.error("Error updating package.json:", error);
  }
}
