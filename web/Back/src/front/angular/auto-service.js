
import { greenText, purpleText, redText } from "../../../public/data-modal.js";
import path from "path";
import util from "util";
import { exec } from "child_process";
import fs from "fs";

const writeFileAsync = util.promisify(fs.writeFile);
const execPromise = util.promisify(exec);

export async function generateService(selectedTableName, projectPath) {
  const lowerTableName = selectedTableName.charAt(0).toLowerCase() + selectedTableName.slice(1);

    const servicePath = path.join(
        projectPath,
        "src",
        "service",
        lowerTableName
    );

    if (fs.existsSync(servicePath)) {
        console.log(`Service '${selectedTableName}' already exists.`);
        return;
    }

    fs.mkdirSync(servicePath, { recursive: true });

    try {
        await execPromise(`ng generate service ${lowerTableName}`, {
            cwd: servicePath,
        });

        console.log(
            greenText,
            `\t Service \x1b[1m${lowerTableName}\x1b[0m \x1b[32mcreated successfully \u2714.`
        );

        const serviceFilePath = path.join(
            servicePath,
            `${lowerTableName}.service.ts`
        );
        const serviceContent = generateServiceContent(lowerTableName);
        await writeFileAsync(serviceFilePath, serviceContent);
        console.log(
            `\t Service \x1b[1m${lowerTableName}\x1b[0m updated successfully \u2714.`
        );
    } catch (error) {
        console.error(`Error generating service: ${error.message}`);
    }
}


function generateServiceContent(selectedTableName) {
    const nameComponentMaj = capitalizeFirstLetter(selectedTableName);

    return ` import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { ${selectedTableName} } from '../../model/${selectedTableName}';
  
  @Injectable({
    providedIn: 'root'
  })
  export class ${selectedTableName}Service {
  
  private apiUrl = 'http://localhost:3003/${selectedTableName}s';
  
    constructor(private http: HttpClient) { }
  
    getAll() : Observable<${selectedTableName}[]> {
      return this.http.get<${selectedTableName}[]>(\`\${this.apiUrl}\`);
    }
  
    create(item : ${selectedTableName}){
      return this.http.post(\`\${this.apiUrl}\`,item);
    }
    delete(id: number): Observable<any> {
      
      return this.http.delete(\`\${this.apiUrl}/\${id}\`);
    }
  
    getById(id : any){
      return this.http.get<${selectedTableName}>(\`\${this.apiUrl}/\${id}\`)
    }
  
    update(id:number,item : ${selectedTableName}){
      return this.http.put<${selectedTableName}>(\`\${this.apiUrl}/\${id} \`,item);
    }
    
  }
  `;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}