
import connectClientDB from "../db/connectClientDB.js";
import getAllCollections from "../db/mongoDB.js";
import getAllPostgresTables from "../db/postgresDB.js";
import getAllMysqlTables from "../db/mysqlDB.js";
import checkAndRunContainer from "./dockerController.js";

export default async function connect(req, res) {
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
}