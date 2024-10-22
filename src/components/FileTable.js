// src/components/FileTable.js
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@mui/material";

const FileTable = ({ uploadedFiles }) => {
  const [decryptedContent, setDecryptedContent] = useState("");

  // Decrypt the file content
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
      <Typography variant="h6">Uploaded Files</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>File Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uploadedFiles.map((file, index) => (
              <TableRow key={index}>
                <TableCell>{file.name}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => decryptContent(file)}
                  >
                    Decrypt and View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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

export default FileTable;
