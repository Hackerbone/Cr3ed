// src/components/QuickAccess.js
import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import "./QuickAccess.css";

const QuickAccess = ({ uploadedFiles }) => {
  return (
    <div className="quick-access">
      <Typography variant="h6">Quick Access</Typography>
      <Grid container spacing={2}>
        {uploadedFiles.slice(0, 5).map((file, index) => (
          <Grid item key={index} xs={2}>
            <Paper className="quick-access-card">
              <Typography variant="body1">{file.name}</Typography>
              <Typography variant="body2">{file.uploadDate}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default QuickAccess;
