import express from 'express'; // pour créer le serveur web
import help from './src/welcome/help.js';
import bodyParser from "body-parser"; // middleware pour analyser les corps des requêtes HTTP.
import indexRouter from "./routes/index.js"; // routeur
import path from "path";
import cors from "cors";
import ensureDockerRunningAndCompose from "./src/docker/docker.js";



const app = express();
const port = 4000;

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static("views"));

app.set("view engine", "ejs"); // Définit EJS comme moteur de vue.
app.use(express.json()); // Middleware pour analyser les corps des requêtes en JSON.

app.use('/',indexRouter) 

app.listen(port, () => { //  Démarre le serveur sur le port 3000
  console.log(`Server running on port ${port}`);
  ensureDockerRunningAndCompose();
});