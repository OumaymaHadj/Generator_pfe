import { greenText, purpleText, redText } from "../../../public/data-modal.js";
import path from "path";
import fs from "fs";
import createCrud from "../../back/node/createCrudNode.js";
import { generateComponent } from "./auto-component.js";
import { generateImports } from './imports.js'
import { watcherForUpdate } from './auto-routing.js'
import { generateModel } from './auto-model.js'
import { generateService } from "./auto-service.js";

export let nameComponentMaj;

export default async function createComponent(req, res) {

  const { projectName, selectedTables, projectKey, database } = req.body;
  const projectNameBack = projectName+"Back" //"Back-end;
  
  if (!projectName) {
    return res.json({ error: "You should select a project and connect to it before creating forms."});
  }

  try {
    const projectPath = path.resolve("projects", projectKey, projectName);

    if (!fs.existsSync(projectPath)) {
      return res.json({ error: `${projectName} does not exist.` });
    }
    
    let isFirstTable = true;

    if (selectedTables.length > 0){
      for (const table of selectedTables) {
        await generateComponent(table, projectPath, database);
        await generateModel(table, projectPath);
        await generateService(table.name, projectPath);
  
        const nameComponentMaj = capitalizeFirstLetter(table.name);
        await watcherForUpdate(table.name, nameComponentMaj, projectPath, projectKey, isFirstTable);
        isFirstTable = false;
        await createCrud(projectKey, projectNameBack, table,database);
      }
    } else {
      await watcherForUpdate(null, null, projectPath, projectKey, isFirstTable);

    }


    //await generateImports(projectPath);

    return res.json({
      success: true,
      message: "Components created successfully.",
    });
  } catch (error) {
    return res.json({ error: "Error:", details: error.message });
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}