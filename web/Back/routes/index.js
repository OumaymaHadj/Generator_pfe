import express from "express";
import path from "path";
import fs from "fs-extra";
import { generateProject } from "../src/generateANDownload/createProject.js";
import { archiveProject } from "../src/generateANDownload/downloadProject.js";
import connectClientDB from "../src/db/connectClientDB.js";
import getAllCollections from "../src/db/mongoDB.js";
import getAllPostgresTables from "../src/db/postgresDB.js";
import getAllMysqlTables from "../src/db/mysqlDB.js";
import checkAndRunContainer from "../src/docker/docker.js";
import createComponentAng from "../src/front/angular/createComponentAngular.js";
import createComponentReact from "../src/front/react/createComponentReact.js";
import createComponentVue from "../src/front/vue/createComponentVue.js";
import { exec } from "child_process";
import util from "util";

let router = express.Router();

const projectsDir = path.join(process.cwd(), "projects");


router.post("/connect", async (req, res) => {
  const { database, host, port, username, password, namedb } = req.body;
  let uri;
  let tables;
  let clientConnection;

  try {
    if (database === "mongoDB") {
      checkAndRunContainer("mongo")
      uri = `mongodb://${host}:${port}/${namedb}?authSource=admin`;
      console.log(uri);
    } else if (database === "postgres") {
      checkAndRunContainer("postgres")
      uri = `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${namedb}`;
    } else if (database === "mysql") {
      await checkAndRunContainer("mysql")
      uri = `mysql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${namedb}`;
    } else {
      return res.status(400).send("Unsupported database type");
    }

    clientConnection = await connectClientDB(database, uri);

    if (clientConnection) {
      switch (database) {
        case "mongoDB":
          tables = await getAllCollections(clientConnection, namedb);
          break;
        case "postgres":
          tables = await getAllPostgresTables(clientConnection);
          break;
        case "mysql":
          tables = await getAllMysqlTables(clientConnection);
          //console.log(JSON.stringify(tables, null, 2));
          break;
        default:
          break;
      }
      res
        .status(200)
        .json({ message: "Successfully connected to client database", tables });
    } else {
      res.status(500).send("Failed to connect to client database");
    }
  } catch (err) {
    console.error("Client DB Connection Error:", err);
    res.status(500).send("Failed to connect to client database");
  } finally {
    if (clientConnection) {
      try {
        switch (database) {
          case "mongoDB":
            await clientConnection.close();
            break;
          case "postgres":
            await clientConnection.end();
            break;
          case "mysql":
            await clientConnection.end();
            break;
          default:
            break;
        }
      } catch (closeErr) {
        console.error("Error closing the database connection:", closeErr);
      }
    }
  }
});

router.post("/download", async (req, res) => {
  try {
    const { projectName, projectKey } = req.body;


    const projectsDir = path.resolve("projects");

    if (!fs.existsSync(projectsDir)) {
      return res.status(404).send('Project directory not found.');
    }

    const zipPath = await archiveProject(projectName, projectKey, projectsDir);
    console.log("zipPath:", zipPath);

    // Check if the zip file was successfully created
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, `${projectName}.zip`, (err) => {
        if (err) {
          console.error(`Download Error: ${err}`);
          return res.status(500).send('Error downloading the file.');
        } else {
          // Clean up the project directory and the zip file after successful download
          /*try {
            fs.rmSync(path.join(projectsDir, projectKey), { recursive: true, force: true });
            fs.unlinkSync(zipPath);
          } catch (cleanupErr) {
            console.error(`Cleanup Error: ${cleanupErr}`);
          }*/
        }
      });
    } else {
      return res.status(404).send('ZIP file not found.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ error: 'An error occurred while downloading the project.' });
  }
});

router.post("/generateProject", async (req, res) => {
  try {
    const result = await generateProject(req, res)
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "An error occurred while creating the Project." });
  }
});

router.post("/componentAngular", async (req, res) => {

  try {
    const result = await createComponentAng(req, res);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "An error occurred while creating the Angular component." });
  }
});

router.post("/componentReact", async (req, res) => {

  try {
    const result = await createComponentReact(res, req);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "An error occurred while creating the React component." });
  }
});

router.post("/componentVue", async (req, res) => {

  try {
    const result = await createComponentVue(req, res);

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "An error occurred while creating the VUe component." });
  }
});

router.post("/live-demo", async (req, res) => {

  const execPromise = util.promisify(exec);

  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { projectKey, projectName, techFront } = req.body;
  let runCommand;
  switch (techFront) {
    case 'Angular':
      runCommand = 'npx ng serve';
      break;
    case 'React':
      runCommand = 'npm start';
      break;
    case 'Vue':
      runCommand = 'npm run serve';
      break;
    default:
      break;
  }

  const projectDir = path.join(process.cwd(), "projects", projectKey);

  try {
    // Run front-end command
    const frontEndCommand = `cd ${path.resolve("projects", projectDir, projectName)} && ${runCommand}`;

    // Run back-end command
    const backEndCommand = `cd ${path.resolve("projects", projectDir, `${projectName}Back`)} && npm install && npm start`;

    // Wait for both commands to finish
    await Promise.all([
      exec(frontEndCommand),
      exec(backEndCommand)
    ]);

    console.log('Both projects started successfully.');
    res.status(200).send('Projects are starting...');
  } catch (error) {
    console.error('An error occurred while starting the projects:', error);
    res.status(500).send('Error starting the projects.');
  }
});

export default router;