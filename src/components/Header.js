// src/components/Header.js
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = () => {
  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          CR3ED - Decentralized File Encryption
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
