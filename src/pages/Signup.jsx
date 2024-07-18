import React, { useState } from "react";
import { Form, Container, Card, Button, Row, Col } from "react-bootstrap";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../images/lg.png";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import MuiAlert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";
import { doc, setDoc } from "firebase/firestore";

export default function Signup() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [module, setModule] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!surname.trim()) errors.surname = "Surname is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      errors.email = "Email address is invalid";
    if (!phone.trim()) errors.phone = "Phone number is required";
    if (!department.trim()) errors.department = "Department is required";
    if (!module.trim()) errors.module = "Module is required";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters long";
    if (!confirmPassword)
      errors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          name,
          surname,
          email,
          phone,
          department,
          module,
          signupDate: new Date().toISOString(),
          role: "USER",
          userId: user.uid,
        });

        setSnackbarMessage("Sign up successful! Redirecting to login...");
        setSnackbarOpen(true);
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        setSnackbarMessage(error.message);
        setSnackbarOpen(true);
      }
    } else {
      setValidationErrors(errors);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: "",
    }));
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{paddingTop:"1rem"}}>
      <Card
        style={{ width: "100%", maxWidth: "600px", borderRadius: "1rem"}}
        className="text-center p-4 shadow"
      >
        <Row>
          <Col xs={12} className="mb-3">
            <img
              src={logo}
              alt="Logo"
              className="mb-2"
              style={{ height: "8rem" }}
            />
            <h2>SIGN UP</h2>
            <p>SCHEDULE.ORG New User</p>
          </Col>
          <Col xs={12}>
            <Form onSubmit={handleSubmit}>
              <TextField
                type="text"
                name="name"
                label="Name"
                value={name}
                onChange={handleChange(setName)}
                className="mb-2 w-100"
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
              <TextField
                type="text"
                name="surname"
                label="Surname"
                value={surname}
                onChange={handleChange(setSurname)}
                className="mb-2 w-100"
                error={!!validationErrors.surname}
                helperText={validationErrors.surname}
              />
              <TextField
                type="email"
                name="email"
                label="Email"
                value={email}
                onChange={handleChange(setEmail)}
                className="mb-2 w-100"
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
              <TextField
                type="text"
                name="phone"
                label="Phone"
                value={phone}
                onChange={handleChange(setPhone)}
                className="mb-2 w-100"
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
              />
              <TextField
                type="text"
                name="department"
                label="Department"
                value={department}
                onChange={handleChange(setDepartment)}
                className="mb-2 w-100"
                error={!!validationErrors.department}
                helperText={validationErrors.department}
              />
              <TextField
                type="text"
                name="module"
                label="Module"
                value={module}
                onChange={handleChange(setModule)}
                className="mb-2 w-100"
                error={!!validationErrors.module}
                helperText={validationErrors.module}
              />
              <TextField
                type={showPassword ? "text" : "password"}
                name="password"
                label="Password"
                value={password}
                onChange={handleChange(setPassword)}
                className="mb-2 w-100"
                error={!!validationErrors.password}
                helperText={validationErrors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                label="Confirm Password"
                value={confirmPassword}
                onChange={handleChange(setConfirmPassword)}
                className="mb-3 w-100"
                error={!!validationErrors.confirmPassword}
                helperText={validationErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="link" className="w-100 mb-3">
                <Link to="/login" style={{ textDecoration: "none" }}>
                  Already Registered? Log In
                </Link>
              </Button>
              <Button variant="primary" type="submit" className="w-100">
                SIGN UP
              </Button>
            </Form>
          </Col>
        </Row>
      </Card>
      <Snackbar
        open={snackbarOpen}
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
