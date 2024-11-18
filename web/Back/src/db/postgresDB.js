
/*export default async function getAllPostgresTables(connection) {
    try {
        const res = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        return res.rows.map(row => row);
    } catch (err) {
        console.error('Error retrieving PostgreSQL tables:', err);
        throw err;
    }
}*/

/*export default async function getAllPostgresTables(connection) {
    try {
        const res = await connection.query(`
            SELECT 
                table_name, 
                column_name, 
                CASE 
                    WHEN data_type = 'integer' THEN 'number'
                    WHEN data_type LIKE '%char%' THEN 'string'
                    WHEN data_type LIKE '%text%' THEN 'string'
                    WHEN data_type = 'boolean' THEN 'boolean'
                    WHEN data_type = 'numeric' THEN 'number'
                    WHEN data_type LIKE '%timestamp%' THEN 'datetime'
                    ELSE 'string'
                END AS type
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position
        `);

        // Group the results by table_name and format them according to the required structure
        const tables = res.rows.reduce((acc, row) => {
            let table = acc.find(t => t.name === row.table_name);
            if (!table) {
                table = { name: row.table_name, fields: [] };
                acc.push(table);
            }
            table.fields.push({ field: row.column_name, type: row.type });
            return acc;
        }, []);

        return {
            message: "Successfully connected to client database",
            tables: tables
        };
    } catch (err) {
        console.error('Error retrieving PostgreSQL tables and columns:', err);
        throw err;
    }
}*/

export default async function getAllPostgresTables(connection) {
    try {
      // Fetching all table names, columns, and data types from PostgreSQL information_schema
      const res = await connection.query(`
        SELECT 
          table_name, 
          column_name, 
          data_type, 
          column_default, 
          is_nullable, 
          ordinal_position
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);
  
      // Define type mappings from PostgreSQL to JavaScript types
      const numeric = ['int', 'numeric', 'double precision', 'real'];
      const bool = ['boolean'];
      const date = ['date', 'timestamp', 'timestamp without time zone'];
      const chaine = ['character varying', 'text', 'char'];
  
      // Group the results by table_name and format them according to the required structure
      const tables = res.rows.reduce((acc, row) => {
        let table = acc.find(t => t.name === row.table_name);
        if (!table) {
          table = { name: row.table_name, fields: [] };
          acc.push(table);
        }
  
        // Determine the JavaScript type for each column
        let jsType;
        const sqlType = row.data_type.toLowerCase();
  
        if (numeric.some(type => sqlType.includes(type))) {
          jsType = "number";
        } else if (bool.some(type => sqlType.includes(type))) {
          jsType = "boolean";
        } else if (date.some(type => sqlType.includes(type))) {
          jsType = "Date";
        } else if (chaine.some(type => sqlType.includes(type))) {
          jsType = "string";
        } else {
          jsType = "unknown";
        }
  
        // Check if the column is a primary key or auto-increment
        const isPrimaryKey = row.column_default && row.column_default.startsWith("nextval");
        const isAutoIncrement = row.column_default && row.column_default.startsWith("nextval");
  
        // Add the field with its type and any additional properties (pk, autoIncrement)
        table.fields.push({
          field: row.column_name,
          type: jsType,
          ...(isPrimaryKey && { pk: true }),
          ...(isPrimaryKey && isAutoIncrement && { autoIncrement: true })
        });
  
        return acc;
      }, []);
  
      console.log(tables);
  
      return tables;
    } catch (err) {
      console.error('Error retrieving PostgreSQL tables and columns:', err);
      throw err;
    }
  }
  

