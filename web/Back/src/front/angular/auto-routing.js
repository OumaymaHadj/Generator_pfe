import fs from 'fs';
import path from 'path';
import updataAppConfig from './auto-config.js';
import { greenText } from '../../../public/data-modal.js';



export async function watcherForUpdate(selectedTableName, nameComponentMaj, projectPath, projectKey, isFirstTable) {
    const routesFilePath = path.join(projectPath, "src", "app", "app.routes.ts");
    const importStatement = `import { ${nameComponentMaj}Component } from './${selectedTableName}/${selectedTableName}.component';`;

    try {
        let data = await fs.promises.readFile(routesFilePath, "utf8");

        // Add import statement if it doesn't already exist
        if (!data.includes(importStatement)) {
            data = `${importStatement}\n${data}`;
        }

        // Define the new route entry
        const newRouteEntry = `     { path: '${selectedTableName.toLowerCase()}', component: ${nameComponentMaj}Component }`;
        const parentRoutePath = projectKey;
        const childrenStart = `  { path: '${parentRoutePath}', children: [\n`;
        const childrenEnd = "    ]\n  }";

        // If the parent route doesn't exist, add the entire block
        if (!data.includes(childrenStart)) {
            data = data.replace(
                "export const routes: Routes = [",
                `export const routes: Routes = [\n${childrenStart}${newRouteEntry}\n${childrenEnd}`
            );
        } else {
            // If the parent route exists, insert the new child route inside the children array
            const childrenRegex = new RegExp(`${escapeRegex(childrenStart)}([\\s\\S]*?)${escapeRegex(childrenEnd)}`);
            data = data.replace(childrenRegex, (match, p1) => {
                if (p1.includes(newRouteEntry)) {
                    return match; // The route entry already exists
                }
                return `${childrenStart}${p1.trim()},\n${newRouteEntry}\n${childrenEnd}`;
            });
        }

        // Add the redirect route only for the first table
        if (isFirstTable) {
            const redirectRoute = `  { path: '', redirectTo: '${parentRoutePath}/${selectedTableName.toLowerCase()}', pathMatch: 'full' },`;

            // Add the redirect route if it doesn't already exist
            if (!data.includes(redirectRoute)) {
                data = data.replace(
                    "export const routes: Routes = [",
                    `export const routes: Routes = [\n${redirectRoute}`
                );
            }
        }

        // Write the updated data back to the routes file
        await fs.promises.writeFile(routesFilePath, data, "utf8");
        console.log(greenText, `\n \t Route added for \x1b[1m${selectedTableName}\x1b[0m \x1b[32mcomponent in app.routes.ts \u2714.`);
    } catch (err) {
        console.error(`Error updating routes file: ${err}`);
    }

    // Update app config after route changes
    await updataAppConfig(projectPath);
}

/*export async function watcherForUpdate(selectedTableName, nameComponentMaj, projectPath, projectKey) {
    const routesFilePath = path.join(projectPath, "src", "app", "app.routes.ts");
    const importStatement = `import { ${nameComponentMaj}Component } from './${selectedTableName}/${selectedTableName}.component';`;

    try {
        let data = await fs.promises.readFile(routesFilePath, "utf8");

        // Add import statement if it doesn't already exist
        if (!data.includes(importStatement)) {
            data = `${importStatement}\n${data}`;
        }

        // Define the new route entry
        const newRouteEntry = `     { path: '${selectedTableName.toLowerCase()}', component: ${nameComponentMaj}Component }`;
        const parentRoutePath = projectKey;
        const childrenStart = `  { path: '${parentRoutePath}', children: [\n`;
        const childrenEnd = "    ]\n  }";
        const redirectRoute = `  { path: '', redirectTo: '${parentRoutePath}/${selectedTableName.toLowerCase()}', pathMatch: 'full' },`;

        // If the parent route doesn't exist, add the entire block
        if (!data.includes(childrenStart)) {
            data = data.replace(
                "export const routes: Routes = [",
                `export const routes: Routes = [\n${childrenStart}${newRouteEntry}\n${childrenEnd}`
            );
        } else {
            // If the parent route exists, insert the new child route inside the children array
            const childrenRegex = new RegExp(`${escapeRegex(childrenStart)}([\\s\\S]*?)${escapeRegex(childrenEnd)}`);
            data = data.replace(childrenRegex, (match, p1) => {
                if (p1.includes(newRouteEntry)) {
                    return match; // The route entry already exists
                }
                return `${childrenStart}${p1.trim()},\n${newRouteEntry}\n${childrenEnd}`;
            });
        }

        // Write the updated data back to the routes file
        await fs.promises.writeFile(routesFilePath, data, "utf8");
        console.log(greenText, `\n \t Route added for \x1b[1m${selectedTableName}\x1b[0m \x1b[32mcomponent in app.routes.ts \u2714.`);
    } catch (err) {
        console.error(`Error updating routes file: ${err}`);
    }

    // Update app config after route changes
    await updataAppConfig(projectPath);
}*/

// Helper function to escape special characters for regex
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}