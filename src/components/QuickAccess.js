import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Button } from "@mui/material";
import { Description as FileIcon } from "@mui/icons-material";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/abi";
import "./QuickAccess.css";
import EmployeeManagement from "./EmployeeManagement";
import { useSelector } from "react-redux";

const QuickAccess = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [contract, setContract] = useState(null);
  // Access selected group from Redux store and use dispatch to update it
  const selectedGroupName = useSelector((state) => state.app.selectedGroup);
  console.log(selectedGroupName);
  // Initialize contract
  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(contractInstance);
      } else {
        alert("Please install MetaMask!");
      }
    };
    initContract();
  }, []);

  // Fetch files for the selected group
  useEffect(() => {
    const fetchFiles = async () => {
      if (contract && selectedGroupName) {
        try {
          const [fileNames, fileHashes] = await contract.getFilesByGroup(
            selectedGroupName
          );
          const files = fileNames.map((name, index) => ({
            name,
            hash: fileHashes[index],
          }));
          setUploadedFiles(files);
        } catch (error) {
          console.error("Error fetching files:", error);
        }
      }
    };
    fetchFiles();
  }, [contract, selectedGroupName]);

  return (
    <div className="quick-access">
      <Typography variant="h6" className="quick-access-title">
        Quick Access - {selectedGroupName}
      </Typography>
      <Grid container spacing={2}>
        {uploadedFiles.map((file, index) => (
          <Grid item key={index} xs={24} sm={12} lg={6}>
            <Paper
              className="quick-access-card"
              style={{ backgroundColor: "#2a2a2a" }}
            >
              <FileIcon className="file-icon" />
              <div>
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2">{file.hash}</Typography>
              </div>
              <Button
                variant="contained"
                style={{
                  marginLeft: "auto",
                }}
                color="primary"
                onClick={() =>
                  window.open(
                    `https://ipfs.infura.io/ipfs/${file.hash}`,
                    "_blank"
                  )
                }
              >
                View File
              </Button>
              <Button
                variant="contained"
                style={{
                  marginLeft: "auto",
                }}
                color="success"
              >
                Decrypt
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <EmployeeManagement />
    </div>
  );
};

export default QuickAccess;
