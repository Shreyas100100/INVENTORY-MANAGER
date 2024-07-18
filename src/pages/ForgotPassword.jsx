
import React, { useState } from "react";
import { Form, Container, Card, Button } from "react-bootstrap";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import MuiAlert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setSnackbarMessage("Password reset email sent! Check your inbox.");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Password reset error:", error.message);
      setSnackbarMessage(error.message);
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center vh-100">
      <Card
        style={{ width: "100%", maxWidth: "600px", borderRadius: "1rem" }}
        className="text-center p-4 shadow"
      >
        <h2>Forgot Password</h2>
        <p>Enter your email to reset your password</p>
        <Form onSubmit={handleSubmit}>
          <Form.Control
            type="email"
            placeholder="Email"
            className="mb-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="primary" type="submit" className="w-100">
            Send Reset Email
          </Button>
        </Form>
        <Button variant="link" className="w-100 mt-3">
          <Link to="/login" style={{ textDecoration: "none" }}>
            Back to Login
          </Link>
        </Button>
      </Card>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={
            snackbarMessage.includes("sent") ? "success" : "error"
          }
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}
