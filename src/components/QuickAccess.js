// src/components/QuickAccess.js
import React, { useState } from "react";
import { Grid, Paper, Typography, Button } from "@mui/material";

const QuickAccess = ({ uploadedFiles }) => {
  const [decryptedContent, setDecryptedContent] = useState("");

  // Decrypt file content
  const decryptContent = async (file) => {
    // Decode the base64 string to binary
    const encryptedBytes = Uint8Array.from(atob(file.content), (c) =>
      c.charCodeAt(0)
    );
    const iv = new Uint8Array(file.iv); // Convert IV array back to Uint8Array
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        file.aesKey,
        encryptedBytes
      );
      setDecryptedContent(new TextDecoder().decode(decrypted)); // Decode and set decrypted content
    } catch (error) {
      console.error("Decryption failed: ", error);
      alert("Decryption failed!");
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <Typography variant="h6">Quick Access</Typography>
      <Grid container spacing={2}>
        {uploadedFiles.slice(0, 3).map((file, index) => (
          <Grid item key={index} xs={4}>
            <Paper style={{ padding: "10px", textAlign: "center" }}>
              <Typography variant="body1">{file.name}</Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => decryptContent(file)}
              >
                Decrypt and View
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {decryptedContent && (
        <div style={{ marginTop: "20px" }}>
          <Typography variant="h6">Decrypted Content:</Typography>
          <Paper style={{ padding: "10px" }}>
            <Typography>{decryptedContent}</Typography>
          </Paper>
        </div>
      )}
    </div>
  );
};

export default QuickAccess;
