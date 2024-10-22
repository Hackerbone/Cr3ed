import React from "react";
import {
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  TextField,
  Avatar,
  Button,
  Grid,
} from "@mui/material";
import "./Header.css";

const Header = ({ walletAddress, setWalletAddress }) => {
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log("Connected account:", accounts[0]);
      } catch (error) {
        console.error("Connection error:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  return (
    <AppBar position="static" color="default" className="header-bar">
      <Toolbar>
        <Grid container alignItems="center">
          {/* Left Side: Select Dropdown */}
          <Grid item xs={4}>
            <Select defaultValue="Dev Team" className="header-select">
              <MenuItem value="Dev Team">Dev Team</MenuItem>
              <MenuItem value="Marketing Team">Marketing Team</MenuItem>
            </Select>
          </Grid>

          {/* Center: Search Bar */}
          <Grid item xs={4}>
            <TextField
              label="Search Your Files"
              variant="outlined"
              size="small"
              className="header-search"
              fullWidth
            />
          </Grid>

          {/* Right Side: Wallet and Avatar */}
          <Grid
            item
            xs={4}
            container
            alignItems="center"
            justifyContent="flex-end"
            spacing={2}
          >
            {/* MetaMask Connect Button */}
            <Grid item>
              <Button
                variant="contained"
                onClick={connectWallet}
                color="primary"
                className="wallet-button"
              >
                {walletAddress
                  ? `Connected: ${walletAddress.substring(
                      0,
                      6
                    )}...${walletAddress.substring(walletAddress.length - 4)}`
                  : "Connect MetaMask"}
              </Button>
            </Grid>

            {/* Avatar */}
            <Grid item>
              <Avatar className="header-avatar">U</Avatar>{" "}
              {/* Placeholder avatar */}
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
