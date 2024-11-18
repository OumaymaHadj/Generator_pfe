import mysql from 'mysql';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { exec } from 'child_process';
import inquirer from 'inquirer';
import util from 'util';
import { CLIENT_RENEG_LIMIT } from 'tls';

let execPromise;

const redText = '\x1b[31m%s\x1b[0m';
const purpleText = '\x1b[35m%s\x1b[0m';
const greenText = '\x1b[32m%s\x1b[0m';

const frameworksFilePath = path.join(process.cwd(), 'frameworks.json');
let dbConfig;
let tables;
let object = {};
let numeric = ['tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'serial', 'decimal', 'float', 'double', 'real'];
let bool = ['boolean', 'serial'];
let date = ['date', 'datetime', 'timestamp', 'time', 'year'];
let chaine = ['char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext', 'binary', 'varbinary', 'tinyblob', 'blob', 'mediumblob', 'longblob'];


export default function fetchData() {
    // Read the content of the frameworks.json file
    try {
        const data = fs.readFileSync(frameworksFilePath, 'utf8');
        const frameworksInfo = JSON.parse(data);

        // Use the imported information to create dbConfig object
        dbConfig = {
            name: frameworksInfo.projectName,
            host: frameworksInfo.database_info.databaseHost,
            user: frameworksInfo.database_info.databaseUsername,
            password: frameworksInfo.database_info.databasePassword,
            database: frameworksInfo.database_info.databaseName,
        };

    } catch (error) {
        console.error(redText, `Error reading frameworks.json: ${error}`);
    }

    if (!dbConfig) {
        console.error(redText, 'Database configuration not available.');
        return;
    }

    // Créer une connexion à la base de données
    const connection = mysql.createConnection(dbConfig);

    // Se connecter à la base de données
    connection.connect((err) => {
        if (err) {
            console.error(redText, 'Erreur de connexion à la base de données : ', err);
            return;
        }

        const showTablesQuery = 'SHOW TABLES';

        // Exécutez la requête
        connection.query(showTablesQuery, (error, results) => {
            if (error) {
                throw error;
            }

            tables = results
                .map(result => Object.values(result)[0])
                .filter(tableName => !tableName.endsWith('_seq'));

            // Affichez la liste des tables
            console.log(greenText, 'Tables disponibles:');
            tables.forEach((tableName, index) => {
                console.log(`${index + 1}. ${tableName}`);
            });

            // Interface de lecture pour la saisie utilisateur
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            // Demandez à l'utilisateur de choisir une table
            rl.question('Choisissez le numéro de la table que vous souhaitez inspecter : ', (choice) => {
                const selectedTableIndex = parseInt(choice) - 1;

                if (isNaN(selectedTableIndex) || selectedTableIndex < 0 || selectedTableIndex >= results.length) {
                    console.log(redText, 'Choix invalide. Fermeture du programme.');
                    rl.close();
                    connection.end();
                    return;
                }

                // Récupérez le nom de la table sélectionnée
                const selectedTableName = tables[selectedTableIndex];

                // Affichez le nom de la table sélectionnée
                console.log(greenText, `Vous avez choisi la table : ${selectedTableName}`);

                // Query pour obtenir les informations sur la table
                const query = `DESCRIBE ${selectedTableName}`;

                // Exécutez la requête
                connection.query(query, (error, results) => {
                    if (error) {
                        throw error;
                    }

                    afficherTableau(results);
                    console.log(object);
                    rl.close();

                    const projectPath = path.join(process.cwd(), dbConfig.name);
                    process.chdir(projectPath);

                    execPromise = util.promisify(exec);

                    const confirmQ =
                    {
                        type: 'confirm',
                        name: 'confirmQuestion',
                        message: 'Do you want to create an angular component, service and model of this table?',
                    }

                    inquirer.prompt(confirmQ)
                        .then((answers) => {
                            if (answers.confirmQuestion) {
                                console.log(purpleText, `creating component ${selectedTableName} ...`);
                                execPromise(`ng generate component ${selectedTableName}`);

                                console.log(greenText, 'Component created successfully.');

                                const directoryModelPath = path.join(process.cwd(), 'src', 'model');

                                // Vérifier si le dossier model existe déjà
                                if (!fs.existsSync(directoryModelPath)) {
                                    // Créer le dossier
                                    fs.mkdirSync(directoryModelPath);
                                    console.log('Le dossier "model" a été créé avec succès dans src.');
                                } else {
                                    console.log('Le dossier "model" existe déjà dans src.');
                                }

                                process.chdir(directoryModelPath);

                                console.log(purpleText, `creating model ${selectedTableName} ...`);

                                // Générer le contenu du fichier
                                const fileContent = generateTableModel(object, selectedTableName);

                                // Écrire le contenu dans le fichier team.ts
                                fs.writeFile(`${selectedTableName}.ts`, fileContent, (err) => {
                                    if (err) {
                                        console.error(redText,`Erreur lors de la création du fichier ${selectedTableName}.ts :`, err);
                                    } else {
                                        console.log(greenText, `Le fichier ${selectedTableName}.ts a été créé avec succès.`);
                                    }
                                });

                                const directoryPath = path.resolve(process.cwd(), '..');
                                process.chdir(directoryPath);
                                console.log(process.cwd());
                                const servicePath = path.join(process.cwd(), 'service');
                                // Vérifier si le dossier existe déjà
                                if (!fs.existsSync(servicePath)) {
                                    // Créer le dossier
                                    fs.mkdirSync(servicePath);
                                    console.log('Le dossier "service" a été créé avec succès dans src.');
                                } else {
                                    console.log('Le dossier "service" existe déjà dans src.');
                                }
                                process.chdir(servicePath);

                                const directoryServicePath = path.join(process.cwd(), `${selectedTableName}`);

                                // Vérifier si le dossier existe déjà
                                if (!fs.existsSync(directoryServicePath)) {
                                    // Créer le dossier
                                    fs.mkdirSync(directoryServicePath);
                                    console.log(`Le dossier "${selectedTableName}" a été créé avec succès dans src.`);
                                } else {
                                    console.log(`Le dossier "${selectedTableName}" existe déjà dans src.`);
                                }


                                process.chdir(directoryServicePath);

                                console.log(purpleText, `creating service ${selectedTableName} ...`);
                                execPromise(`ng generate service ${selectedTableName}`);

                                console.log(greenText, 'Service created successfully.');
                                console.log(process.cwd())

                            } else {
                                // Exit the program
                                console.log(purpleText, 'Exiting the program.');
                                process.exit(0);
                            }
                        })
                        .catch((error) => {
                            console.error(redText, 'Error:', error);
                        });
                });
                
            });
        });
    });
}

// Générer le contenu du fichier team.ts
function generateTableModel(tableObject, tableName) {
    let content = `export class ${tableName} {\n\n`;

    // Générer les propriétés de la classe à partir de l'objet
    for (const property in tableObject) {
        content += `    ${property}!: ${tableObject[property]};\n`;
    }

    content += `}\n`;

    return content;
}

function afficherTableau(tableau) {
    // Longueur maximale de chaque colonne
    const largeurColonne1 = 15;
    const largeurColonne2 = 15;

    // Dessiner la bordure supérieure
    let ligneBordure = '╔' + '═'.repeat(largeurColonne1) + '╦' + '═'.repeat(largeurColonne2) + '╗';
    console.log(ligneBordure);

    // Afficher les en-têtes de colonnes
    console.log('║' + ' Champ'.padEnd(largeurColonne1) + '║' + ' Type '.padEnd(largeurColonne2) + '║');

    // Dessiner la ligne de séparation entre l'en-tête et les données
    console.log('╠' + '═'.repeat(largeurColonne1) + '╬' + '═'.repeat(largeurColonne2) + '╣');

    // Afficher les données
    tableau.forEach(row => {
        const typeWithoutParams = row.Type.split('(')[0].toLowerCase(); 
        console.log('║' + row.Field.toString().padEnd(largeurColonne1) + '║' + row.Type.toString().padEnd(largeurColonne2) + '║');
        if (numeric.includes(typeWithoutParams)) object[row.Field.toString()] = 'number';
        else if (bool.includes(typeWithoutParams)) object[row.Field.toString()] = 'boolean';
        else if (date.includes(typeWithoutParams)) object[row.Field.toString()] = 'Date';
        else if (chaine.includes(typeWithoutParams)) object[row.Field.toString()] = 'string';
        else object[row.Field.toString()] = 'unknown'; 
    });

    // Dessiner la bordure inférieure
    console.log('╚' + '═'.repeat(largeurColonne1) + '╩' + '═'.repeat(largeurColonne2) + '╝');
}
