import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "../common/loader.jsx";
import TablesModal from "./tablesModal";
import Toaster from "../common/toaster";
import ProjectForm from "./projectForm";
import { useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import "../assets/css/App.css";

export default function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [error, setError] = useState("");
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [techFront, setTechFront] = useState("");
  const [projectKey, setProjectKey] = useState("");
  const [database, setDatabase] = useState("");
  const [showLiveDemoButton, setShowLiveDemoButton] = useState(false);
  const navigate = useNavigate();

  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return params.get('source');
  };

  const source = getQueryParams();
  const combinedData = tables.flatMap((table) =>
    table.fields.map((field) => ({
      tableName: table.name,
      field: field.field,
      type: field.type,
      ...(field.pk && { pk: true }),
      ...(field.autoIncrement && { autoIncrement: true }),
      ...(field.fk && { fk: true })
    }))
  );

  const handleSubmit = async (formData) => {
    const {
      projectName,
      techFront,
      techBack,
      database,
      host,
      username,
      password,
      port,
      namedb,
    } = formData;
    setTechFront(techFront);
    const dataConnect = { database, host, port, username, password, namedb };
    const dataGenerate = { projectName, techFront, techBack, database, dataConnect, source };

    setProjectName(projectName);
    setDatabase(database)
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/connect",
        dataConnect
      );

      if (
        response.data.message &&
        response.data.message.includes("Successfully") &&
        response.status === 200
      ) {
        try {
          const response = await axios.post(
            "http://localhost:4000/generateProject",
            dataGenerate
          );

          setProjectKey(response.data.projectKey);
        } catch (error) {
          console.error("Error generating project:", error);
        }

        setTables(response.data.tables);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);

      let errorMessage;
      if (error.response) {
        errorMessage = error.response.data || "An unexpected error occurred.";
      } else {
        errorMessage = error.message || "Network error or server not reachable.";
      }
    
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setShowModal(false);

  const handleErrorClose = () => setShowErrorModal(false);

  const handleSubmitComponent = async (event) => {
    //event.preventDefault();
    const selectedTable = getSelectedTableData();
    if (!selectedTable) {
      console.error("No table selected or table data missing");
      return;
    }

    const requestData = {
      projectName: projectName,
      selectedTables: selectedTable,
      projectKey: projectKey,
      database: database
    };
    setLoading(true);
    let response;
    try {
      setShowSuccessToast(false);
      if (techFront === "Angular") {
        response = await axios.post(
          "http://localhost:4000/componentAngular",
          requestData
        );
      } else if (techFront === "React") {
        response = await axios.post(
          "http://localhost:4000/componentReact",
          requestData
        );
      } else if (techFront === "Vue") {
        response = await axios.post(
          "http://localhost:4000/componentVue",
          requestData
        );
      }


      if (
        response.data.message &&
        response.data.message.includes("successfully") &&
        response.status === 200
      ) {
        console.log("component generated successfully");
        setShowSuccessToast(true);
      } else {
        console.error("Failed to generate component");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      setSelectedTables([]);
      handleClose();

      source === 'init' ? downloadProjects() : navigateToLiveDemo()//setShowLiveDemoButton(true);
    }
  };

  const navigateToLiveDemo = async () => {
    const distinctTables = [...new Set(selectedTables)];

    console.log(distinctTables);
    navigate(`/liveDemo?projectKey=${projectKey}&techFront=${techFront}&projectName=${projectName}&selectedTables=${distinctTables}`);
  }

  const downloadProjects = async () => {
    try {
      const response = await axios.post(
        "http://localhost:4000/download",
        {
          projectName: projectName,
          projectKey: projectKey

        },
        {
          responseType: "blob",
        }
      );

      // Create a URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${projectName}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      /*if (source === "initWithDemo") {
        setShowLiveDemoButton(true);
      }*/

    } catch (err) {
      //setError('Erreur lors du téléchargement du projet.');
      console.error("Erreur lors du téléchargement:", err);
    }
  }

  const getSelectedTableData = () => {
    const distinctTables = [...new Set(selectedTables)];
    return distinctTables.map((tableName) => {
      const tableData = combinedData.filter(
        (data) => data.tableName === tableName
      );
      return {
        name: tableName,
        // fields: tableData.map((data) => ({
        //   field: data.field,
        //   type: data.type,
        // })),
        fields: tableData,
      };
    });
  };

  const areAllTablesSelected = () => {
    return combinedData.every((data) =>
      selectedTables.includes(data.tableName)
    );
  };

  const selectAll = () => {
    if (areAllTablesSelected()) {
      setSelectedTables([]);
    } else {
      const allTableNames = combinedData.map((data) => data.tableName);
      setSelectedTables(allTableNames);
    }
  };

  const isTableSelected = (tableName) => {
    return selectedTables.includes(tableName);
  };

  const onSelectTable = (e, tableName) => {
    if (e.target.checked) {
      setSelectedTables([...selectedTables, tableName]);
    } else {
      setSelectedTables(selectedTables.filter((name) => name !== tableName));
    }
  };

  /*async function openLiveDemo() {

    const response = await axios.post(
      "http://localhost:4000/live-demo",
      { projectKey, projectName, techFront }
    );

    console.log(response);
    let link
    switch (techFront) {
      case 'Angular':
        link = `http://localhost:4200/${projectKey}`
        break;
      case 'React':
        link = `http://localhost:3000/${projectKey}`
        break;
      case 'Vue':
        link = `http://localhost:8080/${projectKey}`
        break;
      default:
        break;
    }
    window.open(link, '_blank');
  }*/

  async function openLiveDemo() {
    // Open a new blank window first


    let link;
    switch (techFront) {
      case 'Angular':
        link = `http://localhost:4200/${projectKey}`;
        break;
      case 'React':
        //link = `http://localhost:3000/${projectKey}`;
        link = 'http://localhost:3000/#/admin/dashboard'
        break;
      case 'Vue':
        link = `http://localhost:8080/${projectKey}`;
        break;
      default:
        break;
    }

    const newWindow = window.open('', link);

    // Show a loader in the new window

    newWindow.document.write('<html><head><title>Loading...</title></head><body>');

    newWindow.document.write('<Loader loading={loading} />');
    //newWindow.document.write('<div id="loader">Loading...</div>');
    //newWindow.document.write('<style>#loader { font-size: 24px; text-align: center; margin-top: 50px; }</style>');
    //newWindow.document.write('</body></html>');

    try {
      // Make the request to start the projects
      const response = await axios.post(
        "http://localhost:4000/live-demo",
        { projectKey, projectName, techFront }
      );
      console.log(response);

      // Depending on the tech front, prepare the URL link


      // Replace the loader with a redirect or new content
      newWindow.location.href = link; // Redirect to the live demo URL

    } catch (error) {
      console.error("Error starting live demo:", error);
      newWindow.document.write('<p>Error loading the live demo.</p>');
    }
  }

  return (
    <div className="wizard -lg">
      {showLiveDemoButton ? (

        <div className="form-initDemo">
          <button className="btn btn_cta -ssm" type="submit" onClick={openLiveDemo}>
            <span className="btn_cta-border"></span>
            <span className="btn_cta-ripple">
              <span></span>
            </span>
            <span className="btn_cta-title">
              <span data-text="Live Demo"> Live Demo</span>
            </span>
          </button>

          <button className="btn btn_cta -ssm" type="submit" onClick={downloadProjects}>
            <span className="btn_cta-border"></span>
            <span className="btn_cta-ripple">
              <span></span>
            </span>
            <span className="btn_cta-title">
              <span data-text="Download Zip"> Download Zip</span>
            </span>
          </button>
        </div>

      ) : (
        <>
          <Loader loading={loading} />
          <ProjectForm handleSubmit={handleSubmit} loading={loading} />
          <TablesModal
            showModal={showModal}
            handleClose={handleClose}
            combinedData={combinedData}
            areAllTablesSelected={areAllTablesSelected}
            selectAll={selectAll}
            isTableSelected={isTableSelected}
            onSelectTable={onSelectTable}
            handleSubmitComponent={handleSubmitComponent}
            database={database}
          />
          <Toaster showSuccessToast={showSuccessToast} />

          <Modal
            show={showErrorModal}
            onHide={handleErrorClose}
            centered
            size='lg'
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ fontSize: '30px' }}>
                Error
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <h3>{error}.</h3>
            </Modal.Body>
            <Modal.Footer>
              <div className="btn-recommondation">
                <button className="btn btn_cta -sm btn-save" onClick={handleErrorClose}>
                  <span className="btn_cta-border"></span>
                  <span className="btn_cta-ripple">
                    <span></span>
                  </span>
                  <span className="btn_cta-title">
                    <span data-text="Okay">Okay</span>
                  </span>
                </button>
              </div>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}