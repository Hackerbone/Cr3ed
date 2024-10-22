// src/App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import FileTable from "./components/FileTable";
import QuickAccess from "./components/QuickAccess"; // Import QuickAccess
import Upload from "./components/Upload";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const addUploadedFile = (file) => {
    setUploadedFiles([...uploadedFiles, file]);
  };

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ flexGrow: 1 }}>
          <Header />
          <Routes>
            <Route
              path="/"
              element={<QuickAccess uploadedFiles={uploadedFiles} />}
            />{" "}
            {/* Show Quick Access */}
            <Route
              path="/files"
              element={<FileTable uploadedFiles={uploadedFiles} />}
            />
            <Route
              path="/upload"
              element={<Upload addUploadedFile={addUploadedFile} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
