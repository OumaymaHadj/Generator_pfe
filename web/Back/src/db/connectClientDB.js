import mongoose from "mongoose";
import mysql from "mysql2/promise";
import { greenText, purpleText, redText } from "../../public/data-modal.js";

import pkg from 'pg';
const { Client } = pkg;
export default async function connectClientDB(dbType, uri) {
  let connection;

  try {
    if (dbType === "mongoDB") {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log(uri);
      connection = mongoose.connection;
      console.log(greenText, '\n\tConnected to MongoDB \u2714.\n');
    } else if (dbType === "postgres") {
      connection = new Client({ connectionString: uri });
      await connection.connect();
      console.log(greenText, '\n\tConnected to PostgreSQL \u2714.\n');
    } else if (dbType === "mysql") {
      connection = await mysql.createConnection(uri);
      console.log(greenText, '\n\tConnected to MySQL \u2714.\n');
    } else {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
  } catch (error) {
    console.error(`Failed to connect to ${dbType}:`, error.message);
    throw error;
  }

  return connection;
}
