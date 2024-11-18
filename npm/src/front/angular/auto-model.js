import { greenText, purpleText, redText } from "../../../public/data-modal.js";
import path from "path";
import util from "util";
import fs from "fs";

const writeFileAsync = util.promisify(fs.writeFile);

export async function generateModel(selectedTable, projectPath) {
    const directoryModelPath = path.join(projectPath, "src", "model");

    if (!fs.existsSync(directoryModelPath)) {
        fs.mkdirSync(directoryModelPath, { recursive: true });
    }

    const directoryModelFilePath = path.join(
        directoryModelPath,
        `${selectedTable.name}.ts`
    );

    if (fs.existsSync(directoryModelFilePath)) {
        console.log(`${selectedTable.name}.ts already exists in model.`);
    } else {
        const fileContent = generateTableModel(selectedTable);
        await writeFileAsync(directoryModelFilePath, fileContent);
        console.log(
            greenText,
            `\n\t Model \x1b[1m${selectedTable.name}.ts\x1b[0m \x1b[32mcreated successfully \u2714.\n`
        );
    }
}


function generateTableModel(tableObject) {
    const { name, fields } = tableObject;
    const validTypes = ['number', 'boolean', 'string', 'Date'];

    return `export class ${name} {\n${fields.map(({ field, type }) => {
        const validType = validTypes.includes(type) ? type : 'any';
        return `    ${field}!: ${validType};\n`;
    }).join("")}}\n`;
}