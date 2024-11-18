import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { mac_address, queryAsync } from "../welcome/welcome.js"
import { greenText, purpleText, redText } from "../../public/data-modal.js";
import { showLoading } from "../db/myDB.js";
import { exec } from "child_process";

export default function initializeProject() {
    const projectsDir = path.join(process.cwd(), "projects");
    if (!fs.existsSync(projectsDir)) {
        fs.mkdirSync(projectsDir);
    }

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
                "Express.js (Node.js)",
                "Django (Python)",
                "Spring Boot (Java)",
                "Laravel (PHP)",
            ],
        },
        {
            type: "list",
            name: "database",
            message: "Which database do you have?",
            choices: [
                "SQLite",
                "MySQL",
                "MongoDB",
                "PostgreSQL",
                "Microsoft SQL Server",
                "Oracle Database",
            ],
        },
    ];

    inquirer.prompt(wizardToCreateProject).then(async (answers) => {
        create(answers);
    });
}


export function create(answers) {
    return new Promise((resolve, reject) => {
        const { projectName, techFront, techBack, database } = answers;
        const loadingInterval = showLoading();

        const projectsDir = path.join(process.cwd(), "projects");
        if (!fs.existsSync(projectsDir)) {
            fs.mkdirSync(projectsDir);
        }
        exec(
            techFront === "Angular"
                ? `npx @angular/cli new ${projectName} --skip-install`
                : techFront === "React.js"
                    ? `npx create-react-app ${projectName}`
                    : `npx @vue/cli create ${projectName} --default`,
            { cwd: projectsDir },
            async (createError) => {
                clearInterval(loadingInterval);
                if (createError) {
                    console.error(`Error creating ${techFront} project: ${createError}`);
                    return;
                }
                console.log(`\n`);
                const projectKey = await generateKey(25);
                console.log(purpleText, `\tDONE \u2714.\n`);
                console.log(
                    greenText,
                    `\t${techFront} project \x1b[1m${projectName}\x1b[0m \x1b[32mcreated.`
                );

                try {
                    await queryAsync(
                        "INSERT INTO project (`key`, user_id , name, frontend_technology, backend_technology, database_type) VALUES (?, ?, ?, ?, ?, ?)",
                        [
                            projectKey,
                            mac_address,
                            projectName,
                            techFront,
                            techBack,
                            database,
                        ]
                    );
                    if (techFront === "Angular") {
                        await updateStyles(projectName, projectsDir);
                    }
                    if (techFront === "Vue") {
                        await ensureMainJsExistsVue(projectName);
                        await updateAppVue(projectName);
                    }
                } catch (error) {
                    console.error("Error executing SQL query:", error);
                }
            }
        );
    });
}


async function updateStyles(projectName, projectsDir) {
    const destCssFilePath = path.join(projectsDir, projectName, "src/styles.css");
    const srcCssFilePath = path.join(
        process.cwd(),
        "public/stylesheet/styles.css"
    );

    fs.readFile(srcCssFilePath, "utf8", (err, data) => {
        if (err) {
            console.error(`Error reading CSS file: ${err}`);
            return;
        }

        fs.writeFile(destCssFilePath, data, "utf8", (err) => {
            if (err) {
                console.error(`Error writing CSS file to project: ${err}`);
                return;
            }

            console.log("\tCSS file updated \u2714.");
        });
    });
}