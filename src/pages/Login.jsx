import React, { useState } from "react";
import { Form, Container, Card, Button, Row, Col } from "react-bootstrap";
import logo from "../images/lg.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import MuiAlert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSnackbarMessage("Login successful! Redirecting to Home...");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/home");
      }, 3000); // Redirect after 3 seconds
    } catch (error) {
      console.error("Login error:", error.message);
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
        <Row>
          <Col xs={12} md={6}>
            <div className="text-left">
              <img src={logo} alt="Logo" className="mb-4"  style={{height:"8rem"}}/>
              <h2>LOGIN</h2>
              <p>Schedule and Manage Tasks</p>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <Form onSubmit={handleSubmit}>
              <Form.Control
                type="email"
                placeholder="Email"
                className="mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Form.Control
                type="password"
                placeholder="Password"
                className="mb-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button variant="link" className="w-100 mb-3">
                <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </Button>
              <Button variant="link" className="w-100 mb-3">
                <Link to="/signup" style={{ textDecoration: "none" }}>
                  Create Account
                </Link>
              </Button>
              <Button variant="primary" type="submit" className="w-100">
                SIGN IN
              </Button>
            </Form>
          </Col>
        </Row>
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
            snackbarMessage.includes("successful") ? "success" : "error"
          }
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}
