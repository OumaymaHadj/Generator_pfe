import path from "path";
import fs from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

export default async function createCrud(projectKey, projectName, selectedTable, database) {
  
  try {
    const projectDir = path.join(os.homedir(), projectKey, projectName);

    try {
      await fs.access(projectDir); // Check if project directory exists
    } catch (err) {
      console.log({ error: `${projectName} does not exist.` });
      return;
    }

    const controllerName = `${selectedTable.name}Controller`;
    const controllersDir = path.join(projectDir, "controllers");
    const controllerPath = path.join(controllersDir, `${controllerName}.js`);

    const routerName = `${selectedTable.name}Routes`;
    const routersDir = path.join(projectDir, "routes");
    const routePath = path.join(routersDir, `${routerName}.js`);

    const appFile = path.join(projectDir, "app.js");

    let controllerContent;
    if (database === "mongoDB") {
      controllerContent = generateControllerMongo(selectedTable);
      generateMongooseSchema(selectedTable, projectDir);
    } else if (database === "mysql") {
      controllerContent = generateControllerSql(selectedTable);
    } else if (database === "postgres") {
      controllerContent = generateControllerPostgres(selectedTable);
    } else {
      throw new Error("Unsupported database type");
    }

    const routeContent = generateRouter(selectedTable);

    await fs.mkdir(controllersDir, { recursive: true });

    await fs.writeFile(controllerPath, controllerContent, "utf8");
    await fs.writeFile(routePath, routeContent, "utf8");

    await updateAppJs(appFile, selectedTable);

    console.log(`Files ${routerName}.js and ${controllerName}.js have been created successfully!`);
    console.log(`The component has been imported and routing added to ${appFile}!`);
    console.log("CRUD created successfully.");
    process.exit(0);

  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

function generateControllerMongo(selectedTable) {
  const { name, fields } = selectedTable;

  const fieldsWithoutId = fields.filter(field => field.field !== 'id' && field.field !== '_id');

  const fieldNames = fieldsWithoutId.map((f) => f.field).join(", ");
  const validation = fieldsWithoutId
    .map(
      (f) =>
        `if (!${f.field}) return res.status(400).json({ error: "Please enter ${f.field}" });`
    )
    .join("\n    ");

  const content = `
const ${capitalizeFirstLetter(name)} = require('../models/${name}');

// Get all ${name}s
exports.getAll${capitalizeFirstLetter(name)}s = async function (req, res) {
    try {
        console.log('Getting all ${name}s');
        const ${name}s = await ${capitalizeFirstLetter(name)}.find({});
        console.log(${name}s);
        res.json(${name}s);
    } catch (err) {
        res.status(500).send('An error has occurred');
    }
};

// Get a single ${name} by ID
exports.get${capitalizeFirstLetter(name)}ById = async function (req, res) {
    try {
        console.log('Getting one ${name}');
        const ${name} = await ${capitalizeFirstLetter(name)}.findById(req.params.id);
        if (!${name}) {
            return res.status(404).json({ message: '${capitalizeFirstLetter(name)} not found' });
        }
        console.log(${name});
        res.json(${name});
    } catch (err) {
        res.status(500).send('An error has occurred');
    }
};

// Create a new ${name}
exports.create${capitalizeFirstLetter(name)} = async function (req, res) {
    const { ${fieldNames} } = req.body;

    // Basic validation
    ${validation}

    try {
        const new${capitalizeFirstLetter(name)} = new ${capitalizeFirstLetter(name)}({ ${fieldNames} });
        const ${name} = await new${capitalizeFirstLetter(name)}.save();
        console.log(${name});
        res.json(${name});
    } catch (err) {
        res.status(500).send('Error saving ${name}');
    }
};

// Update a ${name} by ID
exports.update${capitalizeFirstLetter(name)} = async function (req, res) {
    try {
        const updated${capitalizeFirstLetter(name)} = await ${capitalizeFirstLetter(name)}.findByIdAndUpdate(
            req.params.id,
            {
                ${fieldNames.split(', ').map(f => `${f}: req.body.${f}`).join(',\n                ')}
            },
            { new: true, upsert: true }
        );
        if (!updated${capitalizeFirstLetter(name)}) {
            return res.status(404).json({ message: '${capitalizeFirstLetter(name)} not found' });
        }
        console.log(updated${capitalizeFirstLetter(name)});
        res.json(updated${capitalizeFirstLetter(name)});
    } catch (err) {
        res.status(500).send('Error updating ${name}');
    }
};

// Delete a ${name} by ID
exports.delete${capitalizeFirstLetter(name)} = async function (req, res) {
    try {
        const deleted${capitalizeFirstLetter(name)} = await ${capitalizeFirstLetter(name)}.findByIdAndRemove(req.params.id);
        if (!deleted${capitalizeFirstLetter(name)}) {
            return res.status(404).json({ message: '${capitalizeFirstLetter(name)} not found' });
        }
        console.log(deleted${capitalizeFirstLetter(name)});
        res.json(deleted${capitalizeFirstLetter(name)});
    } catch (err) {
        res.status(500).send('Error deleting ${name}');
    }
};
`;

  return content;
}

function generateControllerSql(selectedTable) {
  const { name, fields } = selectedTable;

  // Log fields to check the structure
  console.log('Fields:', fields);

  // Identify the primary key (pk) and check if it's auto-incrementing
  const pkField = fields.find((f) => f.pk);

  // Log the identified primary key field
  console.log('Primary Key Field:', pkField);

  if (!pkField) {
    console.error(`No primary key found for table ${name}`);
    return;
  }

  const isAutoIncrement = pkField.autoIncrement || false;

  // Filter out primary key if it's auto-incrementing
  const fieldsWithoutPk = isAutoIncrement
    ? fields.filter((f) => !f.pk)
    : fields;

  const fieldNames = fieldsWithoutPk.map((f) => f.field).join(", ");
  const fieldPlaceholders = fieldsWithoutPk.map((_, index) => `?`).join(", ");
  const updateFields = fieldsWithoutPk
    .map((f) => `${f.field} = ?`)
    .join(", ");
  const validation = fieldsWithoutPk
    .map(
      (f) =>
        `if (!${f.field}) return res.status(400).json({ error: "Please enter ${f.field}" });`
    )
    .join("\n    ");

  const content = `
var dbConn = require('../db/dbConnection');

// Get all records
exports.getAll${capitalizeFirstLetter(name)}s = (req, res) => {
    dbConn.query('SELECT * FROM ${name}', function (err, rows) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch ${name}s." });
        }
        
        // Identify the primary key field
        const pkField = '${pkField.field}';
        const isAutoIncrement = '${isAutoIncrement}';
        
        const response = {
            data: rows,       
            primaryKey: pkField,
            isAutoIncrement: isAutoIncrement  
        };

        return res.status(200).json(response);
    });
};

// Add a new record (exclude auto-increment pk)
exports.create${capitalizeFirstLetter(name)} = (req, res) => {
    let { ${fieldNames} } = req.body;

    ${validation}

    var form_data = { ${fieldNames} };

    dbConn.query('INSERT INTO ${name} (${fieldNames}) VALUES (${fieldPlaceholders})', [${fieldNames}], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to create ${name}." });
        }
        return res.status(201).json({ ${isAutoIncrement ? 'id: result.insertId,' : ''} ...form_data });
    });
};

// Get record by primary key
exports.get${capitalizeFirstLetter(name)}ById = (req, res) => {
    let id = req.params.id;

    dbConn.query('SELECT * FROM ${name} WHERE ${pkField.field} = ?', [id], function (err, rows) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to retrieve ${name}." });
        }

        if (rows.length <= 0) {
            return res.status(404).json({ error: "${capitalizeFirstLetter(name)} not found." });
        }
        return res.status(200).json(rows[0]);
    });
};

// Update record by primary key (exclude auto-increment pk)
exports.update${capitalizeFirstLetter(name)} = (req, res) => {
    let idParams = req.params.id;
    let { ${fieldNames} } = req.body;

    ${validation}

    var form_data = { ${fieldNames} };

    dbConn.query('UPDATE ${name} SET ${updateFields} WHERE ${pkField.field} = ?', [${fieldNames}, idParams], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update ${name}." });
        }
        return res.status(200).json(form_data);
    });
};

// Delete record by primary key
exports.delete${capitalizeFirstLetter(name)} = (req, res) => {
    let id = req.params.id;

    dbConn.query('DELETE FROM ${name} WHERE ${pkField.field} = ?', [id], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to delete ${name}." });
        }
        return res.status(200).json({ message: "${capitalizeFirstLetter(name)} successfully deleted! ID = " + id });
    });
};
`;

  return content;
}

function generateControllerPostgres(selectedTable) {
  const { name, fields } = selectedTable;

  // Log fields to check the structure
  console.log('Fields:', fields);

  // Identify the primary key (pk) and check if it's auto-incrementing
  const pkField = fields.find((f) => f.pk);

  // Log the identified primary key field
  console.log('Primary Key Field:', pkField);

  if (!pkField) {
    console.error(`No primary key found for table ${name}`);
    return;
  }

  const isAutoIncrement = pkField.autoIncrement || false;

  // Filter out primary key if it's auto-incrementing
  const fieldsWithoutPk = isAutoIncrement
    ? fields.filter((f) => !f.pk)
    : fields;

  const fieldNames = fieldsWithoutPk.map((f) => f.field).join(", ");

  const updateFields = fieldsWithoutPk.map((tableName, index) => `${tableName.field} = $${index + 1}`).join(', ')
  console.log(updateFields);
  const validation = fieldsWithoutPk
    .map(
      (f) =>
        `if (!${f.field}) return res.status(400).json({ error: "Please enter ${f.field}" });`
    )
    .join("\n    ");

  const content = `
var dbConn = require('../db/dbConnection');

// Get all records
exports.getAll${capitalizeFirstLetter(name)}s = (req, res) => {
    dbConn.query('SELECT * FROM ${name}', function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch ${name}s." });
        }
        
        // Identify the primary key field
        const pkField = '${pkField.field}';
        const isAutoIncrement = '${isAutoIncrement}';
        
        const response = {
            data: result.rows,       
            primaryKey: pkField,
            isAutoIncrement: isAutoIncrement  
        };

        return res.status(200).json(response);
    });
};

// Add a new record (exclude auto-increment pk)
exports.create${capitalizeFirstLetter(name)} = (req, res) => {
    let { ${fieldNames} } = req.body;

    ${validation}

    const query = 'INSERT INTO ${name} (${fieldNames}) VALUES (${fieldsWithoutPk.map((_, index) => `$${index + 1}`).join(', ')}) RETURNING ${isAutoIncrement ? pkField.field : '*'}';
    
    dbConn.query(query, [${fieldNames}], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to create ${name}.' });
        }
        return res.status(201).json({ ${isAutoIncrement ? `id: result.rows[0].${pkField.field},` : ''} ...req.body });
    });
};

// Get record by primary key
exports.get${capitalizeFirstLetter(name)}ById = (req, res) => {
    const id = req.params.id;

    dbConn.query('SELECT * FROM ${name} WHERE ${pkField.field} = $1', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve ${name}.' });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: '${capitalizeFirstLetter(name)} not found.' });
        }

        return res.status(200).json(result.rows[0]);
    });
};

// Update record by primary key (exclude auto-increment pk)
exports.update${capitalizeFirstLetter(name)} = (req, res) => {
    const idParams = req.params.id;
    let { ${fieldNames} } = req.body;

    ${validation}

    const query = 'UPDATE ${name} SET ${updateFields} WHERE ${pkField.field} = $${fieldsWithoutPk.length + 1}';
    
    dbConn.query(query, [${fieldNames}, idParams], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update ${name}.' });
        }

        return res.status(200).json(req.body);
    });
};

// Delete record by primary key
exports.delete${capitalizeFirstLetter(name)} = (req, res) => {
    const id = req.params.id;

    dbConn.query('DELETE FROM ${name} WHERE ${pkField.field} = $1', [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete ${name}.' });
        }

        return res.status(200).json({ message: "${capitalizeFirstLetter(name)} successfully deleted! ID = " + id });
    });
};


`;

  return content;
}

async function generateMongooseSchema(selectedTable, projectDir) {
  const { name, fields } = selectedTable;

  const projectBackDir = path.resolve(projectDir, "models");
  const schemaPath = path.join(projectBackDir, `${name}.js`);

  await fs.mkdir(projectBackDir, { recursive: true });

  const typeMapping = {
    number: "Number",
    string: "String",
  };

  const fieldsContent = fields
    .map(({ field, type }) => {
      const mongooseType = typeMapping[type] || "String";
      return `  ${field}: { type: ${mongooseType}, required: true },`;
    })
    .join("\n");

  const content = `
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ${name}Schema = new Schema({
${fieldsContent}
}, { timestamps: true });

module.exports = mongoose.model('${capitalizeFirstLetter(name)}', ${name}Schema);
`;
  await fs.writeFile(schemaPath, content, "utf8");
}

function generateRouter(selectedTable) {
  const { name } = selectedTable;

  const content = `
var express = require('express');
var router = express.Router();
var ${name}Controller = require('../controllers/${name}Controller');

// Get all ${name}s
router.get('/', ${name}Controller.getAll${capitalizeFirstLetter(name)}s);

// Get a single ${name} by ID
router.get('/:id', ${name}Controller.get${capitalizeFirstLetter(name)}ById);

// Create a new ${name}
router.post('/', ${name}Controller.create${capitalizeFirstLetter(name)});

// Update a ${name} by ID
router.put('/:id', ${name}Controller.update${capitalizeFirstLetter(name)});

// Delete a ${name} by ID
router.delete('/:id', ${name}Controller.delete${capitalizeFirstLetter(name)});

module.exports = router;
`;

  return content;
}

async function updateAppJs(appFile, selectedTable) {
  const { name } = selectedTable;
  const routeFile = `${name}Routes.js`;
  const routePath = `./routes/${routeFile}`;
  const useStatement = `app.use('/${name}s', ${name}Routes);`;

  let content;
  try {
    content = await fs.readFile(appFile, "utf8");
  } catch (err) {
    console.error(`Failed to read ${appFile}:`, err);
    return;
  }

  if (content.includes(routePath)) {
    console.log(`The route for '${name}' is already added in app.js.`);
    return;
  }

  const requireStatement = `var ${name}Routes = require('${routePath}');\n`;
  const useStatementLocation = content.indexOf("app.use(");

  const updatedContent = [
    content.slice(0, useStatementLocation),
    requireStatement,
    content.slice(useStatementLocation),
    useStatement,
    "\n",
  ].join("");

  try {
    await fs.writeFile(appFile, updatedContent, "utf8");
  } catch (err) {
    console.error(`Failed to update ${appFile}:`, err);
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
