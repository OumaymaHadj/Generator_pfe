
import connectClientDB from "../db/connectClientDB.js";
import getAllCollections from "../db/mongoDB.js";
import getAllPostgresTables from "../db/postgresDB.js";
import getAllMysqlTables from "../db/mysqlDB.js";
import checkAndRunContainer from "./dockerController.js";
import CryptoService from "../services/CryptoService.js";

export default async function connect(req, res) {
    const { encryptedDataConnect } = req.body;

    try {
        const decryptedData = CryptoService.decrypt(encryptedDataConnect);
        const { database, host, port, username, password, namedb } = decryptedData

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

                const encryptedTables = CryptoService.encrypt(tables);

                res
                    .status(200)
                    .json({ message: "Successfully connected to client database", tables : encryptedTables });
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



        //res.send({ success: true, data: decryptedData });
    } catch (error) {
        console.error("Erreur lors du déchiffrement :", error);
        res.status(500).send({ success: false, error: error.message });
    }
}