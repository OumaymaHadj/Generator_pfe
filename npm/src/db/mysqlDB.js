import { numeric, bool, chaine, date } from "../../public/data-modal.js";
import mysql from "mysql2/promise";

export default async function getAllMysqlTablesAndFields(connection) {
  if (!connection || typeof connection.query !== "function") {
    throw new Error("Invalid MySQL connection object");
  }

  try {
    // Get the list of all tables
    const [tables] = await connection.query(`SHOW TABLES;`);

    if (!Array.isArray(tables) || tables.length === 0) {
      throw new Error(
        "No tables found or unexpected response format from query"
      );
    }

    const tableDetails = [];

    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];

      const [columns] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\`;`);

      const fields = columns.map((column) => {
        //console.log(column);
        if (column && column.Field && column.Type) {
          let jsType;

          const sqlType = column.Type.toLowerCase();

          if (numeric.some((type) => sqlType.includes(type))) {
            jsType = "number";
          } else if (bool.some((type) => sqlType.includes(type))) {
            jsType = "boolean";
          } else if (date.some((type) => sqlType.includes(type))) {
            jsType = "Date";
          } else if (chaine.some((type) => sqlType.includes(type))) {
            jsType = "string";
          } else {
            jsType = "unknown";
          }

          const isPrimaryKey = column.Key === "PRI";
          const isForeignKey = column.Key === "MUL";
          const isAutoIncrement = column.Extra.includes("auto_increment");

          return {
            field: column.Field,
            type: jsType,
            ...(isPrimaryKey && { pk: true }),
            ...(isPrimaryKey && isAutoIncrement && { autoIncrement: true }), // Check for auto-increment
            ...(isForeignKey && { fk: true }),
          };
        } else {
          console.error(`Invalid column data: ${JSON.stringify(column)}`);
          return null;
        }
      }).filter(Boolean);

      tableDetails.push({
        name: tableName,
        fields: fields,
      });
    }

    //console.log(JSON.stringify(tableDetails, null, 2));

    return tableDetails;
  } catch (err) {
    console.error("Error retrieving MySQL tables and fields:", err);
    throw err;
  }
}
