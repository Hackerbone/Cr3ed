// src/components/Header.js
import React from "react";
import {
  AppBar,
  Toolbar,
  //   Typography,
  Select,
  MenuItem,
  TextField,
  Avatar,
} from "@mui/material";
import "./Header.css";

const Header = () => {
  return (
    <AppBar position="static" color="default" className="header-bar">
      <Toolbar>
        <Select defaultValue="Dev Team" className="header-select">
          <MenuItem value="Dev Team">Dev Team</MenuItem>
          <MenuItem value="Marketing Team">Marketing Team</MenuItem>
        </Select>
        <TextField
          label="Search Your Files"
          variant="outlined"
          size="small"
          className="header-search"
        />
        <Avatar className="header-avatar">U</Avatar> {/* Placeholder avatar */}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
