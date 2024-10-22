// src/components/Sidebar.js
import React from "react";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import UploadIcon from "@mui/icons-material/CloudUpload";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const location = useLocation(); // Get the current route to apply active class

  return (
    <div className="sidebar">
      <div className="sidebar-logo">CR3ED {/* Logo area */}</div>
      <List>
        <ListItem
          button
          component={Link}
          to="/"
          className={
            location.pathname === "/" ? "sidebar-link active" : "sidebar-link"
          }
        >
          <ListItemIcon className="sidebar-icon">
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/upload"
          className={
            location.pathname === "/upload"
              ? "sidebar-link active"
              : "sidebar-link"
          }
        >
          <ListItemIcon className="sidebar-icon">
            <UploadIcon />
          </ListItemIcon>
          <ListItemText primary="Upload" />
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;
