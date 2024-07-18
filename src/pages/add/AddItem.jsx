import React, { useState, useEffect } from "react";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Form, Card, Container, Row, Col, Button } from "react-bootstrap";
import { nanoid } from "nanoid";

export default function AddItem() {
  const [categoryName, setCategoryName] = useState("");
  const [machineName, setMachineName] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [materialPrice, setMaterialPrice] = useState("");
  const [materialLocation, setMaterialLocation] = useState("");
  const [materialCupboard, setMaterialCupboard] = useState("");
  const [materialShelf, setMaterialShelf] = useState("");
  const [materialMinQuantity, setMaterialMinQuantity] = useState("");
  const [typeOfWorkName, setTypeOfWorkName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [categories, setCategories] = useState([]);
  const [machines, setMachines] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(db, "materialCategories"));
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoryList);
    };

    const fetchMachines = async () => {
      const machineSnapshot = await getDocs(collection(db, "machines"));
      const machineList = machineSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMachines(machineList);
    };

    fetchCategories();
    fetchMachines();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!categoryName) {
      setSnackbarMessage("Category name is required.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const categoryId = nanoid(5);

      await setDoc(doc(db, "materialCategories", categoryId), {
        userId,
        categoryName,
        categoryId,
      });

      setSnackbarMessage("Category added successfully!");
      setSeverity("success");
      setOpenSnackbar(true);
      setCategoryName("");

      const newCategory = { userId, categoryName, categoryId };
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error("Error adding category: ", error);
      setSnackbarMessage("Failed to add category. Please try again.");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();

    if (!machineName) {
      setSnackbarMessage("Machine name is required.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const machineId = nanoid(5);

      await setDoc(doc(db, "machines", machineId), {
        userId,
        machineName,
        machineId,
      });

      setSnackbarMessage("Machine added successfully!");
      setSeverity("success");
      setOpenSnackbar(true);
      setMachineName("");

      const newMachine = { userId, machineName, machineId };
      setMachines([...machines, newMachine]);
    } catch (error) {
      console.error("Error adding machine: ", error);
      setSnackbarMessage("Failed to add machine. Please try again.");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleAddMaterialDetail = async (e) => {
    e.preventDefault();

    if (!materialName || !materialPrice || !selectedCategory || !selectedMachine || !materialLocation) {
      setSnackbarMessage("All fields are required.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const materialId = nanoid(5);

      await setDoc(doc(db, "materialDetails", materialId), {
        userId,
        materialName,
        materialPrice: parseFloat(materialPrice),
        categoryId: selectedCategory,
        machineId: selectedMachine,
        materialId,
        materialLocation,
        materialCupboard,
        materialShelf,
        materialMinQuantity: parseInt(materialMinQuantity, 10),
      });

      setSnackbarMessage("Material detail added successfully!");
      setSeverity("success");
      setOpenSnackbar(true);
      setMaterialName("");
      setMaterialPrice("");
      setMaterialLocation("");
      setMaterialCupboard("");
      setMaterialShelf("");
      setMaterialMinQuantity("");
      setSelectedCategory("");
      setSelectedMachine("");
    } catch (error) {
      console.error("Error adding material detail: ", error);
      setSnackbarMessage("Failed to add material detail. Please try again.");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleAddTypeOfWork = async (e) => {
    e.preventDefault();

    if (!typeOfWorkName) {
      setSnackbarMessage("Type of work name is required.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const typeOfWorkId = nanoid(5);

      await setDoc(doc(db, "typesOfWork", typeOfWorkId), {
        userId,
        name: typeOfWorkName,
        typeOfWorkId,
      });

      setSnackbarMessage("Type of work added successfully!");
      setSeverity("success");
      setOpenSnackbar(true);
      setTypeOfWorkName("");
    } catch (error) {
      console.error("Error adding type of work: ", error);
      setSnackbarMessage("Failed to add type of work. Please try again.");
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
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ paddingTop: "2rem" }}>
        <Row>
          <Col xs={12} md={6} className="d-flex justify-content-center mb-3">
            <Card style={{ width: "500px", maxWidth: "600px", height: "250px" }}>
              <Card.Body>
                <Card.Title className="text-center mb-4">Add Material Category</Card.Title>
                <Form onSubmit={handleAddCategory}>
                  <Form.Group controlId="categoryName">
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-center mt-4">
                    <Button variant="primary" type="submit" style={{ borderRadius: "0.4rem", width: "100%" }}>
                      Add Category
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-center mb-3">
            <Card style={{ width: "100%", maxWidth: "400px", height: "250px" }}>
              <Card.Body>
                <Card.Title className="text-center mb-4">Add Machine</Card.Title>
                <Form onSubmit={handleAddMachine}>
                  <Form.Group controlId="machineName">
                    <Form.Label>Machine Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={machineName}
                      onChange={(e) => setMachineName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-center mt-4">
                    <Button variant="primary" type="submit" style={{ borderRadius: "0.4rem", width: "100%" }}>
                      Add Machine
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-center mb-3">
            <Card style={{ width: "100%", maxWidth: "500px" }}>
              <Card.Body>
                <Card.Title className="text-center mb-4">Add Material Details</Card.Title>
                <Form onSubmit={handleAddMaterialDetail}>
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="materialName">
                        <Form.Label>Material Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={materialName}
                          onChange={(e) => setMaterialName(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="selectedCategory">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                          as="select"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                              {category.categoryName}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="materialPrice">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="text"
                          value={materialPrice}
                          onChange={(e) => setMaterialPrice(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="materialLocation">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                          type="text"
                          value={materialLocation}
                          onChange={(e) => setMaterialLocation(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="selectedMachine">
                        <Form.Label>Machine</Form.Label>
                        <Form.Control
                          as="select"
                          value={selectedMachine}
                          onChange={(e) => setSelectedMachine(e.target.value)}
                          required
                        >
                          <option value="">Select Machine</option>
                          {machines.map((machine) => (
                            <option key={machine.machineId} value={machine.machineId}>
                              {machine.machineName}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="materialCupboard">
                        <Form.Label>Cupboard</Form.Label>
                        <Form.Control
                          type="text"
                          value={materialCupboard}
                          onChange={(e) => setMaterialCupboard(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="materialShelf">
                        <Form.Label>Shelf</Form.Label>
                        <Form.Control
                          type="text"
                          value={materialShelf}
                          onChange={(e) => setMaterialShelf(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group controlId="materialMinQuantity">
                        <Form.Label>Minimum Stock Quantity</Form.Label>
                        <Form.Control
                          type="text"
                          value={materialMinQuantity}
                          onChange={(e) => setMaterialMinQuantity(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-center mt-4">
                    <Button variant="primary" type="submit" style={{ borderRadius: "0.4rem", width: "100%" }}>
                      Add Material
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity={severity}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
