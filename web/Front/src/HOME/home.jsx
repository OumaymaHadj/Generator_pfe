import React, { useEffect } from "react";
import "../assets/css/home.css";
import Nav from "./nav";
import Intro from "./intro";
import Overview from "./overview";

function Home() {
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "../../public/js/bundle.js"; 
  //   script.defer = true;
  //   script.onload = () => console.log("Script loaded successfully");
  //   script.onerror = () => console.error("Error loading script");
  //   document.body.appendChild(script);
  //   return () => {
  //     document.body.removeChild(script);
  //   };
  // }, []);

  return (
    <div>
      {/* <Nav></Nav> */}
      <div className="cb-view" id="view-main">
        <div className="cb-layout" role="main">
          <Intro></Intro>
          <Overview></Overview>
        </div>
      </div>
    </div>
  );
}

export default Home;
