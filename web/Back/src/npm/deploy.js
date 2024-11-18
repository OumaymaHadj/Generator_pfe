import ftp from 'basic-ftp';
import path from 'path';
import fs from 'fs';
import { projectName } from "./databaseInfo.js";


let client;
const greenText = '\x1b[32m%s\x1b[0m';

export default async function createFtpFolder() {

    client = new ftp.Client();

    try {
        await client.access({
            host: '79.137.5.88',
            user: 'generat@flesk.tn',
            password: 'jBucUQLQaEA6JtrK4Hkw'
        });

        const localDistPath = path.join(process.cwd(), 'dist', `${projectName}`, 'browser');
        const remotePath = '/';

        await client.ensureDir(`${projectKey}`);
        console.log(greenText, `Folder '${projectKey}' created successfully.`);

       
        const fullRemotePath = path.join(remotePath, projectKey);
        console.log("Full remote path:", fullRemotePath);

        try {
            await uploadFolderContents(localDistPath, fullRemotePath);
            console.log(greenText, 'Upload complete!');
        } catch (error) {
            console.error('Error uploading contents:', error);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        client.close();
    }

}

async function uploadFolderContents(localPath, remotePath) {

    const items = await fs.promises.readdir(localPath);

    for (const item of items) {
        const itemPath = path.join(localPath, item);
        const remoteItemPath = path.join(remotePath, item);

        const stats = await fs.promises.stat(itemPath);
        if (stats.isFile()) {
            await client.uploadFrom(itemPath, remoteItemPath);
            console.log(`Uploaded: ${itemPath} -> ${remoteItemPath}`);
        } else if (stats.isDirectory()) {
            await client.ensureDir(remoteItemPath);
            await uploadFolderContents(itemPath, remoteItemPath);
        }
    }

    console.log("Folder uploaded successfully");

}