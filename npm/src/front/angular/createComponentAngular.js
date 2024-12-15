import { greenText, purpleText, redText } from "../../../public/data-modal.js";
import path from "path";
import fs from "fs";
import createCrud from "../../createCrudNode.js";
import { generateComponent } from "./auto-component.js";
import { generateImports } from './imports.js'
import { watcherForUpdate } from './auto-routing.js'
import { generateModel } from './auto-model.js'
import { generateService } from "./auto-service.js";
import os from "os";

export let nameComponentMaj;


export default async function createAngularComponent(projectName, selectedTables, projectKey, database) {
  const projectNameBack = projectName + "Back"; // Back-end
  
  if (!projectName) {
    console.log("Error: You should select a project and connect to it before creating forms.");
    return;
  }

  try {
    const projectPath = path.join(os.homedir(), projectKey,projectName);

    if (!fs.existsSync(projectPath)) {
      console.log(`Error: ${projectName} does not exist.`);
      return;
    }
    for (const table of selectedTables) {
      try {
        await generateComponent(table, projectPath, database);
        await generateModel(table, projectPath);
        await generateService(table.name, projectPath);
    
        const nameComponentMaj = capitalizeFirstLetter(table.name);
    
        await watcherForUpdate(table.name, nameComponentMaj, projectPath, projectKey);
        await createCrud(projectKey, projectNameBack, table, database);
      } catch (error) {
        console.error(`Error processing table ${table.name}:`, error);
      }
    }

    await generateImports(projectPath);

  } catch (error) {
    console.log("Error:", error.message);
  }
}


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}