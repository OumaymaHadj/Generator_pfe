import { createProject } from "../generateANDownload/createProject.js";



export default async function generateProject(req, res) {
    try {
        const result = await createProject(req, res)
    } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).json({ error: "An error occurred while creating the Project." });
    }
}