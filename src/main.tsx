import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthSync } from "@/components/layout/AuthSync";
import { ThemeRoot } from "@/components/layout/ThemeRoot";
import "./styles/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthSync>
        <ThemeRoot>
          <App />
        </ThemeRoot>
      </AuthSync>
    </BrowserRouter>
  </StrictMode>,
);
