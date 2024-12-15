import path from "path";
import fs from 'fs';
import { greenText, yellowText, purpleText, redText  } from "../../../public//data-modal.js";

import { contentImports } from "../../../public/import/imports.js";

export async function generateImports(projectPath){
    const componentAppPath = path.join(projectPath, "src/app");

    const importsFilePath = path.join(componentAppPath, "imports.ts");

    if (!fs.existsSync(componentAppPath)) {
        fs.mkdirSync(componentAppPath, { recursive: true });
    }

    const fileContent = `${contentImports}`;

    try {
        await fs.promises.writeFile(importsFilePath, fileContent.trim());        
        console.log(greenText, `\n \t File imports.ts created successfully at ${importsFilePath}`);
    } catch (error) {
        console.error(`Error creating imports.ts: ${error}`);
    }

} 

