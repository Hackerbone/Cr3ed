// src/components/Sidebar.js
import React from "react";
import "./Sidebar.css";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import UploadIcon from "@mui/icons-material/CloudUpload";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css"; // Import the custom CSS file

const Sidebar = () => {
  const location = useLocation(); // Get the current route to apply active class

  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#333",
        height: "100vh",
        color: "#fff",
      }}
    >
      <List>
        <ListItem
          button
          component={Link}
          to="/"
          className={
            location.pathname === "/" ? "sidebar-link active" : "sidebar-link"
          }
        >
          <ListItemIcon>
            <HomeIcon style={{ color: "#fff" }} />
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
          <ListItemIcon>
            <UploadIcon style={{ color: "#fff" }} />
          </ListItemIcon>
          <ListItemText primary="Upload" />
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;
