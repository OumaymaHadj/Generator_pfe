import inquirer from "inquirer";
import readline from "readline";
import path from "path";
import fs from "fs/promises";
import os from "os";
import connectClientDB from "./db/connectClientDB.js";
import getAllCollections from "./db/mongoDB.js";
import getAllPostgresTables from "./db/postgresDB.js";
import getAllMysqlTables from "./db/mysqlDB.js";
import checkAndRunContainer from "../docker.js";
import createReactComponent from "./front/react/createComponentReact.js";
import createVueComponent from "./front/Vue/createComponentVue.js";
import createAngularComponent from "./front/angular/createComponentAngular.js";

export default async function gatherDatabaseInfo(projectAnswers, projectKey) {
  const { database } = projectAnswers;

  try {
    const databaseInfo = await inquirer.prompt([
      { type: 'input', name: 'host', message: 'Enter the database host:' },
      { type: 'input', name: 'username', message: 'Enter the database username:' },
      { type: 'password', name: 'password', message: 'Enter the database password:' },
      { type: 'input', name: 'port', message: 'Enter the database port:' },
      { type: 'input', name: 'databaseName', message: 'Enter the database name:' },
    ]);

    const { host, port, username, password, databaseName } = databaseInfo;

    const confirmAnswer = await inquirer.prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to connect to the database?',
    });

    if (!confirmAnswer.confirm) {
      console.log('Exiting the program.');
      process.exit(0);
    }

    let uri;
    let tables = [];
    let clientConnection;

    if (database === 'mongoDB') {
      checkAndRunContainer('mongo');
      uri = `mongodb://${host}:${port}/${databaseName}?authSource=admin`;
    } else if (database === 'postgres') {
      checkAndRunContainer('postgres');
      uri = `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${databaseName}`;
    } else if (database === 'mysql') {
      await checkAndRunContainer('mysql');
      uri = `mysql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${databaseName}`;
    } else {
      throw new Error('Unsupported database type');
    }

    clientConnection = await connectClientDB(database, uri);

    if (clientConnection) {
      tables = await retrieveTables(database, clientConnection, databaseName);

      console.log('\n\tTables available:\n');
      tables.forEach((table, index) => {
        console.info(`\t${index + 1}. ${table.name}`);
      });

      const selectedTables = await selectTables(tables);

      if (selectedTables.length > 0) {
        await generateComponents(projectAnswers, selectedTables, projectKey, database, databaseInfo);
      } else {
        console.log('\nNo tables were selected');
      }

      clientConnection.close();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function retrieveTables(database, clientConnection, databaseName) {
  switch (database) {
    case 'mongoDB':
      return await getAllCollections(clientConnection, databaseName);
    case 'postgres':
      return await getAllPostgresTables(clientConnection);
    case 'mysql':
      return await getAllMysqlTables(clientConnection);
    default:
      throw new Error('Unsupported database type');
  }
}

async function selectTables(tables) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const selectedTables = [];

  function askTableSelection() {
    return new Promise((resolve) => {
      rl.question(
        "\nPlease indicate the table number you would like to review, or type 'q' to quit: ",
        async (choice) => {
          if (choice.toLowerCase() === 'q') {
            rl.question(
              "\nWould you like to create Model, Service, and Component for specific tables? Type indices separated by commas, or type 'all' to add all tables, or press Enter to quit without adding: ",
              (response) => {
                if (response.toLowerCase() === 'all') {
                  selectedTables.push(...tables);
                  console.log('\nAll tables have been added to the array.');
                } else if (response) {
                  const indices = response.split(',').map((num) => parseInt(num.trim()) - 1);
                  indices.forEach((index) => {
                    if (index >= 0 && index < tables.length) {
                      selectedTables.push(tables[index]);
                    }
                  });
                  console.log('\nSelected tables added.');
                }
                resolve();
              }
            );
          } else {
            const selectedTableIndex = parseInt(choice) - 1;
            if (!isNaN(selectedTableIndex) && selectedTableIndex >= 0 && selectedTableIndex < tables.length) {
              const selectedTable = tables[selectedTableIndex];
              console.log(`\nTable: ${selectedTable.name}`);
              afficherTableau(selectedTable.fields);
              askTableSelection().then(resolve);
            } else {
              console.log('Invalid choice. Please try again.');
              askTableSelection().then(resolve);
            }
          }
        }
      );
    });
  }

  await askTableSelection();
  rl.close();
  return selectedTables;
}

async function generateComponents(projectAnswers, selectedTables, projectKey, database, databaseInfo) {
  console.log('ggggggggggggggggggggggggggg', database);
  const { techFront, projectName } = projectAnswers;
  const projectNameBack = projectName + "Back";
  const projectDirBack = path.join(os.homedir(), projectKey, projectNameBack);

  // Prompt to confirm component generation
  const confirmAnswer = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
    message: 'Do you want to create Model, Service, and Component for the selected tables?',
  });

  if (!confirmAnswer.confirm) {
    console.log('Operation cancelled.');
    return; // Gracefully return without exiting the process
  }

  // Frontend component generation
  switch (techFront) {
    case 'Angular':
      await createAngularComponent(projectName, selectedTables, projectKey, database);
      break;
    case 'React':
      await createReactComponent(projectName, selectedTables, projectKey, database);
      break;
    case 'Vue':
      await createVueComponent(projectName, selectedTables, projectKey, database);
      break;
    default:
      console.log('Unsupported front-end technology.');
      return;
  }

  console.log(`${techFront} components created successfully.`);
  
  // Database connection generation
  switch (database) {
    case "mysql":
      console.log('ggggggg');
      await generateMySQLConnectionContent(databaseInfo, projectDirBack, projectNameBack);
      break;
    case "mongoDB":
      await generateMongooseConnectionContent(databaseInfo, projectDirBack, projectNameBack);
      break;
    case "postgres":
      await generatePostgresConnectionContent(databaseInfo, projectDirBack, projectNameBack);
      break;
    default:
      console.log("Unsupported database.");
      return;
  }

  console.log(`Database configuration for ${database} generated successfully.`);
}

function afficherTableau(fields) {
  const largeurColonne1 = 30;
  const largeurColonne2 = 15;

  let ligneBordure =
    "\t╔" +
    "═".repeat(largeurColonne1) +
    "╦" +
    "═".repeat(largeurColonne2) +
    "╗";
  console.log(ligneBordure);

  console.log(
    "\t║" +
      " Field".padEnd(largeurColonne1) +
      "║" +
      " Type ".padEnd(largeurColonne2) +
      "║"
  );

  console.log(
    "\t╠" +
      "═".repeat(largeurColonne1) +
      "╬" +
      "═".repeat(largeurColonne2) +
      "╣"
  );

  fields.forEach((row) => {
    console.log(
      "\t║" +
        row.field.toString().padEnd(largeurColonne1) +
        "║" +
        row.type.toString().padEnd(largeurColonne2) +
        "║"
    );
  });

  console.log(
    "\t╚" +
      "═".repeat(largeurColonne1) +
      "╩" +
      "═".repeat(largeurColonne2) +
      "╝\n"
  );
}


async function generateMySQLConnectionContent(dataConnect, projectBackDir, projectNameBack) {
  console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh ',projectBackDir);
  const { host, port, username, password, databaseName } = dataConnect;
  const projectDir = path.resolve(projectBackDir, "db");
  const dbPath = path.join(projectDir, "dbConnection.js");
  console.log(projectDir);
  console.log(projectBackDir)
  // Ensure the directory exists
  try {
    await fs.mkdir(projectDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create the database directory:", err);
    return;
  }

  const content = `
var mysql = require('mysql2');
var connection = mysql.createConnection({
  host: '${host}',
  user: '${username}',
  password: '${password}',
  port: '${port}',
  database: '${databaseName}'
});

connection.connect(function(error) {
  if (error) {
    console.log('Error Connecting: ', error);
  } else {
    console.log('Database Connected Successfully..!!');
  }
});

module.exports = connection;
`;

  // Write the connection file
  try {
    await fs.writeFile(dbPath, content, "utf8");
    console.log("MySQL database connection file generated successfully.");
  } catch (err) {
    console.error("Failed to create MySQL connection file:", err);
  }
}

async function generateMongooseConnectionContent(
  dataConnect,
  projectDir,
  projectNameBack
) {
  const { host, port, username, password, databaseName } = dataConnect;

  const projectBackDir = path.resolve(projectDir, projectNameBack, "db");
  const dbPath = path.join(projectBackDir, "dbConnection.js");
  const appFile = path.join(projectDir, projectNameBack, "app.js");

  let contentApp;
  try {
    contentApp = await fs.readFile(appFile, "utf8");
  } catch (err) {
    console.error(`Failed to read ${appFile}:`, err);
    return;
  }

  try {
    await fs.mkdir(projectBackDir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create directory ${projectBackDir}:`, err);
    return;
  }

  const content = `
const mongoose = require('mongoose');

mongoose.connect('mongodb://${username}:${password}@${host}:${port}/${databaseName}', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
module.exports = mongoose;

`;

  // Write the content to the dbConnection.js file
  try {
    await fs.writeFile(dbPath, content, "utf8");
    console.log(`Database connection file created at ${dbPath}`);
  } catch (err) {
    console.error(`Failed to write to ${dbPath}:`, err);
    return;
  }

  // Optionally, you can add the DB import line to app.js if it's not present
  const dbImportLine = `const db = require('./db/dbConnection');`;
  if (!contentApp.includes(dbImportLine)) {
    const updatedContentApp = `${dbImportLine}\n${contentApp}`;
    try {
      await fs.writeFile(appFile, updatedContentApp, "utf8");
      console.log(`Updated ${appFile} with the database connection import.`);
    } catch (err) {
      console.error(`Failed to update ${appFile}:`, err);
    }
  } else {
    console.log(`Database connection import already exists in ${appFile}.`);
  }
}

async function generatePostgresConnectionContent(
  dataConnect,
  projectDir,
  projectNameBack
) {
  const { host, port, username, password, databaseName } = dataConnect;

  const projectBackDir = path.resolve(projectDir, projectNameBack, "db");
  const dbPath = path.join(projectBackDir, "dbConnection.js");

  await fs.mkdir(projectBackDir, { recursive: true });

  const content = `
const { Pool } = require('pg');
const pool = new Pool({
  user: '${username}',
  host: '${host}',
  database: '${databaseName}',
  password: '${password}',
  port: ${port}
});

pool.on('connect', () => {
  console.log('Database Connected Successfully..!!');
});

pool.on('error', (err) => {
  console.error('Error Connecting: ', err);
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    client.release(); 
  } catch (err) {
    console.error('Error testing the connection: ', err.message);
  }
};

testConnection();


module.exports = pool;
`;

  await fs.writeFile(dbPath, content, "utf8");
}
