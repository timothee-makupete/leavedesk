import React from "react";
import { createRoot } from "react-dom/client";
import { AppMount } from "./app/AppMount";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<AppMount />);
}
