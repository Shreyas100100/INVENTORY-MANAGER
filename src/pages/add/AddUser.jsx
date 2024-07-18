import React, { useState, useEffect } from "react";
import { doc, setDoc, collection } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Form, Card, Container, Row, Col, Button } from "react-bootstrap";
import { nanoid } from "nanoid";

export default function AddUser() {
  const [uName, setuName] = useState("");
  const [uOrg, setuOrg] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid); // Use the full user ID
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uName.trim() === "" || uOrg.trim() === "") {
      setSnackbarMessage("Please enter both user name and organization name");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    if (!userId) {
      setSnackbarMessage("User is not authenticated");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const newDocId = nanoid(5);
      const newDocRef = doc(collection(db, "usr"), newDocId); // Use the new short user ID as the document ID

      await setDoc(newDocRef, {
        vId: newDocId,
        uName: uName,
        uOrg: uOrg,
        userId: userId, // Store the full user ID
      });

      setSnackbarMessage("User added successfully");
      setSeverity("success");
      setOpenSnackbar(true);

      // Clear the input fields after successful submission
      setuName("");
      setuOrg("");
    } catch (error) {
      console.error("Error adding document: ", error);
      setSnackbarMessage("Error adding user: " + error.message);
      setSeverity("error");
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
    <div>
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{paddingTop:"2rem"}}>
        <Card style={{ alignItems: "center", width: "20rem" }}>
          <Card.Title>
            <h2 style={{ textAlign: "center", paddingTop: "2rem" }}>
              Add User
            </h2>
          </Card.Title>
          <Form onSubmit={handleSubmit}>
            <Col
              style={{
                alignContent: "center",
                paddingTop: "2rem",
                width: "16rem",
              }}
            >
              <Form.Control
                type="text"
                value={uName}
                onChange={(e) => setuName(e.target.value)}
                placeholder="Enter user name"
              />
            </Col>
            <Col
              style={{
                alignContent: "center",
                paddingTop: "2rem",
                width: "16rem",
              }}
            >
              <Form.Control
                type="text"
                value={uOrg}
                onChange={(e) => setuOrg(e.target.value)}
                placeholder="Enter Organization"
              />
            </Col>
            <Row
              className="justify-content-center"
              style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
            >
              <Col className="text-center">
                <Button
                  variant="primary"
                  className="mt-3"
                  type="submit"
                  style={{ borderRadius: "0.4rem", width: "12rem" }}
                >
                  ADD USER
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={severity}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
