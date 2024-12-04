import path from "path";
import fs from "fs/promises";
import createCrud from "../../back/node/createCrudNode.js";
import CryptoService from "../../services/CryptoService.js";

export default async function createComponentVue(req, res) {


  const { encryptedRequestData } = req.body;

  try {

    const decryptedRequestData = CryptoService.decrypt(encryptedRequestData);

    const { projectName, selectedTables, projectKey, database } = decryptedRequestData;
    const projectNameBack = projectName + "Back";


    if (!projectName) {
      return res.status(400).json({
        error: "You should select a project and connect to it before creating forms.",
      });
    }

    try {
      for (const selectedTable of selectedTables) {
        const componentName = capitalizeFirstLetter(selectedTable.name);
        const projectDir = path.resolve("projects", projectKey, projectName);
        const srcDir = path.join(projectDir, "src");
        const componentsDir = path.join(srcDir, "views/components");
        const tablesDir = path.join(srcDir, "views/Tables.vue");
        const servicesDir = path.join(srcDir, "services");

        await ensureDirectoryExists(projectDir);
        await fs.mkdir(componentsDir, { recursive: true });
        await fs.mkdir(servicesDir, { recursive: true });

        const serviceName = `${capitalizeFirstLetter(selectedTable.name)}Service`;
        const componentPath = path.join(componentsDir, `${componentName}Component.vue`);
        const servicePath = path.join(servicesDir, `${serviceName}.js`);

        if (await fileExists(componentPath)) {
          return res.status(400).json({ error: `Component ${componentName} already exists.` });
        }

        await fs.writeFile(
          componentPath,
          generateComponentContent(componentName, selectedTable.name),
          "utf8"
        );
        await fs.writeFile(
          servicePath,
          generateServiceContent(serviceName, selectedTable.name),
          "utf8"
        );
        await fs.writeFile(
          tablesDir,
          await generateTablesContent(selectedTables),
          "utf8"
        );

        //await updateRouting(projectDir, componentName);
        await createCrud(projectKey, projectNameBack, selectedTable, database);

      }


      return res.json({
        success: true,
        message: "Components created successfully.",
      });
    } catch (error) {
      console.error("An error occurred:", error);
      return res.status(500).json({
        error: "An unexpected error occurred during the component creation process.",
      });
    }

  } catch (error) {
    console.error("Erreur lors du déchiffrement :", error);
    res.status(500).send({ success: false, error: error.message });
  }
}

async function ensureDirectoryExists(directory) {
  try {
    const exists = await fs.stat(directory).then(() => true).catch(() => false);
    if (!exists) throw new Error(`${directory} does not exist.`);
  } catch (error) {
    throw new Error(`Failed to ensure directory exists: ${error.message}`);
  }
}

async function fileExists(filePath) {
  return fs.stat(filePath).then(() => true).catch(() => false);
}

function generateComponentContent(componentName, name) {

  return `
<template>
  <div class="card">
    <div class="card-header pb-0 d-flex justify-content-between align-items-center">
      <h6>${componentName}s table</h6>
      <button @click="showAdd${componentName}Dialog = true" class="btn btn-primary">Add</button>
    </div>
    <div class="card-body px-0 pt-0 pb-2">
      <div class="table-responsive p-0">
        <table class="table align-items-center mb-0">
          <thead>
            <tr>
              <!-- Dynamically generate headers -->
              <th v-for="header in headers" :key="header.key"
                class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 text-center">
                {{ header.label }}
              </th>
              <th class="text-secondary opacity-7 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Dynamically generate table rows -->
            <tr v-for="(${name}, index) in ${name}s" :key="${name}[primaryKey]">
              <td v-for="header in headers" :key="header.key" class="text-center">
                <span v-if="editIndex !== index">{{ ${name}[header.key] }}</span>
                <input v-else v-model="edit${componentName}Data[header.key]" class="form-control"
                  :disabled="header.key === primaryKey && isAutoIncrement" />
              </td>
              <td class="align-middle text-center">
                <a href="javascript:;" class="text-secondary font-weight-bold text-xs"
                  @click="edit${componentName}(index, ${name})">
                  <span v-if="editIndex !== index">Edit</span>
                  <span v-else>Save</span>
                </a>
                |
                <a href="javascript:;" class="text-danger font-weight-bold text-xs"
                  @click="delete${componentName}(${name}[primaryKey])">Delete</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add ${componentName} Dialog -->
    <div v-if="showAdd${componentName}Dialog" class="modal-overlay">
      <div class="modal-content">
        <span class="close" @click="showAdd${componentName}Dialog = false">&times;</span>
        <h6>New ${componentName}</h6>
        <form @submit.prevent="create${componentName}" class="form-group">
          <div v-for="header in headers" :key="header.key" >
            <div v-if="header.key !== primaryKey && isAutoIncrement">
              <label :for="header.key">{{ header.label }}</label>
              <input v-model="new${componentName}Data[header.key]" class="form-control" :placeholder="header.label" />
            </div>
          </div>
          <button type="submit" class="btn btn-success">Add ${componentName}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import ${name}Service from '../../services/${componentName}Service';

export default {
  data() {
    return {
      headers: [], // Dynamic headers for table columns
      ${name}s: [], // List of ${name}s to be populated
      primaryKey: '', // The primary key to be used in rows
      isAutoIncrement: false,
      editIndex: null, // Track the index of the row being edited
      edit${componentName}Data: {}, // Store editable data of the selected ${name}
      showAdd${componentName}Dialog: false, // Control the visibility of the add ${name} dialog
      new${componentName}Data: {} // Store the data for the new ${name}
    };
  },
  async mounted() {
    this.get${componentName}sData()
  },
  methods: {

    async get${componentName}sData() {
      try {
        const response = await ${name}Service.getAll();
        const ${name}sData = response.data.data;
        this.primaryKey = response.data.primaryKey;
        this.isAutoIncrement = response.data.isAutoIncrement;
        this.${name}s = ${name}sData;

        if (Array.isArray(this.${name}s) && this.${name}s.length > 0) {
          this.headers = Object.keys(this.${name}s[0]).map(field => ({
            key: field,
            label: field.charAt(0).toUpperCase() + field.slice(1),
            class: 'text-center'
          }));
        }
      } catch (error) {
        console.error("Error fetching ${name}s:", error);
      }
    },

    edit${componentName}(index, ${name}) {
      if (this.editIndex === index) {
        this.${name}s[index] = { ...this.edit${componentName}Data };
        this.editIndex = null; // Reset the edit mode
        this.save${componentName}(${name});
      } else {
        this.editIndex = index;
        this.edit${componentName}Data = { ...${name} };
      }
    },

    async save${componentName}() {
      try {
        await ${name}Service.update(this.edit${componentName}Data[this.primaryKey], this.edit${componentName}Data);

        /*const index = this.${name}s.findIndex(p => p[this.primaryKey] === ${name}[this.primaryKey]);
        if (index !== -1) {
          this.${name}s.splice(index, 1, { ...this.edit${componentName}Data });
        }*/
        this.get${componentName}sData()

        // Exit edit mode
        this.editIndex = null;
        this.edit${componentName}Data = {};
      } catch (error) {
        console.error("Error updating ${name}:", error);
      }
    },

    async create${componentName}() {
      try {
        console.log(this.new${componentName}Data);
        await ${name}Service.create(this.new${componentName}Data);

        await this.get${componentName}sData();

        this.new${componentName}Data = {};
        this.showAdd${componentName}Dialog = false;
      } catch (error) {
        console.error("Error creating ${name}:", error);
      }
    },

    async delete${componentName}(id) {
      // Show confirmation dialog before deleting
      const isConfirmed = window.confirm("Are you sure you want to delete this ${name}?");
      if (!isConfirmed) {
        // If user cancels, exit the method
        return;
      }

      try {
        await ${name}Service.delete(id);
        await this.get${componentName}sData();
      } catch (error) {
        console.error("Error deleting ${name}:", error);
      }
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 3;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 400px;
  position: relative;
}

.form-group {
  margin-bottom: 15px; /* Adjust spacing between input fields */
}

.btn {
  margin-top: 20px; /* Adjust spacing above the submit button */
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>

  
  `;
}

function generateServiceContent(serviceName, tableName) {
  const lowerCaseName = tableName.toLowerCase();
  const API_URL = `/${lowerCaseName}s`;

  return `
import axios from 'axios';

const http = axios.create({
  baseURL: "http://localhost:3003",
  headers: {
    "Content-type": "application/json"
  }
});

const ${serviceName} = {
  getAll() {
    return http.get("${API_URL}");
  },
  create(data) {
    return http.post("${API_URL}", data);
  },
  update(id, data) {
    return http.put(\`\${"${API_URL}"}/\${id}\`, data);
  },
  delete(id) {
    return http.delete(\`\${"${API_URL}"}/\${id}\`);
  }
};

export default ${serviceName};
`;
}

async function generateTablesContent(selectedTables) {

  const imports = selectedTables
    .map((table) => {
      const tableName = capitalizeFirstLetter(table.name);
      return `import ${tableName}Component from "./components/${tableName}Component.vue";`;
    })
    .join("\n");

  const components = selectedTables
    .map((table) => {
      return `
    
    <div class="row mb-4">
      <div class="col-12">
        <${table.name}-component />
      </div>
    </div>
    `;
    })
    .join("\n\t");

  return `
  
<script setup>
${imports}
</script>
<template>
  <div class="py-4 container-fluid">
    ${components}
  </div>
</template>
  
  `
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}