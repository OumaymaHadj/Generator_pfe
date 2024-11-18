#!/usr/bin/env node
import express from 'express'; // pour créer le serveur web
import welcome from './src/welcome/welcome.js';
import bodyParser from "body-parser"; // middleware pour analyser les corps des requêtes HTTP.
import path from "path";
import ensureDockerRunningAndCompose from "./docker.js";



const app = express();
const port = 3000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static("views"));

app.set("view engine", "ejs"); // Définit EJS comme moteur de vue.
app.use(express.json()); // Middleware pour analyser les corps des requêtes en JSON.


app.listen(port, () => { //  Démarre le serveur sur le port 3000
  welcome();
  ensureDockerRunningAndCompose();
});