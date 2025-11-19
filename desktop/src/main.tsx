import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ToastProvider } from "./contexts/ToastContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { useFirebaseStorage } from "./hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import './index.css';

const AppWithProviders = () => {
  const { app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;

  return (
    <SettingsProvider db={db}>
      <App />
    </SettingsProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <AppWithProviders />
    </ToastProvider>
  </React.StrictMode>
);
