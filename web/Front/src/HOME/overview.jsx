import React from "react";
import '../assets/css/home.css';
import { useNavigate } from "react-router-dom";

const Overview = () => {
  const navigate = useNavigate();

  return (
    <>


      <section className="cb-achievement">
        <div className="cb-achievement-content">
          <div className="cb-achievement-container -xs">
            <div className="cb-achievement-text">
              <p>
                PLAN <br /> AND <br /> PRICING
              </p>
            </div>
            <div className="cb-achievement-items">
              <div className="cb-achievement-item -inverse">
                <div className="cb-achievement-item-bg">
                  <div className="cb-achievement-item-figure -sm">
                    <div className="cb-achievement-item-figure-media">
                      <video autoPlay playsInline loop muted>
                        <source
                          src="/media/init.mp4"
                          type='video/webm;codecs="vp09.00.10.08.00"'
                        />
                        <source
                          src="/media/init.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>
                </div>
                <div className="cb-achievement-item-info">
                  <div className="cb-achievement-item-title">init</div>
                  <div className="cb-achievement-item-title-price">2.99 DT</div>
                  <div className="cb-achievement-item-text">
                    <p>
                      Wizard questions, generate, upload, unzip, and integrate
                      files into your project smoothly.
                    </p>
                    <p id="create-project-link" onClick={() => navigate(`/recommandation?source=init`)}>
                      Create Project
                    </p>
                  </div>
                </div>
              </div>
              <div className="cb-achievement-item -opaque">
                <div className="cb-achievement-item-bg">
                  <div className="cb-achievement-item-figure -sm">
                    <div className="cb-achievement-item-figure-media">
                      <video autoPlay playsInline loop muted>
                        <source
                          src="https://cdn.cuberto.com/cb/hello/achievement/2.webm"
                          type="video/webm"
                        />
                        <source
                          src="https://cdn.cuberto.com/cb/hello/achievement/2.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>
                </div>
                <div className="cb-achievement-item-info">
                  <div className="cb-achievement-item-title">init+</div>
                  <div className="cb-achievement-item-title-price">3.99 DT</div>
                  <div className="cb-achievement-item-text">
                    <p>Initialize and demonstrate in a new tab.</p>
                    <p id="create-project-link" onClick={() => navigate(`/recommandation?source=initWithDemo`)}>
                      Create Project With Live Demo
                    </p>
                  </div>
                </div>
              </div>
              <div className="cb-achievement-item -inverse">
                <div className="cb-achievement-item-bg">
                  <div className="cb-achievement-item-figure">
                    <div className="cb-achievement-item-figure-media">
                      <video autoPlay playsInline loop muted style={{ width: '560px', height: 'auto', margin: '80px', marginLeft: '70px'}}>
                        <source
                          src="/media/npm.mp4"
                          type="video/mp4"
                        />
                      </video>
                    </div>
                  </div>
                </div>
                <div className="cb-achievement-item-info">
                  <div className="cb-achievement-item-title">npm</div>
                  <div className="cb-achievement-item-title-price">4.99 DT</div>
                  <div className="cb-achievement-item-text">
                    <p>
                      Integrate the Release by Installing the Package and
                      Running Commands.
                    </p>
                    <p>
                      <a  href="https://www.npmjs.com/package/generator-cli-pfe" target="_blank" className="install-link" >
                        Install NPM
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cb-brandreel" data-menu-inverse data-cursor="-inverse">
        <div className="cb-brandreel-content">
          <div className="cb-brandreel-reels">
            <div className="cb-brandreel-reel">
              <div className="cb-brandreel-reel-wrap">
                <div className="cb-brandreel-reel-item -mobile">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/mobile.svg"
                    loading="lazy"
                    alt="Mobile"
                  />
                </div>
                <div className="cb-brandreel-reel-item -swift">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/swift.svg"
                    loading="lazy"
                    alt="Swift"
                  />
                </div>
                <div className="cb-brandreel-reel-item -kotlin">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/kotlin.svg"
                    loading="lazy"
                    alt="Kotlin"
                  />
                </div>
                <div className="cb-brandreel-reel-item -react">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/react.svg"
                    loading="lazy"
                    alt="React Native"
                  />
                </div>
                <div className="cb-brandreel-reel-item -java">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/java.svg"
                    loading="lazy"
                    alt="Java"
                  />
                </div>
                {/* Duplicate items for seamless scrolling */}
                <div className="cb-brandreel-reel-item -mobile">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/mobile.svg"
                    loading="lazy"
                    alt="Mobile"
                  />
                </div>
                <div className="cb-brandreel-reel-item -swift">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/swift.svg"
                    loading="lazy"
                    alt="Swift"
                  />
                </div>
                <div className="cb-brandreel-reel-item -kotlin">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/kotlin.svg"
                    loading="lazy"
                    alt="Kotlin"
                  />
                </div>
                <div className="cb-brandreel-reel-item -react">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/react.svg"
                    loading="lazy"
                    alt="React Native"
                  />
                </div>
                <div className="cb-brandreel-reel-item -java">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/java.svg"
                    loading="lazy"
                    alt="Java"
                  />
                </div>
              </div>
            </div>
            <div className="cb-brandreel-reel">
              <div className="cb-brandreel-reel-wrap">
                <div className="cb-brandreel-reel-item -web">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/web.svg"
                    loading="lazy"
                    alt="Web"
                  />
                </div>
                <div className="cb-brandreel-reel-item -js">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/js.svg"
                    loading="lazy"
                    alt="JS"
                  />
                </div>
                <div className="cb-brandreel-reel-item -nodejs">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/nodejs.svg"
                    loading="lazy"
                    alt="Node.js"
                  />
                </div>
                <div className="cb-brandreel-reel-item -html">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/html.svg"
                    loading="lazy"
                    alt="HTML"
                  />
                </div>
                <div className="cb-brandreel-reel-item -redis">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/redis.svg"
                    loading="lazy"
                    alt="Redis"
                  />
                </div>
                {/* Duplicate items for seamless scrolling */}
                <div className="cb-brandreel-reel-item -web">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/web.svg"
                    loading="lazy"
                    alt="Web"
                  />
                </div>
                <div className="cb-brandreel-reel-item -js">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/js.svg"
                    loading="lazy"
                    alt="JS"
                  />
                </div>
                <div className="cb-brandreel-reel-item -html">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/html.svg"
                    loading="lazy"
                    alt="HTML"
                  />
                </div>
                <div className="cb-brandreel-reel-item -nodejs">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/nodejs.svg"
                    loading="lazy"
                    alt="Node.js"
                  />
                </div>
                <div className="cb-brandreel-reel-item -html">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/html.svg"
                    loading="lazy"
                    alt="HTML"
                  />
                </div>
                <div className="cb-brandreel-reel-item -redis">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/redis.svg"
                    loading="lazy"
                    alt="Redis"
                  />
                </div>
                <div className="cb-brandreel-reel-item -html">
                  <img
                    src="https://cdn.cuberto.com/cb/hello/brands/html.svg"
                    loading="lazy"
                    alt="HTML"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Overview;
