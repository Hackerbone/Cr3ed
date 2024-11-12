import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { encrypt } from "@metamask/eth-sig-util";
import "./Upload.css"; // Import the CSS file

const Upload = ({ addUploadedFile }) => {
  const [fileName, setFileName] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);
  const projectId = "2IOUFPp6jaCvviGV7nMOkXaRtab";
  const projectSecret = "37d7e98f26e5136a5f6a6055fc1ca7db";
  const authorization =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

  const client = ipfsHttpClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization,
    },
  });

  const getWalletPublicKey = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      const publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [walletAddress],
      });
      if (!publicKey) {
        console.error("Encryption public key not found");
        return;
      }
      return publicKey;
    } catch (error) {
      console.error("Error fetching public key:", error);
    }
  };

  const encryptFile = async (fileContent, publicKey) => {
    try {
      const encryptedMessage = encrypt({
        publicKey,
        data: Buffer.from(fileContent).toString("base64"),
        version: "x25519-xsalsa20-poly1305",
      });
      const encryptedBuffer = Buffer.from(
        JSON.stringify(encryptedMessage),
        "utf-8"
      );
      return encryptedBuffer;
    } catch (error) {
      console.error("Error encrypting file: ", error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (event) => {
      const fileContent = event.target.result;
      const publicKey = await getWalletPublicKey();
      const encryptedFile = await encryptFile(fileContent, publicKey);

      try {
        setLoading(true);
        const added = await client.add(encryptedFile);
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        setIpfsUrl(url);
        setLoading(false);
        addUploadedFile({
          name: file.name,
          url: url,
        });
      } catch (error) {
        console.error("Error uploading file to IPFS: ", error);
        setLoading(false);
      }
    };
  };

  const decryptFile = async (encryptedData, walletAddress) => {
    try {
      const decrypted = await window.ethereum.request({
        method: "eth_decrypt",
        params: [encryptedData, walletAddress],
      });
      const decryptedBuffer = Buffer.from(decrypted, "base64");
      const blob = new Blob([decryptedBuffer], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);
      const element = document.createElement("a");
      element.href = url;
      element.download = "decrypted.png";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDecryptedData(url);
      return decryptedBuffer;
    } catch (error) {
      console.error("Error decrypting file:", error);
    }
  };

  const handleDecryptFile = async (ipfsUrl) => {
    if (!ipfsUrl) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      const key = ipfsUrl.replace("https://ipfs.infura.io/ipfs/", "");
      const enc_file_data = await client.cat(key);
      let enc_data = [];
      for await (const chunk of enc_file_data) enc_data.push(chunk);
      enc_data = Buffer.concat(enc_data).toString("utf8");
      await decryptFile(enc_data, walletAddress);
    } catch (error) {
      console.error("Error decrypting file from IPFS:", error);
    }
  };

  return (
    <div className="upload-container">
      <Typography variant="h5" className="upload-title">
        Upload a File to IPFS with Encryption
      </Typography>
      <div className="file-input-container">
        <input
          type="file"
          id="file-input"
          className="file-input"
          onChange={handleFileChange}
        />
        <label htmlFor="file-input" className="file-input-label">
          Choose file
        </label>
        <span className="file-name">{fileName || "No file chosen"}</span>
      </div>
      <Button
        variant="contained"
        color="primary"
        className="upload-button"
        disabled={loading}
        onClick={() => document.getElementById("file-input").click()}
      >
        {loading ? "Uploading..." : "Encrypt and Upload File"}
      </Button>

      {ipfsUrl && (
        <div className="uploaded-file-container">
          <Typography variant="h6" className="uploaded-file-title">
            File uploaded to IPFS:
          </Typography>
          <a
            href={ipfsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="uploaded-file-link"
          >
            {fileName} - {ipfsUrl}
          </a>
          <Button
            variant="contained"
            color="primary"
            className="decrypt-button"
            disabled={loading}
            onClick={() => handleDecryptFile(ipfsUrl)}
          >
            Decrypt File
          </Button>
        </div>
      )}

      {decryptedData && (
        <div className="decrypted-file-container">
          <Typography variant="h6" className="decrypted-file-title">
            Decrypted File Content:
          </Typography>
          <a
            href={decryptedData}
            download="decrypted.png"
            className="decrypted-file-link"
          >
            Download Decrypted File
          </a>
        </div>
      )}
    </div>
  );
};

export default Upload;
