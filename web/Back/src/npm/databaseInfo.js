import inquirer from 'inquirer';
import readline from 'readline';
import help from '../welcome/help.js';
import path from 'path';
import fs from 'fs';
import { mac_address, queryAsync } from '../welcome/welcome.js';
import { connectToDataBase } from '../db/myDB.js';
import { numeric, bool, chaine, date, greenText, purpleText, redText  } from '../../public/data-modal.js';
import { showLoading } from "../db/myDB.js";
import checkAndRunContainer from "../docker/docker.js";
import connectClientDB from "../db/connectClientDB.js";
import getAllPostgresTables from "../db/postgresDB.js";
import getAllMysqlTables from "../db/mysqlDB.js";


let object = {};
let tables;
let projectName;
let database;
let id_project;
let selectedTableName;

export { selectedTableName, projectName, object, id_project, queryAsync }

export default async function gatherDatabaseInfo() {

    try {

        const choices = await getProjectChoices();
        console.log('\n');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'project',
                message: 'Choose a project:',
                choices: choices
            }
        ]);
        id_project = answer.project
        let result =  await queryAsync(`SELECT database_type FROM project WHERE id_project = ${id_project}`);
        if (result.length > 0) {
            database = result[0].database_type;
            console.log('Database Type:', database);
        } else {
            console.log('No database type found for the given project ID.');
        }

        const projectPath = path.join(process.cwd(), 'projects', projectName);
        if (!fs.existsSync(projectPath)) {
            //const result = await queryAsync(`DELETE FROM project WHERE id_project = ${answer.project}`);
            console.log(redText, `Project ${projectName} does not exist anymore. \u2717`);
            process.exit(0);
        }

        const databaseInfo = await inquirer.prompt([
            {
                type: 'input',
                name: 'databaseHost',
                message: 'Enter the database host:'
            },
            {
                type: 'input',
                name: 'databaseUsername',
                message: 'Enter the database username:'
            },
            {
                type: 'password',
                name: 'databasePassword',
                message: 'Enter the database password:'
            },
            {
                type: 'port',
                name: 'databasePort',
                message: 'Enter the database port:'
            },
            {
                type: 'input',
                name: 'databaseName',
                message: 'Enter the database name:'
            }
        ]);

        const { databaseHost, databaseUsername, databasePassword, databasePort, databaseName } = databaseInfo;

        const sql = `
            UPDATE project
            SET database_host = ?,
                database_username = ?,
                database_password = ?,
                database_port = ?,
                database_name = ?
            WHERE id_project = ?
        `;
        const values = [databaseHost, databaseUsername, databasePassword, databasePort, databaseName, answer.project];

        await queryAsync(sql, values);
        console.log(greenText, '\n\tDatabase user config updated \u2714.\n');

        /*let dbConfig = {
            host: databaseHost,
            user: databaseUsername,
            password: databasePassword,
            database: databaseName,
        };*/

        const confirmAnswer = await inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            message: 'Do you want to connect to the database?'
        });

        if (confirmAnswer.confirm) {
            if (database === 'MySQL'){
                await checkAndRunContainer("mysql")
                let uri = `mysql://${encodeURIComponent(databaseUsername)}:${encodeURIComponent(databasePassword)}@${databaseHost}:${databasePort}/${databaseName}`;
                let clientConnection = await connectClientDB('mysql', uri);

                if (clientConnection) {
                    tables = await getAllMysqlTables(clientConnection);
                    console.log('tables', JSON.stringify(tables, null, 2)  );
                    console.log(purpleText, '\n\tTables available :\n');
                    tables.forEach((name, index) => {
                        console.info(`\t${index + 1}. ${name}`);
                    });
                }
              /*  const connect = await connectToDataBase(dbConfig)
                connect.query('SHOW TABLES', (error, results) => {
                    if (error) {
                        throw error;
                    }
    
                    tables = results
                        .map(result => Object.values(result)[0])
                        .filter(tableName => !tableName.endsWith('_seq'));
    
                    console.log(purpleText, '\n\tTables available :\n');
                    tables.forEach((tableName, index) => {
                        console.info(`\t${index + 1}. ${tableName}`);
                    });
                    console.log('\n');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
    
                    rl.question('Please indicate the table number you would like to review : ', (choice) => {
                        const selectedTableIndex = parseInt(choice) - 1;
    
                        if (isNaN(selectedTableIndex) || selectedTableIndex < 0 || selectedTableIndex >= results.length) {
                            console.log(redText, 'Invalid choice. Closing the program. \u2717');
                            rl.close();
                            connect.end();
                            return;
                        }
    
                        selectedTableName = tables[selectedTableIndex];
    
                        console.log(greenText, `\n\tTable: \x1b[1m${selectedTableName}`);
    
                        connect.query(`DESCRIBE ${selectedTableName}`, (error, results) => {
                            if (error) {
                                throw error;
                            }
    
                            afficherTableau(results);
                            rl.close();
                            help();
                        });
                    });
                }); */
            } else if (database === "PostgreSQL") {
                await checkAndRunContainer("postgres")
                let uri = `postgresql://${encodeURIComponent(databaseUsername)}:${encodeURIComponent(databasePassword)}@${databaseHost}:${databasePort}/${databaseName}`;
                let clientConnection = await connectClientDB('postgres', uri);
                if (clientConnection) {
                    let tables = await getAllPostgresTables(clientConnection);
                    console.log('tables', tables );
                }
            }
         
        } else {
            console.log(purpleText, 'Exiting the program.');
            process.exit(0);
        }
    } catch (error) {
        console.error(redText, 'Error:', error);
    } 
}


async function getProjectChoices() {
    try {

        const loadingInterval = showLoading();
        await new Promise(resolve => setTimeout(resolve, 3000));
        const result = await queryAsync(`SELECT id_project, name, frontend_technology, database_type FROM project WHERE user_id = '${mac_address}'`);
        if (result && result.length === 0) {
            console.log(redText, '\n\n\tNo project found. Create a new one first. \u2717 \n');
            process.exit(0);
        }
        clearInterval(loadingInterval);
        const choices = result.map(project => {

            //            const displayText = `Name: \x1b[1m${project.name}\x1b[0m, Front-end: \x1b[1m${project.frontend_technology}\x1b[0m, Database: \x1b[1m${project.database_type}\x1b[0m`;

            const displayText = `name: ${project.name}, frontend: ${project.frontend_technology}, database: ${project.database_type}`;

            projectName = project.name;
            id_project = project.id_project;
            return {
                name: displayText,
                value: project.id_project,
            };
        });
        return choices;
    } catch (error) {
        console.error('Error executing SQL query:', error);
        throw error;
    }
}

function afficherTableau(tableau) {

    const largeurColonne1 = 50;
    const largeurColonne2 = 15;

    let ligneBordure = '\t╔' + '═'.repeat(largeurColonne1) + '╦' + '═'.repeat(largeurColonne2) + '╗';
    console.log(ligneBordure);

    console.log('\t║' + ' Champ'.padEnd(largeurColonne1) + '║' + ' Type '.padEnd(largeurColonne2) + '║');

    console.log('\t╠' + '═'.repeat(largeurColonne1) + '╬' + '═'.repeat(largeurColonne2) + '╣');

    tableau.forEach(row => {
        const typeWithoutParams = row.Type.split('(')[0].toLowerCase();
        console.log('\t║' + row.Field.toString().padEnd(largeurColonne1) + '║' + row.Type.toString().padEnd(largeurColonne2) + '║');
        if (numeric.includes(typeWithoutParams)) object[row.Field.toString()] = 'number';
        else if (bool.includes(typeWithoutParams)) object[row.Field.toString()] = 'boolean';
        else if (date.includes(typeWithoutParams)) object[row.Field.toString()] = 'Date';
        else if (chaine.includes(typeWithoutParams)) object[row.Field.toString()] = 'string';
        else object[row.Field.toString()] = 'unknown';
    });

    console.log('\t╚' + '═'.repeat(largeurColonne1) + '╩' + '═'.repeat(largeurColonne2) + '╝\n');
}