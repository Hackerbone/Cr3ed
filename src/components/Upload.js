// src/components/Upload.js
import React, { useState } from "react";
import { Button, Typography, TextField } from "@mui/material";

const Upload = ({ addUploadedFile }) => {
  const [fileContent, setFileContent] = useState("");
  const [encryptedContent, setEncryptedContent] = useState("");
  const [aesKey, setAesKey] = useState(null);
  const [fileName, setFileName] = useState("");

  // Generate AES key
  const generateAesKey = async () => {
    const key = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    setAesKey(key);
    return key;
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name); // Store file name
    const reader = new FileReader();
    reader.onload = async (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(file);
  };

  // Encrypt file content
  const encryptContent = async () => {
    if (!fileContent) return alert("No file content to encrypt.");
    const key = aesKey || (await generateAesKey());
    const encoded = new TextEncoder().encode(fileContent);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded
    );

    // Convert encrypted data to base64 string using btoa
    const encryptedBase64 = btoa(
      String.fromCharCode(...new Uint8Array(encrypted))
    );
    setEncryptedContent(encryptedBase64);

    // Add file to the global list after encryption
    addUploadedFile({
      name: fileName,
      content: encryptedBase64,
      aesKey: key,
      iv: Array.from(iv), // Store IV as an array of numbers
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5">Upload and Encrypt a Text File</Typography>
      <input type="file" onChange={handleFileChange} />
      <Button
        variant="contained"
        color="primary"
        onClick={encryptContent}
        style={{ marginTop: "20px" }}
      >
        Encrypt File
      </Button>

      {encryptedContent && (
        <>
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            Encrypted Content:
          </Typography>
          <TextField
            fullWidth
            multiline
            value={encryptedContent}
            InputProps={{ readOnly: true }}
          />
        </>
      )}
    </div>
  );
};

export default Upload;
