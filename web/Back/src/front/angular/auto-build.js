import { exec } from 'child_process';
import { projectName } from "../../databaseInfo.js";
import path from 'path';


export default function building() {

    console.log("projeect : ", process.cwd());

    //const newPath = path.join(process.cwd(), `${projectName}` );
    //process.chdir(newPath);

    exec('npm run-script build', (error, stderr) => {
        if (error) {
            console.error(`Erreur lors de l'exécution de la commande : ${error}`);
            return;
        }

        if (stderr) {
            console.error(`Erreur de la commande : ${stderr}`);
        }

        console.log(purpleText, `Building DONE \u2714.`);
    });
}
