import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Loader from "../common/loader.jsx";
import { Modal } from 'react-bootstrap';
import "../assets/css/App.css";

export default function Recommandation() {

    const [profile, setProfile] = useState("");
    const [sector, setSector] = useState("");
    const [projectSize, setProjectSize] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [dataNature, setDataNature] = useState("");
    const [scalability, setScalability] = useState("");
    const [recommendation, setRecommendation] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const getQueryParams = () => {
        const params = new URLSearchParams(location.search);
        return params.get('source'); 
    };

    const source = getQueryParams(); 

    const profiles = [
        "Étudiant",
        "Employé",
        "Freelance",
        "Entreprise",
        "Agence de développement"
    ];

    const sectors = [
        "Éducation",
        "Technologie",
        "Finance",
        "Santé",
        "Réseaux sociaux"
    ];

    const projectSizes = [
        "Petit",
        "Moyen",
        "Grand"
    ];

    const dataNatures = [
        "Structured",
        "Semi-structured",
        "Unstructured"
    ]

    const difficulties = [
        "1°-30° (Simple)",
        "30°-60° (Intermédiaire)",
        "60° + (Complexe)"
    ]

    const scalabilities = [
        "Faible",
        "Moyenne",
        "Élevée"
    ]

    const generateRecommendation = () => {
        let recommendation = {
            frontend: "",
            backend: "",
            database: "",
            message: ""
        };

        if (profile === "Étudiant" && sector === "Éducation" && projectSize === "Petit") {
            recommendation = {
                frontend: { name: "Vue.js", logo: "/images/vue.png" },
                backend: { name: "Express.js", logo: "/images/Expressjs.png" },
                database: { name: "MySQL", logo: "/images/mySql.png" },
                message: "Vue.js and Express.js are lightweight and easy to learn"
            };
        } else if (profile === "Agence de développement" && sector === "Technologie" && projectSize === "Moyen") {
            recommendation = {
                frontend: { name: "React Native", logo: "/images/react.png" },
                backend: { name: "Node.js", logo: "/images/Expressjs.png" },
                database: { name: "MongoDB", logo: "/images/mongoDB.png" },
                message: "React Native permet une expérience mobile, Node.js offre une grande scalabilité, et MongoDB est parfait pour des données non structurées."
            };
        } else if (profile === "Entreprise" && sector === "Finance" && projectSize === "Grand") {
            recommendation = {
                frontend: { name: "Angular", logo: "/images/angular.png" },
                backend: { name: "Spring Boot", logo: "/images/Spring_Boot.png" },
                database: { name: "PostgreSQL", logo: "/images/Postgresql.png" },
                message: "Angular offre une structure robuste, Spring Boot permet une intégration rapide, et PostgreSQL est adapté pour gérer des données complexes et bien structurées."
            };
        } else if (profile === "Freelance" && sector === "Technologie" && projectSize === "Moyen") {
            recommendation = {
                frontend: { name: "React", logo: "/images/react.png" },
                backend: { name: "Node.js", logo: "/images/nodejs.png" },
                database: { name: "PostgreSQL", logo: "/images/Postgresql.png" },
                message: "Pour un freelance dans le secteur de la technologie avec un projet de taille moyenne, React offre une flexibilité front-end, Node.js est léger et puissant, et PostgreSQL assure une gestion fiable des données."
            };
        }

        if (scalability === "Élevée") {
            recommendation.backend = { name: "Express.js", logo: "/images/Expressjs.png" };
            if (dataNature === "Non structurées") {
                recommendation.database = { name: "MongoDB", logo: "/images/mongoDB.png" };
                recommendation.message += ". Due to the high scalability requirements and the unstructured nature of the data, Express.js and MongoDB were chosen to provide flexibility and scalability.";
            } else {
                recommendation.database = { name: "PostgreSQL", logo: "/images/Postgresql.png" };
                recommendation.message += "Avec une forte scalabilité et des données structurées, Node.js et PostgreSQL sont des choix optimaux pour maintenir la performance et la gestion de grandes quantités de données.";
            }
        } else if (scalability === "Faible" || projectSize === "Petit") {
            if (dataNature === "Non structurées") {
                recommendation.database = { name: "MongoDB", logo: "/images/mongoDB.png" };
                recommendation.message += "En raison des exigences élevées en scalabilité et de la nature non structurée des données, Node.js et MongoDB ont été sélectionnés pour offrir flexibilité et évolutivité.";
            } else {
                recommendation.backend = { name: "Express.js", logo: "/images/Express.js.png" };
                recommendation.database = { name: "MySQL", logo: "/images/mySql.png" };
                recommendation.message += " Pour des projets de petite taille ou avec des besoins de scalabilité faibles, Express.js et MySQL sont des choix économiques et performants."
            }

        }

        /*if (difficulty === '1°-30° (Simple)') {
            recommendation.frontend = { name: "Vue.js", logo: "/images/vue.png" };
            recommendation.message += " Étant donné la simplicité du projet, Vue.js est recommandé pour sa facilité d'utilisation.";
        } else if (difficulty === '30°-60° (Intermédiaire)') {
            recommendation.frontend = { name: "React", logo: "/images/react.png" };
            recommendation.message += " Pour un projet d'une difficulté intermédiaire, React est recommandé pour sa flexibilité et son écosystème riche.";
        } else {
            recommendation.frontend = { name: "Angular", logo: "/images/angular.png" };
            recommendation.message += " Pour un projet complexe, Angular est recommandé pour sa capacité à gérer des architectures robustes et complexes.";
        }*/

        if (recommendation.frontend.name && recommendation.backend.name && recommendation.database.name) {
            setRecommendation(recommendation);
        } else {
            setRecommendation({
                frontend: "",
                backend: "",
                database: "",
                message: "Vous n'avez pas sélectionné tous les critères nécessaires pour une recommandation."
            });
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setShowModal(true);
        }, 2000);
    };



    const handleClose = () => setShowModal(false);

    const goToCreateProject = () => {
        navigate(`/create?source=${source}`);
    }

    return (
        <div className="wizard -lg">
            <h2 style={{ marginTop: "30px", fontSize: "30px" }}>This wizard will help you choose a combination of technologies based on your needs.</h2>

            <div className="form-group -it">
                <div className="form-label">Votre profil ...</div>

                <div className="form-radio">
                    {profiles.map((profile, index) => (
                        <div className="form-radio-col" key={index}>
                            <label className="form-checkbox form-checkbox_cta">
                                <input
                                    type="radio"
                                    id={`profile-${index}`}
                                    name="profile"
                                    value={profile}
                                    onChange={(e) => setProfile(e.target.value)}
                                />
                                <span className="form-checkbox_cta-box">
                                    <span className="form-checkbox_cta-border"></span>
                                    <span className="form-checkbox_cta-ripple">
                                        <span></span>
                                    </span>
                                    <span className="form-checkbox_cta-title">
                                        <span data-text={profile}>{profile}</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group -it">
                <div className="form-label">Secteur du projet ...</div>

                <div className="form-radio">
                    {sectors.map((sector, index) => (
                        <div className="form-radio-col" key={index}>
                            <label className="form-checkbox form-checkbox_cta">
                                <input
                                    type="radio"
                                    id={`sector-${index}`}
                                    name="sector"
                                    value={sector}
                                    onChange={(e) => setSector(e.target.value)}
                                />
                                <span className="form-checkbox_cta-box">
                                    <span className="form-checkbox_cta-border"></span>
                                    <span className="form-checkbox_cta-ripple">
                                        <span></span>
                                    </span>
                                    <span className="form-checkbox_cta-title">
                                        <span data-text={sector}>{sector}</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group -it">
                <div className="form-label">Taille du projet ...</div>

                <div className="form-radio">
                    {projectSizes.map((projectSize, index) => (
                        <div className="form-radio-col" key={index}>
                            <label className="form-checkbox form-checkbox_cta">
                                <input
                                    type="radio"
                                    id={`projectSize-${index}`}
                                    name="projectSize"
                                    value={projectSize}
                                    onChange={(e) => setProjectSize(e.target.value)}
                                />
                                <span className="form-checkbox_cta-box">
                                    <span className="form-checkbox_cta-border"></span>
                                    <span className="form-checkbox_cta-ripple">
                                        <span></span>
                                    </span>
                                    <span className="form-checkbox_cta-title">
                                        <span data-text={projectSize}>{projectSize}</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group -it">
                <div className="form-label">Degré de difficulté ...</div>

                <div className="form-radio">
                    {difficulties.map((difficulty, index) => (
                        <div className="form-radio-col" key={index}>
                            <label className="form-checkbox form-checkbox_cta">
                                <input
                                    type="radio"
                                    id={`difficulty-${index}`}
                                    name="difficulty"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                />
                                <span className="form-checkbox_cta-box">
                                    <span className="form-checkbox_cta-border"></span>
                                    <span className="form-checkbox_cta-ripple">
                                        <span></span>
                                    </span>
                                    <span className="form-checkbox_cta-title">
                                        <span data-text={difficulty}>{difficulty}</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group -it">
                <div className="form-label">Nature des données ...</div>

                <div className="form-radio">
                    {dataNatures.map((dataNature, index) => (
                        <div className="form-radio-col" key={index}>
                            <label className="form-checkbox form-checkbox_cta">
                                <input
                                    type="radio"
                                    id={`dataNature-${index}`}
                                    name="dataNature"
                                    value={dataNature}
                                    onChange={(e) => setDataNature(e.target.value)}
                                />
                                <span className="form-checkbox_cta-box">
                                    <span className="form-checkbox_cta-border"></span>
                                    <span className="form-checkbox_cta-ripple">
                                        <span></span>
                                    </span>
                                    <span className="form-checkbox_cta-title">
                                        <span data-text={dataNature}>{dataNature}</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-group -it">
                <div className="form-label">Scalabilité nécessaire ...</div>

                <div className="form-radio">
                    {scalabilities.map((scalability, index) => (
                        <div className="form-radio-col" key={index}>
                            <label className="form-checkbox form-checkbox_cta">
                                <input
                                    type="radio"
                                    id={`scalability-${index}`}
                                    name="scalability"
                                    value={scalability}
                                    onChange={(e) => setScalability(e.target.value)}
                                />
                                <span className="form-checkbox_cta-box">
                                    <span className="form-checkbox_cta-border"></span>
                                    <span className="form-checkbox_cta-ripple">
                                        <span></span>
                                    </span>
                                    <span className="form-checkbox_cta-title">
                                        <span data-text={scalability}>{scalability}</span>
                                    </span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-submit">
                <button className="btn btn_cta -xxl" type="submit" onClick={generateRecommendation} disabled={loading}>
                    <span className="btn_cta-border"></span>
                    <span className="btn_cta-ripple">
                        <span></span>
                    </span>
                    <span className="btn_cta-title">
                        <span data-text="Get the recommendation">Get the recommendation</span>
                    </span>
                </button>
            </div>



            <Modal
                show={showModal && recommendation}
                onHide={handleClose}
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '30px' }}>
                        Recommendation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {recommendation && (
                        <div className="recommendation-result">
                            {recommendation.frontend && recommendation.backend && recommendation.database && (
                                <div className="recommendation-container">
                                    <div className="recommendation-item">
                                        <img
                                            src={recommendation.frontend.logo}
                                            alt="Frontend Logo"
                                            className="recommendation-logo"
                                        />
                                    </div>
                                    <div className="recommendation-item">
                                        <img
                                            src={recommendation.backend.logo}
                                            alt="Backend Logo"
                                            className="recommendation-logo"
                                        />
                                    </div>
                                    <div className="recommendation-item">
                                        <img
                                            src={recommendation.database.logo}
                                            alt="Database Logo"
                                            className="recommendation-logo"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="recommendation-message">
                                <p>{recommendation.message}</p>
                            </div>
                            <div className="note">
                                <p>Note: Feel free to choose whatever you like, these are just recommendations.</p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="btn-recommondation">
                        <button className="btn btn_cta -sm btn-save" onClick={goToCreateProject}>
                            <span className="btn_cta-border"></span>
                            <span className="btn_cta-ripple">
                                <span></span>
                            </span>
                            <span className="btn_cta-title">
                                <span data-text="Create Your Project">Create Your Project</span>
                            </span>
                        </button>
                    </div>
                </Modal.Footer>
            </Modal>

            <Loader loading={loading} />
        </div>

    );
}
