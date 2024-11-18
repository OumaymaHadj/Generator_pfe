import React, { useState } from 'react';
import '../assets/css/home.css';

const Nav = () => {
  // State to track whether the menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle the menu open/close state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`cb-menu -inverse ${isMenuOpen ? 'open' : ''}`}>
      <div className="cb-menu-toggle">
        <button
          className="cb-btn cb-btn_menu"
          aria-label="Menu"
          data-cursor="-menu"
          data-cursor-stick
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
        </button>
      </div>
      <div className={`cb-menu-box ${isMenuOpen ? 'open' : ''}`}>
        <div className="cb-menu-backdrop"></div>
        <div className="cb-menu-fill"></div>
        <div className="cb-menu-content">
          <div className="cb-menu-body">
            <div className="cb-menu-container">
              <div className="cb-menu-grid">
                <div className="cb-menu-grid-col -left">
                  <div className="cb-menu-title">Social</div>
                  <div className="cb-menu-socials" data-cursor="-opaque">
                    <a className="cb-menu-social" href="https://www.linkedin.com/" target="_blank" rel="noopener">
                      <em>
                        <span data-text="LinkedIn">LinkedIn</span>
                      </em>
                    </a>
                    <a className="cb-menu-social" href="https://www.youtube.com/" target="_blank" rel="noopener">
                      <em>
                        <span data-text="YouTube">YouTube</span>
                      </em>
                    </a>
                    <a className="cb-menu-social" href="https://twitter.com/" target="_blank" rel="noopener">
                      <em>
                        <span data-text="Twitter">Twitter</span>
                      </em>
                    </a>
                    <a className="cb-menu-social" href="https://github.com/" target="_blank" rel="noopener">
                      <em>
                        <span data-text="GitHub">GitHub</span>
                      </em>
                    </a>
                  </div>
                </div>
                <div className="cb-menu-grid-col -right">
                  <div className="cb-menu-title">Menu</div>
                  <div className="cb-menu-navs" role="navigation" data-cursor="-opaque">
                    <div className="cb-menu-nav -active">
                      <a href="/">
                        <em>
                          <span data-text="What we do">What we do</span>
                        </em>
                      </a>
                    </div>
                    <div className="cb-menu-nav">
                      <a href="https://oumaima-hadj-yahia.flesk.tn/">
                        <em>
                          <span data-text="Plan">Plan</span>
                        </em>
                      </a>
                    </div>
                    <div className="cb-menu-nav">
                      <a href="https://oumaima-hadj-yahia.flesk.tn/">
                        <em>
                          <span data-text="Pricing">Pricing</span>
                        </em>
                      </a>
                    </div>
                    <div className="cb-menu-nav">
                      <a href="https://oumaima-hadj-yahia.flesk.tn/">
                        <em>
                          <span data-text="Tutorials">Tutorials</span>
                        </em>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
