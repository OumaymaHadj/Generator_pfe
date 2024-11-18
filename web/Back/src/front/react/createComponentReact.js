import path from "path";
import fs from "fs/promises";
import createCrud from "../../back/node/createCrudNode.js";


export default async function createCrudComponent(res, req) {
  const { projectName, selectedTables, projectKey, database } = req.body;
  const projectNameBack = projectName + "Back";

  try {
    const projectDir = path.resolve("projects", projectKey, projectName);
    const srcDir = path.join(projectDir, "src");
    const projectDirBack = path.resolve("projects", projectKey, projectNameBack);
    const indexTablesDir = path.join(srcDir, "views/Dashboard/Tables");
    const indexTablesPath = path.join(indexTablesDir, `index.js`);

    try {
      await fs.access(projectDir);
    } catch (err) {
      return { error: `${projectName} does not exist.` };
    }
    for (const selectedTable of selectedTables) {
      const componentName = selectedTable.name.charAt(0).toUpperCase() + selectedTable.name.slice(1) + 's';
      const serviceName = selectedTable.name + "Service";
      const componentDir = path.join(srcDir, "views/Dashboard/Tables/components");
      //const indexTablesDir = path.join(srcDir, "views/Dashboard/Tables");
      const serviceDir = path.join(srcDir, "services");
      const componentPath = path.join(componentDir, `${componentName}.js`);
      const servicePath = path.join(serviceDir, `${serviceName}.js`);
      //const indexTablesPath = path.join(indexTablesDir, `index.js`);
      //const appFile = path.join(srcDir, "App.js");

      await fs.mkdir(componentDir, { recursive: true });
      await fs.mkdir(serviceDir, { recursive: true });
      //await fs.mkdir(indexTablesPath, { recursive: true });

      const componentContent = generateComponentContent(selectedTable, serviceName, database);

      const serviceContent = generateServiceContent(serviceName, selectedTable);

      //const indexTablesContent = generateIndexTablesContent(selectedTable)

      await fs.writeFile(componentPath, componentContent.trim(), "utf8");
      await fs.writeFile(servicePath, serviceContent, "utf8");

      //await modifyAppJs(appFile, componentName, selectedTable);
      // await generateNestResource(selectedTable.name,projectKey,projectNameBack);
      createCrud(projectKey, projectNameBack, selectedTable, database);

     // console.log(`Files ${componentName}.jsx and ${serviceName}.js have been created successfully in ${srcDir}!`);
     // console.log(`The component has been imported and routing added to ${appFile}!`);
    }

    const indexTablesContent = generateIndexTablesContent(selectedTables)
    await fs.writeFile(indexTablesPath, indexTablesContent, "utf8");



    return res.json({
      success: true,
      message: "Components created successfully.",
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return { error: "An error occurred while creating the CRUD component." };
  }
}

function generateComponentContent(selectedTable, serviceName) {

  const selectedTableName = capitalizeFirstLetter(selectedTable.name);
  const lowerTableName = selectedTableName.charAt(0).toLowerCase() + selectedTableName.slice(1);

  return `import { Table, Tbody, Text, Th, Thead, Tr, Button, Stack, IconButton, Flex, useColorModeValue} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import ${serviceName} from '../../../../services/${serviceName}';
import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import React from "react";
import EditDialog from "components/Tables/EditDialog"

const ${selectedTableName}s = ({ title }) => {

  const textColor = useColorModeValue("gray.700", "white");

  const [${lowerTableName}s, set${selectedTableName}s] = useState([]);
  const [fileds, setFileds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 
  const [primaryKey, setPrimaryKey] = useState([]);  
  const [isAutoIncrement, setIsAutoIncrement] = useState([]);   
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const current${selectedTableName}s = ${lowerTableName}s.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(${lowerTableName}s.length / itemsPerPage);

  // Function to handle Add button click
  const openAddDialog = () => setIsAddDialogOpen(true);
  const closeAddDialog = () => setIsAddDialogOpen(false);

  useEffect(() => {
    load${selectedTableName}s();
  }, []);


  const load${selectedTableName}s = async () => {
    try {
      
      const response = await ${serviceName}.getAll();

      const ${lowerTableName}Data = response.data.data;            
      const primaryKey = response.data.primaryKey; 
      const isAutoIncrement = response.data.isAutoIncrement; 
      
      set${selectedTableName}s(${lowerTableName}Data);
      setPrimaryKey(primaryKey)
      setIsAutoIncrement(isAutoIncrement)

      if (${lowerTableName}Data.length > 0) {
        let f = Object.keys(${lowerTableName}Data[0]); 
        f.push(""); 
        f.push("");
        setFileds(f);
      }
    } catch (error) {
      handleError('loading ${lowerTableName}s', error);
    }
  
  };

  const add${selectedTableName} = async (${lowerTableName}) => {
    try {
      await ${lowerTableName}Service.create(${lowerTableName});
    } catch (error) {
      handleError('adding ${lowerTableName}', error);
    }
    load${selectedTableName}s()
  };

  const update${selectedTableName} = async (updatedData) => {
    try {
      await ${serviceName}.update(updatedData[primaryKey], updatedData);
    } catch (error) {
      handleError('updating ${lowerTableName}s', error);
    }
    load${selectedTableName}s()
  };

  const delete${selectedTableName} = async (data) => {
    try {
      await ${serviceName}.delete(data[primaryKey]);
    } catch (error) {
      handleError('deleting ${lowerTableName}', error);
    }
    load${selectedTableName}s()
  };

  const handleError = (action, error) => {
    alert(\`An error occurred while \${action}. Please try again.\`, error);
  };

  const goToNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <Card overflowX={{ sm: "scroll", xl: "hidden" }}>
      <CardHeader
        p="6px 0px 22px 0px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize='xl' color={textColor} fontWeight='bold'>
          {title}
        </Text>

        <Button
          colorScheme="blue"
          onClick={openAddDialog}
          w="100px"
          backgroundColor="rgb(61, 185, 178)"
          color="white"
        >
          Add
        </Button>
      </CardHeader>
      <CardBody>
        <Table variant='simple' color={textColor}>
          <Thead>
            <Tr my='.8rem' pl='0px' color='gray.400'>
              {fileds.map((filed, idx) => (
                <Th color='gray.400' key={idx} ps={idx === 0 ? "0px" : null}>
                  {filed}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {current${selectedTableName}s.map((row) => (
              <TablesTableRow
                primaryKey={primaryKey}
                isAutoIncrement={isAutoIncrement}
                row={row}
                update={update${selectedTableName}}
                onDelete={delete${selectedTableName}}
              />
            ))}
          </Tbody>
        </Table>
      </CardBody>

      {/* Pagination Controls */}
      <Flex justify="center" mt={4}>
        <Stack direction="row" spacing={2}>
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={goToPreviousPage}
            isDisabled={currentPage === 1}
            aria-label="Previous page"
          />
          <Flex justify="center">
            <Text marginTop="5px" textAlign="center">
              Page {currentPage} of {totalPages}
            </Text>
          </Flex>
          <IconButton
            icon={<ChevronRightIcon />}
            onClick={goToNextPage}
            isDisabled={currentPage === totalPages}
            aria-label="Next page"
          />
        </Stack>
      </Flex>

      {isAddDialogOpen && (
        <EditDialog
          title={'Add'}
          fileds={fileds}
          primaryKey={primaryKey}
          isAutoIncrement={isAutoIncrement}
          isOpen={isAddDialogOpen}
          onClose={closeAddDialog}
          onSave={add${selectedTableName}}
        />
      )}

    </Card>
  );


};

export default ${selectedTableName}s;


  `
}

function generateIndexTablesContent(selectedTables) {
  const imports = selectedTables
    .map((table) => {
      const tableName = capitalizeFirstLetter(table.name);
      return `import ${tableName}s from "./components/${tableName}s";`;
    })
    .join("\n");

  const components = selectedTables
    .map((table) => {
      const tableName = capitalizeFirstLetter(table.name);
      return `<${tableName}s title={"${tableName}s Table"} />\n\t\t\t<Box h="20px" />`;
    })
    .join("\n\t\t\t");

  return `
import { Flex, Box } from "@chakra-ui/react";
import React from "react";
${imports}

function Tables() {

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      ${components}
    </Flex>
  );
}

export default Tables;
`;
}
/*function generateComponentContent(selectedTable) {
  const selectedTableName = capitalizeFirstLetter(selectedTable.name);
  const lowerTableName = selectedTableName.charAt(0).toLowerCase() + selectedTableName.slice(1);

  const fieldsWithoutId = selectedTable.fields.filter(f => f.field !== 'id' && f.field !== '_id');
  const idField = selectedTable.fields.find(f => f.field === 'id' || f.field === '_id');

  const renderStateDeclaration = (f) => `const [${f.field}, set${capitalizeFirstLetter(f.field)}] = useState(${getDefaultValue(f.type)});`;

  const renderFieldInput = (f) => `
    <div>
      <label htmlFor="${f.field}">${capitalizeFirstLetter(f.field)}</label>
      <input
        type="${f.type === 'number' ? 'number' : 'text'}"
        id="${f.field}"
        value={${f.field}}
        onChange={e => set${capitalizeFirstLetter(f.field)}(e.target.value)}
      />
    </div>
  `;

  const collectFieldData = [...fieldsWithoutId.map(f => `${f.field}: ${f.field}`), idField ? `${idField.field}: ${idField.field}` : ''].filter(Boolean).join(', ');

  return `
  import React, { useState, useEffect } from 'react';
  import  ${lowerTableName}Service  from '../services/${lowerTableName}Service';

  const ${selectedTableName}Component = () => {
    const [${lowerTableName}s, set${selectedTableName}s] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Field states
    ${fieldsWithoutId.map(renderStateDeclaration).join('\n    ')}
    ${idField ? `const [${idField.field}, set${capitalizeFirstLetter(idField.field)}] = useState(${getDefaultValue(idField.type)});` : ''}

    useEffect(() => {
      load${selectedTableName}s();
    }, []);

    const load${selectedTableName}s = async () => {
      setLoading(true);
      try {
        const response = await ${lowerTableName}Service.getAll();
        set${selectedTableName}s(response.data);
      } catch (error) {
        handleError('loading ${lowerTableName}s', error);
      } finally {
        setLoading(false);
      }
    };

    const save${selectedTableName} = async () => {
      const current${selectedTableName} = { ${collectFieldData} };
      
      try {
        setLoading(true);
        if (isEditMode) {
          await update${selectedTableName}(current${selectedTableName});
        } else {
          await create${selectedTableName}(current${selectedTableName});
        }
        resetForm();
      } catch (error) {
        handleError(isEditMode ? 'updating' : 'creating', error);
      } finally {
        setLoading(false);
      }
    };

    const create${selectedTableName} = async (current${selectedTableName}) => {
      const createdItem = await ${lowerTableName}Service.create(current${selectedTableName});
      set${selectedTableName}s([...${lowerTableName}s, createdItem.data]);
    };

    const update${selectedTableName} = async (current${selectedTableName}) => {
      const updatedItem = await ${lowerTableName}Service.update(current${selectedTableName}.${idField ? idField.field : 'id'}, current${selectedTableName});
      load${selectedTableName}s();
      setIsEditMode(false);
    };

    const delete${selectedTableName} = async (id) => {
      try {
        setLoading(true);
        await ${lowerTableName}Service.delete(id);
        load${selectedTableName}s();
      } catch (error) {
        handleError('deleting ${lowerTableName}', error);
      } finally {
        setLoading(false);
      }
    };

    const edit${selectedTableName} = (item) => {
      setIsEditMode(true);
      ${fieldsWithoutId.map(f => `set${capitalizeFirstLetter(f.field)}(item.${f.field});`).join('\n    ')}
      ${idField ? `set${capitalizeFirstLetter(idField.field)}(item.${idField.field});` : ''}
    };

    const cancelEdit = () => {
      resetForm();
      setIsEditMode(false);
    };

    const resetForm = () => {
      ${fieldsWithoutId.map(f => `set${capitalizeFirstLetter(f.field)}(${getDefaultValue(f.type)});`).join('\n    ')}
      ${idField ? `set${capitalizeFirstLetter(idField.field)}(${getDefaultValue(idField.type)});` : ''}
    };

    const handleError = (action, error) => {
    alert(`An error occurred while ${action}. Please try again.`, error);

    };

    return (
      <div>
        <h1>${selectedTableName} Management</h1>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={(e) => { e.preventDefault(); save${selectedTableName}(); }}>
          ${fieldsWithoutId.map(renderFieldInput).join('\n          ')}
          <div>
            <button type="submit">{isEditMode ? 'Update' : 'Create'}</button>
            {isEditMode && <button type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>

        <ul>
          {${lowerTableName}s.map(item => (
            <li key={item.${idField ? idField.field : 'id'}}>
              ${fieldsWithoutId.map(f => `<div><strong>${capitalizeFirstLetter(f.field)}:</strong> {item.${f.field}}</div>`).join('')}
              ${idField ? `<div><strong>${capitalizeFirstLetter(idField.field)}:</strong> {item.${idField.field}}</div>` : ''}
              <button onClick={() => edit${selectedTableName}(item)}>Edit</button>
              <button onClick={() => delete${selectedTableName}(item.${idField ? idField.field : 'id'})}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  export default ${selectedTableName}Component;
  `;
} */


function generateComponentContent2(componentName, serviceName, selectedTable) {
  const { name, fields } = selectedTable;
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const lowerCaseName = name.toLowerCase();

  const formFields = fields
    .map(
      (field) => `
        <div>
          <label>${field.field.charAt(0).toUpperCase() + field.field.slice(1)}:</label>
          <input
            type="${field.type === "string" ? "text" : "number"}"
            name="${field.field}"
            value={currentObject.${field.field} || ''}
            onChange={handleInputChange}
          />
        </div>`
    )
    .join("");

  const listFields = fields
    .map((field) => `<span>{item.${field.field}} </span>`)
    .join("");

  return `
import React, { useState, useEffect } from 'react';
import ${serviceName} from '../services/${serviceName}';

const ${componentName} = () => {
  const [data, setData] = useState([]);
  const [currentObject, setCurrentObject] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    ${serviceName}.getAll()
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };

  const handleCreate = () => {
    ${serviceName}.create(currentObject)
      .then((response) => {
        setData([...data, response.data]);
        setCurrentObject({});
        setIsCreating(false);
      })
      .catch((error) => {
        console.error('Error creating data:', error);
      });
  };

  const handleUpdate = (id) => {
    ${serviceName}.update(id, currentObject)
      .then((response) => {
        const updatedData = data.map((item) =>
          item.id === id ? response.data : item
        );
        setData(updatedData);
        setCurrentObject({});
        setIsEditing(false);
      })
      .catch((error) => {
        console.error('Error updating data:', error);
      });
  };

  const handleDelete = (id) => {
    ${serviceName}.delete(id)
      .then(() => {
        setData(data.filter((item) => item.id !== id));
      })
      .catch((error) => {
        console.error('Error deleting data:', error);
      });
  };

  const handleEdit = (object) => {
    setCurrentObject(object);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentObject({ ...currentObject, [name]: value });
  };

  return (
    <div>
      <h2>${capitalizedName} Management</h2>

      {(isCreating || isEditing) && (
        <div>
          ${formFields}
          <button onClick={isEditing ? () => handleUpdate(currentObject.id) : handleCreate}>
            {isEditing ? 'Update' : 'Create'}
          </button>
          <button onClick={() => { setIsEditing(false); setIsCreating(false); setCurrentObject({}); }}>
            Cancel
          </button>
        </div>
      )}

      <div>
        <button onClick={() => { setIsCreating(true); setIsEditing(false); setCurrentObject({}); }}>
          Add New ${capitalizedName}
        </button>
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              ${listFields}
              <button onClick={() => handleEdit(item)}>Edit</button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

function generateServiceContent(serviceName, selectedTable) {
  const lowerCaseName = selectedTable.name.toLowerCase();
  return `
import axios from 'axios';

const API_URL = 'http://localhost:3003/${lowerCaseName}s';



const ${serviceName} = {
  getAll: () => axios.get(API_URL),
  create: (data) => axios.post(API_URL, data),
  update: (id, data) => axios.put(\`\${API_URL}/\${id}\`, data),
  delete: (id) => axios.delete(\`\${API_URL}/\${id}\`)
};

export default ${serviceName};
`;
}

async function modifyAppJs(appFile, componentName, selectedTable) {
  try {
    let appFileContent = await fs.readFile(appFile, "utf8");

    const importStatement = `import ${componentName} from './components/${componentName}';`;
    const reactRouterImport = `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';`;

    if (!appFileContent.includes(importStatement)) {
      appFileContent = `${importStatement}\n${appFileContent}`;
    }

    if (!appFileContent.includes(reactRouterImport)) {
      appFileContent = `${reactRouterImport}\n${appFileContent}`;
    }

    const routePath = `/${selectedTable.name.toLowerCase()}`;
    const routeStatement = `<Route path="${routePath}" element={<${componentName}/>} />`;

    if (
      appFileContent.includes("<Router>") &&
      appFileContent.includes("<Routes>")
    ) {
      appFileContent = appFileContent.replace(
        /<Routes>([\s\S]*?)<\/Routes>/,
        (match, p1) => {
          if (p1.includes(routeStatement)) {
            return match;
          }
          return `<Routes>${p1}\n  ${routeStatement}\n</Routes>`;
        }
      );
    } else {
      appFileContent = appFileContent.replace(
        /(<div className="App">[\s\S]*?<\/div>)/,
        (match) => `
<Router>
  <Routes>
    ${routeStatement}
  </Routes>
</Router>`
      );
    }

    await fs.writeFile(appFile, appFileContent, "utf8");
  } catch (error) {
    throw new Error("Failed to modify App.js: " + error.message);
  }
}

function getDefaultValue(type) {
  switch (type) {
    case 'string': return "''";
    case 'number': return '0';
    case 'boolean': return 'false';
    default: return 'null';
  }
}


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
