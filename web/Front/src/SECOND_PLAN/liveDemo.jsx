import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom';
import axios from "axios";
import Loader from "../common/loader";
import { Modal } from 'react-bootstrap';
import "../assets/css/App.css";


export default function LiveDemo() {

    const [loading, setLoading] = useState(false);
    const [videoSrc, setVideoSrc] = useState("");
    const [showModal, setShowModal] = useState(false);

    const getQueryParams = () => {
        const params = new URLSearchParams(window.location.search);
        const projectName = params.get('projectName');
        const techFront = params.get('techFront');
        const projectKey = params.get('projectKey');
        const selectedTables = params.get('selectedTables');
        return { projectName, techFront, projectKey, selectedTables };
    };

    const queryParams = getQueryParams();
    const projectKey = queryParams.projectKey
    const projectName = queryParams.projectName
    const techFront = queryParams.techFront
    const selectedTables = queryParams.selectedTables

    async function srcVideoDemo() {
        let srcDemo;
        switch (techFront) {
            case 'Angular':
                srcDemo = "./media/demo_angular.mp4";
                break;
            case 'React':
                srcDemo = "/media/demo_react.mp4";
                break;
            case 'Vue':
                srcDemo = "/media/demo_vue.mp4";
                break;
            default:
                srcDemo = null;
                break;
        }

        return srcDemo
    }

    const openLiveDemo = async () => {

        const demoWindow = window.open('', '_blank');

        // Create a simple loader element in the new window
        /*demoWindow.document.write(`
          <html>
          <head><title>Loading Live Demo</title></head>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            <div id="loader"></div>
          </body>
          </html>
        `);*/


        demoWindow.document.write(`
        <html>
        <head>
            <title>Loading Live Demo</title>
            <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                #loader { width: 100%; height: 100%; }
            </style>
        </head>
        <body>
            <div id="loader"></div>
        </body>
        </html>
        `);

        // Show the loader in the new window
        //const loaderDiv = demoWindow.document.getElementById('loader');
        //loaderDiv.innerHTML = '<div>Loading...</div>';

        demoWindow.onload = () => {
            // Delay to ensure everything is initialized in demoWindow
            setTimeout(() => {
                const loaderDiv = demoWindow.document.getElementById('loader');
                if (loaderDiv) {
                    // Render Loader component into the new window's div
                    ReactDOM.createRoot(loaderDiv).render(<Loader loading={true} />);
                }
            }, 100); // Adjust delay as necessary
        };

        try {
            setLoading(true);
            // Call the API
            const response = await axios.post('http://localhost:4000/live-demo', {
                projectKey,
                projectName,
                techFront,
            });

            if (response.status === 200) {
                let link;
                switch (techFront) {
                    case 'Angular':
                        console.log(queryParams.selectedTables[0]);
                        link = selectedTables.length === 1 ? `http://localhost:4200/${projectKey}/${queryParams.selectedTables}` : `http://localhost:4200/${projectKey}/${queryParams.selectedTables.split(',')[0]}`;
                        console.log(link);
                        break;
                    case 'React':
                        //link = `http://localhost:3000/${projectKey}`;
                        link = 'http://localhost:3000/#/admin/dashboard'
                        break;
                    case 'Vue':
                        link = `http://localhost:8080/`;
                        break;
                    default:
                        break;
                }
                // Replace the loader with the running project by redirecting the window
                //demoWindow.location.href = link;


                // Refresh the page after 10 seconds (5000 milliseconds)
                /*setTimeout(() => {
                    demoWindow.location.reload();
                }, 10000);*/

                // Polling to check if the project is ready
                const intervalId = setInterval(async () => {
                    try {
                        const res = await axios.get(link); // Check if the project is up
                        if (res.status === 200) {
                            demoWindow.location.href = link; // Navigate to the project
                            clearInterval(intervalId); // Stop polling
                        }
                    } catch (error) {
                        // Continue polling until the project is ready
                        console.log('Project not ready yet, continuing to check...');
                    }
                }, 2000); // Check every 2 seconds
            }
        } catch (error) {
            console.error('Error starting live demo:', error);
            // Show an error message in the new window
            loaderDiv.innerHTML = `<div>Error starting live demo</div>`;
        } finally {
            setLoading(false);
        }
    };

    const openPopUp = async () =>{
        setShowModal(true)
    }

    const handleClose = () => setShowModal(false);

    const downloadProjects = async () => {
        setShowModal(false)
        setLoading(true)
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
            setLoading(false)
            /*if (source === "initWithDemo") {
              setShowLiveDemoButton(true);
            }*/

        } catch (err) {
            //setError('Erreur lors du téléchargement du projet.');
            console.error("Erreur lors du téléchargement:", err);
        }
    }

    useEffect(() => {
        const fetchVideoSrc = async () => {
            const src = await srcVideoDemo();
            setVideoSrc(src);
        };
        fetchVideoSrc();
    }, [techFront]);

    if (!videoSrc) {
        return <div>Loading video...</div>; // Show a fallback while loading
    }

    return (
        <>
            <Loader loading={loading} />
            <div className="wizard -lg">

                <div className="video-container">
                    <video autoPlay loop muted className="background-video">
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>

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

                    <button className="btn btn_cta -ssm" type="submit" onClick={openPopUp}>
                        <span className="btn_cta-border"></span>
                        <span className="btn_cta-ripple">
                            <span></span>
                        </span>
                        <span className="btn_cta-title">
                            <span data-text="Download Zip"> Download Zip</span>
                        </span>
                    </button>
                </div>
            </div>

            <Modal
                show={showModal}
                onHide={handleClose}
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '30px' }}>
                        To run projects
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h3>You need to install Node version <code>20.15.1</code> . Then, navigate into each project folder ({projectName} and {projectName}Back), run <code>npm install</code>, and start the project.</h3>
                </Modal.Body>
                <Modal.Footer>
                    <div className="btn-recommondation">
                        <button className="btn btn_cta -sm btn-save" onClick={downloadProjects}>
                            <span className="btn_cta-border"></span>
                            <span className="btn_cta-ripple">
                                <span></span>
                            </span>
                            <span className="btn_cta-title">
                                <span data-text="Got it">Got it</span>
                            </span>
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    )
}