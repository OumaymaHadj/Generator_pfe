import express from "express";
import createComponentAng from "../src/front/angular/createComponentAngular.js";
import createComponentReact from "../src/front/react/createComponentReact.js";
import createComponentVue from "../src/front/vue/createComponentVue.js";
import connect from '../src/controllers/connectController.js'
import generateProject from '../src/controllers/generateProjectController.js'
import liveDemo from "../src/controllers/liveDemoController.js";
import downloadProject from "../src/controllers/downloadController.js";

let router = express.Router();

router.post("/connect", connect);

router.post("/generateProject", generateProject);

router.post("/componentAngular", async (req, res) => {

  try {
    const result = await createComponentAng(req, res);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "An error occurred while creating the Angular component." });
  }
});

router.post("/componentReact", async (req, res) => {

  try {
    const result = await createComponentReact(res, req);
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "An error occurred while creating the React component." });
  }
});

router.post("/componentVue", async (req, res) => {

  try {
    const result = await createComponentVue(req, res);

  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "An error occurred while creating the VUe component." });
  }
});

router.post("/download", downloadProject);

router.post("/live-demo", liveDemo);

export default router;