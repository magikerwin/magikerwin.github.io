import { SITE_DATA } from "../data/site-data.js";
import { initRing3D } from "./ring3d.js";
import { initUI } from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  initUI(SITE_DATA);
  initRing3D(SITE_DATA.projects);
});
