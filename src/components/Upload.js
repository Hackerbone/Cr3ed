import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import { Buffer } from "buffer";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { encrypt } from "@metamask/eth-sig-util";

const Upload = ({ addUploadedFile }) => {
  const [fileName, setFileName] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null); // To store decrypted data
  const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
  const projectSecret = process.env.REACT_APP_INFURA_PROJECT_SECRET;
  const authorization =
    "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

  // IPFS client instance
  const client = ipfsHttpClient({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization,
    },
  });

  // Get MetaMask encryption public key
  const getWalletPublicKey = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Accounts: ", accounts);
      const walletAddress = accounts[0];
      console.log("Wallet Address: ", walletAddress);

      const publicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [walletAddress],
      });
      console.log("Public Key: ", publicKey);
      if (!publicKey) {
        console.error("Encryption public key not found");
        return;
      }

      return publicKey;
    } catch (error) {
      console.error("Error fetching public key:", error);
    }
  };

  // Encrypt file content using @metamask/eth-sig-util and the public key
  const encryptFile = async (fileContent, publicKey) => {
    try {
      // Encrypt the file content using @metamask/eth-sig-util
      const encryptedMessage = encrypt({
        publicKey, // MetaMask public key
        data: Buffer.from(fileContent).toString("base64"), // File content to encrypt (as base64 string)
        version: "x25519-xsalsa20-poly1305", // Required encryption version
      });

      // Convert the encrypted message to JSON and then to a Buffer for upload
      const encryptedBuffer = Buffer.from(
        JSON.stringify(encryptedMessage),
        "utf-8"
      );

      return encryptedBuffer;
    } catch (error) {
      console.error("Error encrypting file: ", error);
    }
  };

  // Handle file selection and upload to IPFS
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file); // Read as ArrayBuffer for binary files

    reader.onload = async (event) => {
      const fileContent = event.target.result; // ArrayBuffer

      // Get MetaMask wallet public key
      const publicKey = await getWalletPublicKey();

      // Encrypt the file content
      const encryptedFile = await encryptFile(fileContent, publicKey);

      try {
        setLoading(true);
        // Upload encrypted file to IPFS
        const added = await client.add(encryptedFile);
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        setIpfsUrl(url); // Store the IPFS URL for display
        setLoading(false);

        // Add file to the global list
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
  // Decrypt the file using MetaMask
  const decryptFile = async (encryptedData, walletAddress) => {
    try {
      const decrypted = await window.ethereum.request({
        method: "eth_decrypt",
        params: [encryptedData, walletAddress],
      });

      const decryptedBuffer = Buffer.from(decrypted, "base64");

      // Create a downloadable link for the decrypted image
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

  // Handle decryption of file fetched from IPFS
  const handleDecryptFile = async (ipfsUrl) => {
    if (!ipfsUrl) return;

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];

      // Fetch the encrypted file from IPFS
      const key = ipfsUrl.replace("https://ipfs.infura.io/ipfs/", "");
      const enc_file_data = await client.cat(key);

      let enc_data = [];
      for await (const chunk of enc_file_data) enc_data.push(chunk);
      enc_data = Buffer.concat(enc_data).toString("utf8");

      // Decrypt the encrypted data
      await decryptFile(enc_data, walletAddress);
    } catch (error) {
      console.error("Error decrypting file from IPFS:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="h5">
        Upload a File to IPFS with Encryption
      </Typography>
      <input type="file" onChange={handleFileChange} />
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "20px" }}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Encrypt and Upload File"}
      </Button>

      {ipfsUrl && (
        <>
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            File uploaded to IPFS:
          </Typography>
          <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
            {fileName} - {ipfsUrl}
          </a>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
            disabled={loading}
            onClick={() => handleDecryptFile(ipfsUrl)}
          >
            Decrypt File
          </Button>
        </>
      )}

      {decryptedData && (
        <div>
          <Typography variant="h6" style={{ marginTop: "20px" }}>
            Decrypted File Content:
          </Typography>
          <a href={decryptedData} download="decrypted.png">
            Download Decrypted File
          </a>
        </div>
      )}
    </div>
  );
};

export default Upload;
