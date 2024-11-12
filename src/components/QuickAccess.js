import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { Description as FileIcon } from "@mui/icons-material";
import "./QuickAccess.css";
import EmployeeManagement from "./EmployeeManagement";

const QuickAccess = ({ uploadedFiles }) => {
  return (
    <div className="quick-access">
      <Typography variant="h6" className="quick-access-title">
        Quick Access
      </Typography>
      <Grid container spacing={2}>
        {uploadedFiles.slice(0, 5).map((file, index) => (
          <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
            <Paper
              className="quick-access-card"
              style={{ backgroundColor: "#2a2a2a" }}
            >
              <FileIcon className="file-icon" />
              <div>
                <Typography variant="body1">{file.name}</Typography>
                <Typography variant="body2">{file.uploadDate}</Typography>
              </div>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <EmployeeManagement />
    </div>
  );
};

export default QuickAccess;
