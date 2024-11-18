import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { generateProject } from "../createProject.js";

let projectAnswers;

export default async function initializeProject() {
    const wizardToCreateProject = [
        {
            type: "input",
            name: "projectName",
            message: "What is your project name?",
            validate: (input) =>
                input.trim() !== "" ? true : "Please enter a valid project name",
        },
        {
            type: "list",
            name: "techFront",
            message: "Which front-end technology do you want to use?",
            choices: ["React", "Vue", "Angular"],
        },
        {
            type: "list",
            name: "techBack",
            message: "Which back-end technology do you want to use?",
            choices: [
                "Express"
            ],
        },
        {
            type: "list",
            name: "database",
            message: "Which database do you have?",
            choices: [
                "mysql",
                "mongoDB",
                "postgres"
            ],
        },
    ];

    projectAnswers = await inquirer.prompt(wizardToCreateProject);
    generateProject(projectAnswers);
}

export { projectAnswers };