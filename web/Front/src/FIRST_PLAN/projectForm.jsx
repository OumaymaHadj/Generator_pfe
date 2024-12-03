import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';

const ProjectForm = forwardRef(({ handleSubmit, loading }, ref) => {

  const [projectName, setProjectName] = useState('');
  const [techFront, settechFront] = useState('');
  const [techBack, settechBack] = useState('');
  const [database, setDatabase] = useState('');
  const [host, setHost] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [port, setPort] = useState('');
  const [namedb, setNamedb] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  useImperativeHandle(ref, () => ({
    resetForm,
  }));

  const resetForm = () => {
    setProjectName('');
    settechFront('');
    settechBack('');
    setDatabase('');
    setHost('');
    setUsername('');
    setPassword('');
    setPort('');
    setNamedb('')
    setInputErrors({ projectName: false, host: false, port: false });
  };

  
  const [inputErrors, setInputErrors] = useState({
    projectName: false,
    host: false,
    username: false,
    port: false,
    namedb: false,
  });

  const handleBlur = () => {
    setInputErrors({
      projectName: projectName.trim() === '',
      host: host.trim() === '',
      username: username.trim() === '',
      port: port.trim() === '',
      namedb: namedb.trim() === '',
    });
  };

  useEffect(() => {
    const isValid = projectName && techFront && techBack && database && host /*&& username*/ && port && namedb;
    setIsFormValid(isValid);
  }, [projectName, techFront, techBack, database, host, /*username,*/ port, namedb]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const formData = {
      projectName,
      techFront,
      techBack,
      host,
      database,
      username,
      password,
      port,
      namedb,
    };
    handleSubmit(formData);
  };

  return (
    <form className="wizard-form" onSubmit={onSubmit}>
      <div className="form-group">
        <div className="form-input light">
          <div className="light-box">
            <input
              type="text"
              name="name"
              placeholder="Project name"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (e.target.value.trim() !== '') {
                  setInputErrors((prev) => ({
                    ...prev,
                    projectName: false,
                  }));
                }
              }}
              onBlur={handleBlur}
              required
            />
            <div className="light-line"></div>
          </div>
          {inputErrors.projectName && (
            <div className="light-message">This field is required</div>
          )}
        </div>
      </div>

      <div className="form-group -it">
        <div className="form-label">Front-end technology ...</div>

        <div className="form-radio">
          <div className="form-radio-col">
            <label className="form-checkbox form-checkbox_cta">
              <input
                type="radio"
                id="angular"
                name="frontend"
                value="Angular"
                checked={techFront === "Angular"}
                onChange={(e) => settechFront(e.target.value)}
              />
              <span className="form-checkbox_cta-box">
                <span className="form-checkbox_cta-border"></span>
                <span className="form-checkbox_cta-ripple">
                  <span></span>
                </span>
                <span className="form-checkbox_cta-title">
                  <span data-text="Angular">Angular</span>
                </span>
              </span>
            </label>
          </div>

          <div className="form-radio-col">
            <label className="form-checkbox form-checkbox_cta">
              <input
                type="radio"
                id="reactnative"
                name="frontend"
                value="React"
                checked={techFront === "React"}
                onChange={(e) => settechFront(e.target.value)}
              />
              <span className="form-checkbox_cta-box">
                <span className="form-checkbox_cta-border"></span>
                <span className="form-checkbox_cta-ripple">
                  <span></span>
                </span>
                <span className="form-checkbox_cta-title">
                  <span data-text="React Native">React Native</span>
                </span>
              </span>
            </label>
          </div>

          <div className="form-radio-col">
            <label className="form-checkbox form-checkbox_cta">
              <input
                type="radio"
                id="vuejs"
                name="frontend"
                value="Vue"
                checked={techFront === "Vue"}
                onChange={(e) => settechFront(e.target.value)}
              />
              <span className="form-checkbox_cta-box">
                <span className="form-checkbox_cta-border"></span>
                <span className="form-checkbox_cta-ripple">
                  <span></span>
                </span>
                <span className="form-checkbox_cta-title">
                  <span data-text="Vue.js">Vue.js</span>
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-group -it">
        <div className="form-label">Back-end technology ...</div>

        <div className="form-radio">
          <div className="form-radio-col">
            <label className="form-checkbox form-checkbox_cta">
              <input
                type="radio"
                id="expressjs"
                name="backend"
                value="Express"
                checked={techBack === "Express"}
                onChange={(e) => settechBack(e.target.value)}
              />
              <span className="form-checkbox_cta-box">
                <span className="form-checkbox_cta-border"></span>
                <span className="form-checkbox_cta-ripple">
                  <span></span>
                </span>
                <span className="form-checkbox_cta-title">
                  <span data-text="Express.js">Express.js</span>
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="form-group -it">
        <div className="form-label">Which data base do you have ?</div>

        <div className="form-radio">
          <div className="form-radio-col">
            <label className="form-checkbox form-checkbox_cta">
              <input
                type="radio"
                id="mysql"
                name="database"
                value="mysql"
                checked={database === "mysql"}
                onChange={(e) => setDatabase(e.target.value)}
              />
              <span className="form-checkbox_cta-box">
                <span className="form-checkbox_cta-border"></span>
                <span className="form-checkbox_cta-ripple">
                  <span></span>
                </span>
                <span className="form-checkbox_cta-title">
                  <span data-text="MySQL">MySQL</span>
                </span>
              </span>
            </label>
          </div>

          <div className="form-radio-col">
            <label className="form-checkbox form-checkbox_cta">
              <input
                type="radio"
                id="mongodb"
                name="database"
                value="mongoDB"
                checked={database === "mongoDB"}
                onChange={(e) => setDatabase(e.target.value)}
              />
              <span className="form-checkbox_cta-box">
                <span className="form-checkbox_cta-border"></span>
                <span className="form-checkbox_cta-ripple">
                  <span></span>
                </span>
                <span className="form-checkbox_cta-title">
                  <span data-text="MongoDB">MongoDB</span>
                </span>
              </span>
            </label>
          </div>

          <div className="form-radio-col">
            <label className="form-checkbox form-checkbox_cta">
              <input
                type="radio"
                id="postgresql"
                name="database"
                value="postgres"
                checked={database === "postgres"}
                onChange={(e) => setDatabase(e.target.value)}
              />
              <span className="form-checkbox_cta-box">
                <span className="form-checkbox_cta-border"></span>
                <span className="form-checkbox_cta-ripple">
                  <span></span>
                </span>
                <span className="form-checkbox_cta-title">
                  <span data-text="PostgreSQL">PostgreSQL</span>
                </span>
              </span>
            </label>
          </div>


        </div>
      </div>

      <div className="form-group">
        <div className="form-label">Database connection ...</div>

        <div className="form-input light">
          <div className="light-box">
            <input
              type="text"
              value={host}
              onChange={(e) => {
                setHost(e.target.value);
                if (e.target.value.trim() !== '') {
                  setInputErrors((prev) => ({
                    ...prev,
                    host: false,
                  }));
                }
              }}
              placeholder="Your database host"
              required
              aria-label="Your database host"
            />
            <div className="light-line"></div>
          </div>
          {inputErrors.host && (
            <div className="light-message">This field is required</div>
          )}
        </div>

        <div className="form-input light">
          <div className="light-box">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);

              } }
              placeholder="Your database username"
              aria-label="Your database username"
            />
            <div className="light-line"></div>
          </div>
        </div>

        <div className="form-input light">
          <div className="light-box">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your database password"
              aria-label="Your database password"
            />
            <div className="light-line"></div>
          </div>
          <div className="light-message"></div>
        </div>

        <div className="form-input light">
          <div className="light-box">
            <input
              type="text"
              placeholder="Your databse port"
              value={port}
              onChange={(e) => {
                setPort(e.target.value);
                if (e.target.value.trim() !== '') {
                  setInputErrors((prev) => ({
                    ...prev,
                    port: false,
                  }));
                }
              }}
              required
              aria-label="Your database port"
            />
            <div className="light-line"></div>
          </div>
          {inputErrors.port && (
            <div className="light-message">This field is required</div>
          )}
        </div>

        <div className="form-input light">
          <div className="light-box">
            <input
              type="text"
              placeholder="Your database name"
              value={namedb}
              onChange={(e) => {
                setNamedb(e.target.value);
                if (e.target.value.trim() !== '') {
                  setInputErrors((prev) => ({
                    ...prev,
                    namedb: false,
                  }));
                }
              }}
              required
              aria-label="Your database name"
            />
            <div className="light-line"></div>
          </div>
          {inputErrors.namedb && (
            <div className="light-message">This field is required</div>
          )}
        </div>
      </div>
      <div className="form-submit">
        <button className="btn btn_cta -xxl" type="submit" onClick={onSubmit} disabled={!isFormValid || loading}>
          <span className="btn_cta-border"></span>
          <span className="btn_cta-ripple">
            <span></span>
          </span>
          <span className="btn_cta-title">
            <span data-text="Generate project">Generate project</span>
          </span>
        </button>
      </div>
    </form>
  )
})

export default ProjectForm;