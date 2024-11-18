import React from 'react';
import '../assets/css/home.css';

const Intro = () => {
  return (
    <header className="cb-intro" data-menu-inverse data-cursor="-inverse">
      <div className="cb-intro-content">
        <div className="cb-intro-body">
          <div className="cb-intro-container -sm">
            <div className="cb-intro-header">
              <h1>
                <em>
                  <span className="-word">We</span>
                </em>
                <br className="-lsm" />
                <span className="cb-btn cb-btn_cta -intro -tertiary">
                  <span className="cb-btn_cta-border"></span>
                  <span className="cb-btn_cta-ripple">
                    <span></span>
                  </span>
                  <span className="cb-btn_cta-title">
                    <span data-text="create">create</span>
                  </span>
                </span>
                <br />
                <em>
                  <span className="-word">automatically</span>
                </em>
                <br />
                <em>
                  <span className="-word">
                    <span className="-gxs -blink">_</span>
                    projects
                  </span>
                </em>
              </h1>
            </div>
          </div>
        </div>
      {/*  <div className="cb-intro-bottom">
          <div className="cb-intro-figure">
            <div className="cb-intro-figure-media">
              <video
                src="https://cdn.cuberto.com/cb/hello/intro/2.mp4"
                autoPlay
                playsInline
                loop
                muted
              ></video>
            </div>
          </div>
        </div> */}
      </div>
    </header>
  );
};

export default Intro;
