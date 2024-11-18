import { selectedTableName, projectName, object } from "../npm/databaseInfo.js";
import { greenText, purpleText, redText } from "../../public/data-modal.js";
import { showLoading } from "../db/myDB.js";
import { watcherForUpdate } from "../front/angular/auto-routing.js";
import updataAppConfig from "../front/angular/auto-config.js";
import path from "path";
import util from "util";
import { exec } from "child_process";
import inquirer from "inquirer";
import fs from "fs";
import createFtpFolder from "./deploy.js";
import ftp from "ftp";
import help from "../welcome/help.js";

const writeFileAsync = util.promisify(fs.writeFile);
let execPromise;
export let nameComponentMaj;

export default async function createComponent() {
  if (projectName !== undefined) {
    try {
      const projectPath = path.join(process.cwd(), "projects", projectName);
      if (!fs.existsSync(projectPath)) {
        console.log(redText, `${projectName} does not exist. \x1b[1m`);
        process.exit(0);
      }

      process.chdir(projectPath);

      execPromise = util.promisify(exec);

      const confirmAnswer = await inquirer.prompt({
        type: "confirm",
        name: "confirm",
        message: `Do you want to create an Angular component, service, and model for table '${selectedTableName}'?`,
      });

      if (confirmAnswer.confirm) {
        const loadingInterval = showLoading();

        // COMPONENT ANGULAR
        await generateComponent();

        // MODEL ANGULAR
        await generateModel();

        // SERVICE ANGULAR
        await generateService();

        // Update routes
        await watcherForUpdate();

        await new Promise((resolve) => setTimeout(resolve, 2000));

        await updataAppConfig();

        clearInterval(loadingInterval);
      } else {
        console.log(purpleText, "Exiting the program.");
        process.exit(0);
      }
    } catch (error) {
      console.error(redText, "Error:", error);
    } finally {
      process.exit(0);
    }
  } else {
    console.log(
      redText,
      "You should select a project and connect to it before creating forms."
    );
    help();
  }
}

async function generateComponent() {
  const componentPath = path.join(
    process.cwd(),
    "src",
    "app",
    selectedTableName
  );

  if (!fs.existsSync(componentPath)) {
    await execPromise(`ng generate component ${selectedTableName}`);
    console.log("\n");
    console.log(
      greenText,
      `\t Component \x1b[1m${selectedTableName}\x1b[0m \x1b[32mcreated successfully \u2714.`
    );

    await updataTSComponent();

    updateHtmlComponent();

    await new Promise((resolve) => setTimeout(resolve, 3000));
  } else {
    console.log(`Component '${selectedTableName}' already exists.`);
  }
}

async function generateModel() {
  const directoryModelPath = path.join(process.cwd(), "src", "model");

  if (!fs.existsSync(directoryModelPath)) {
    fs.mkdirSync(directoryModelPath, { recursive: true });
  }

  process.chdir(directoryModelPath);

  const directoryModelFilePath = path.join(
    directoryModelPath,
    `${selectedTableName}.ts`
  );

  if (fs.existsSync(directoryModelFilePath)) {
    console.log(`${selectedTableName}.ts already exists in model.`);
  } else {
    const fileContent = generateTableModel(object, selectedTableName);
    await writeFileAsync(directoryModelFilePath, fileContent);
    console.log("\n");
    console.log(
      greenText,
      `\t Model \x1b[1m${selectedTableName}.ts\x1b[0m \x1b[32mcreated successfully \u2714.\n`
    );
  }
}

async function generateService() {
  const servicePath = path.join(process.cwd(), "..", "service");

  if (!fs.existsSync(servicePath)) {
    fs.mkdirSync(servicePath, { recursive: true });
  }

  process.chdir(servicePath);

  const directoryServicePath = path.join(process.cwd(), selectedTableName);

  if (!fs.existsSync(directoryServicePath)) {
    fs.mkdirSync(directoryServicePath, { recursive: true });

    process.chdir(directoryServicePath);
    await execPromise(`ng generate service ${selectedTableName}`);
    console.log("\n");
    console.log(
      greenText,
      `\t Service \x1b[1m${selectedTableName}\x1b[0m \x1b[32mcreated successfully \u2714.`
    );
    console.log(
      `\n\t \x1b[1m${selectedTableName}\x1b[0m directory created in src/service \u2714.`
    );

    const serviceFilePath = path.join(
      process.cwd(),
      `${selectedTableName}.service.ts`
    );
    const ServiceContent = generateServiceContent();
    await writeFileAsync(serviceFilePath, ServiceContent);
    console.log(
      `\t Service \x1b[1m${selectedTableName}\x1b[0m updated successfully \u2714.\n`
    );
  } else {
    console.log(`Service '${selectedTableName}' already exists.`);
  }
}

async function connectToFtp() {
  const client = new ftp();

  try {
    await new Promise((resolve, reject) => {
      client.on("ready", () => {
        console.log("FTP client connected");
        resolve();
      });

      client.on("error", (err) => {
        console.error("FTP client error:", err);
        reject(err); // Reject the promise if an error occurs
      });

      client.on("end", () => {
        console.log("FTP client disconnected");
      });

      // Connect to FTP server
      client.connect({
        host: "ftp.cluster030.hosting.ovh.net",
        port: 21,
        user: "fleskid",
        password: "7pLA4zSq47",
      });
    });
  } catch (error) {
    console.error("Error connecting to FTP server:", error);
  } finally {
    // Ensure client is properly disconnected
    client.end();
  }
}

function generateTableModel(tableObject, tableName) {
  let content = `export class ${tableName} {\n\n`;

  for (const property in tableObject) {
    content += `    ${property}!: ${tableObject[property]};\n`;
  }

  content += `}\n`;

  return content;
}

function generateTsContent() {
  nameComponentMaj =
    selectedTableName.charAt(0).toUpperCase() + selectedTableName.slice(1);

  const nameService = nameComponentMaj + "Service";
  let content = ` import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${selectedTableName} } from '../../model/${selectedTableName}';
import { ${nameService} } from '../../service/${selectedTableName}/${selectedTableName}.service';
import { FormsModule } from '@angular/forms';

@Component({
selector: 'app-${selectedTableName}',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './${selectedTableName}.component.html',
styleUrl: './${selectedTableName}.component.css'
})

export class ${nameComponentMaj}Component {

items!: any[];
keys!: any;
attributeNames: any;
currentItem: string = '';
editingIndex: number = -1;
obj: any = {};
oldItemObj: any;

constructor(private ${selectedTableName}Service: ${nameService}) { }

ngOnInit(): void {
    this.getItems();
}


updateItem(item: any) {
    console.log(item);

    if (confirm("Are you sure to save ")) {

    this. ${selectedTableName}Service.saveItems(item).subscribe(
        () => {
        console.log('Confirmed : Item saved successfully');

        },
        (error) => {
        console.error('Error saving Item:', error);

        }
    )
        item.isEdit = false;
    } else {
    console.log('Cancelled saving');
    }
}

onAdd() {

    this.attributeNames.forEach((att: string | number) => {

    this.obj[att] = "";

    });
    this.obj['isEdit'] = true;

    console.log("obj : ", this.obj);

    this.items.unshift(this.obj);

}

onCancel(item: any) {

    const oldObj = JSON.parse(this.oldItemObj);
    const isEmpty = this.attributeNames.every((att: string | number) => {
    return item[att] === oldObj[att];
    });
    if (isEmpty) {
    item.isEdit = false;
    } else {
    this.attributeNames.forEach((att: string | number) => {
        item[att] = oldObj[att];
    });
    }
}

editItem(item: any) {

    this.oldItemObj = JSON.stringify(item);
    console.log(this.oldItemObj);
    this.items.forEach(element => {
    element.isEdit = false;
    });
    item.isEdit = true;
}

getItems(): void {
    this.${selectedTableName}Service.getItems().subscribe((items: any[]) => {
    this.items = items;
    console.log('Items:', this.items);
    type AttributeNames = keyof ${selectedTableName};
    this.attributeNames = Object.keys(this.items[0]) as AttributeNames[];
    console.log('attributeNames:', this.attributeNames);

    this.attributeNames.forEach((attribute: string | number) => {
        console.log(\`Attribute Name: \${attribute}, Type: \${typeof this.items[0][attribute]}\`);
    });

    });
}

deleteItem(id: any): void {

    if (confirm("Are you sure to delete ")) {
    console.log("id", id);
    this.${selectedTableName}Service.deleteItem(id).subscribe(
        () => {
        console.log('Confirmed deletion: Item deleted successfully');
        },
        (error) => {
        console.error('Error deleting team:', error);
        }
    )
    } else {
    console.log('Cancelled deletion:');
    }
}
}`;

  return content;
}

function updateHtmlComponent() {
  const destHTMLFilePath = path.join(
    process.cwd(),
    "src/app",
    selectedTableName,
    `${selectedTableName}.component.html`
  );
  const scriptPath = path.join(process.cwd(), "..", "..");
  const srcHTMLFilePath = path.join(scriptPath, "public/component.html");

  fs.readFile(srcHTMLFilePath, "utf8", async (err, data) => {
    if (err) {
      console.error(`Error reading HTML file: ${err}`);
      return;
    }

    fs.writeFile(destHTMLFilePath, data, "utf8", (err) => {
      if (err) {
        console.error(`Error writing HTML file to component: ${err}`);
        return;
      }
      console.log(
        `\t \x1b[1m${selectedTableName}.component.html\x1b[0m updated \u2714.\n`
      );
    });
  });
}

async function updataTSComponent() {
  const tsFilePath = path.join(
    process.cwd(),
    `src/app/${selectedTableName}/${selectedTableName}.component.ts`
  );
  const fileContent = generateTsContent();
  await writeFileAsync(tsFilePath, fileContent);
  console.log(
    `\n \t \x1b[1m${selectedTableName}.component.ts\x1b[0m updated \u2714.`
  );
}

function generateServiceContent() {
  let content = ` import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ${selectedTableName} } from '../../model/${selectedTableName}';

@Injectable({
  providedIn: 'root'
})
export class ${nameComponentMaj}Service {

  private apiUrl = 'http://172.17.0.1:8088';

  constructor(private http: HttpClient) { }

  getItems() : Observable<${selectedTableName}[]> {
    return this.http.get<${selectedTableName}[]>(\`\${this.apiUrl}/${selectedTableName}\`);
  }

  saveItems(item : ${selectedTableName}){
    return this.http.post(\`\${this.apiUrl}/${selectedTableName}/add \`,item);
  }
  deleteItem(id: number): Observable<any> {
    
    return this.http.delete(\`\${this.apiUrl}/${selectedTableName}/delete/\${id}\`);
  }

  getById(id : any){
    return this.http.get<${selectedTableName}>(\`\${this.apiUrl}/\${id}\`)
  }

  updateItem(item : ${selectedTableName}){
    return this.http.post<${selectedTableName}>(\`\${this.apiUrl}/${selectedTableName}/edit \`,item);
  }
  
}
`;
  return content;
}
