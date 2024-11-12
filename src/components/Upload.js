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

  function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

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
        throw new Error("Encryption public key not found");
      }
      return publicKey;
    } catch (error) {
      console.error("Error fetching public key:", error);
      throw error;
    }
  };

  const encryptFile = async (fileContent, publicKey) => {
    try {
      // Generate a random symmetric key
      const symmetricKey = window.crypto.getRandomValues(new Uint8Array(32));

      // Import the symmetric key
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        symmetricKey,
        "AES-GCM",
        false,
        ["encrypt"]
      );

      // Encrypt the file content using the symmetric key
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit nonce for AES-GCM
      const encryptedContentArrayBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
          tagLength: 128,
        },
        cryptoKey,
        fileContent
      );

      // Encrypt the symmetric key using the public key
      const encryptedSymmetricKeyObject = encrypt({
        publicKey,
        data: arrayBufferToBase64(symmetricKey),
        version: "x25519-xsalsa20-poly1305",
      });

      // Convert the encrypted symmetric key object to hex string
      const encryptedSymmetricKeyHex =
        "0x" +
        Buffer.from(
          JSON.stringify(encryptedSymmetricKeyObject),
          "utf8"
        ).toString("hex");

      return {
        encryptedContent: arrayBufferToBase64(encryptedContentArrayBuffer),
        encryptedSymmetricKey: encryptedSymmetricKeyHex,
        iv: arrayBufferToBase64(iv),
      };
    } catch (error) {
      console.error("Error encrypting file:", error);
      throw error;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (event) => {
      try {
        const fileContent = event.target.result;
        const publicKey = await getWalletPublicKey();
        const encryptedFile = await encryptFile(fileContent, publicKey);

        setLoading(true);
        const encryptedFileBuffer = Buffer.from(JSON.stringify(encryptedFile));
        const added = await client.add(encryptedFileBuffer);
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        setIpfsUrl(url);
        addUploadedFile({
          name: file.name,
          url: url,
        });
      } catch (error) {
        console.error("Error in reader.onload:", error);
      } finally {
        setLoading(false);
      }
    };
  };

  const decryptFile = async (
    encryptedContent,
    encryptedSymmetricKeyHex,
    iv,
    walletAddress
  ) => {
    try {
      // Decrypt the symmetric key using MetaMask
      const decryptedSymmetricKeyBase64 = await window.ethereum.request({
        method: "eth_decrypt",
        params: [encryptedSymmetricKeyHex, walletAddress],
      });

      const symmetricKey = base64ToArrayBuffer(decryptedSymmetricKeyBase64);

      // Import the symmetric key
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        new Uint8Array(symmetricKey),
        "AES-GCM",
        false,
        ["decrypt"]
      );

      // Decrypt the content
      const decryptedContentArrayBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: new Uint8Array(base64ToArrayBuffer(iv)),
          tagLength: 128,
        },
        cryptoKey,
        new Uint8Array(base64ToArrayBuffer(encryptedContent))
      );

      return decryptedContentArrayBuffer;
    } catch (error) {
      console.error("Error decrypting file:", error);
      throw error;
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

      // Fetch encrypted data from IPFS
      const enc_file_data = await client.cat(key);
      let enc_data = [];
      for await (const chunk of enc_file_data) {
        enc_data.push(chunk);
      }
      enc_data = Buffer.concat(enc_data).toString("utf8");
      const encryptedFile = JSON.parse(enc_data);

      const { encryptedContent, encryptedSymmetricKey, iv } = encryptedFile;

      // Decrypt the file
      const decryptedContentArrayBuffer = await decryptFile(
        encryptedContent,
        encryptedSymmetricKey,
        iv,
        walletAddress
      );

      // Create a Blob from the decrypted content and generate a download link
      const blob = new Blob([decryptedContentArrayBuffer], {
        type: "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      setDecryptedData(url);
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
            download={fileName}
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
