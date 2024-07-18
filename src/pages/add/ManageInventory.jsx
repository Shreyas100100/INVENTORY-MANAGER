import React, { useState, useEffect } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import {
  Form,
  Card,
  Container,
  Row,
  Col,
  Button,
  Spinner,
} from "react-bootstrap";
import { useLocation } from "react-router-dom";

export default function ManageInventory() {
  const location = useLocation();
  const {
    categoryId,
    machineId,
    machineName,
    categoryName,
    materialId,
    materialName,
  } = location.state || {};

  
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "");
  const [selectedMachine, setSelectedMachine] = useState(machineId || "");
  const [selectedMaterial, setSelectedMaterial] = useState(materialName || "");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userList, setUserList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [materialList, setMaterialList] = useState([]);
  const [materialPrice,setMaterialPrice] = useState([])
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionType, setActionType] = useState("Add");
  const [typeOfWork, setTypeOfWork] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map((doc) => {
          const userData = doc.data();
          return { name: userData.name, userId: userData.userId };
        });
        setUserList(users);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user names: ", error);
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchUsers();
    }
  }, [currentUserId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "materialCategories")
        );
        const categories = querySnapshot.docs.map((doc) => {
          const categoryData = doc.data();
          return {
            categoryId: doc.id,
            categoryName: categoryData.categoryName,
          };
        });
        setCategoryList(categories);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    if (currentUserId) {
      fetchCategories();
    }
  }, [currentUserId]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "materialDetails")
        );
        const prices = querySnapshot.docs.map((doc) => {
          const pricesData = doc.data();
          return {
            materialPrice: pricesData.materialPrice,
          };
        });
        setCategoryList(prices);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    if (currentUserId) {
      fetchPrices();
    }
  }, [currentUserId]);

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "machines"));
        const machines = querySnapshot.docs.map((doc) => {
          const machineData = doc.data();
          return {
            machineId: doc.id,
            machineName: machineData.machineName,
          };
        });
        setMachineList(machines);
      } catch (error) {
        console.error("Error fetching machines: ", error);
      }
    };

    if (currentUserId) {
      fetchMachines();
    }
  }, [currentUserId]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const materialQuery = query(
          collection(db, "materialDetails"),
          where("categoryId", "==", selectedCategory)
        );
        const querySnapshot = await getDocs(materialQuery);
        const materials = querySnapshot.docs.map((doc) => {
          const materialData = doc.data();
          return {
            materialId: doc.id,
            materialName: materialData.materialName,
          };
        });
        setMaterialList(materials);
      } catch (error) {
        console.error("Error fetching materials: ", error);
      }
    };

    if (selectedCategory) {
      fetchMaterials();
    } else {
      setMaterialList([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const fetchCurrentQuantity = async () => {
      if (!selectedMaterial) {
        setCurrentQuantity(0);
        return;
      }

      try {
        const materialRef = collection(db, "inventory");
        const materialQuery = query(
          materialRef,
          where(
            "materialId",
            "==",
            materialList.find((m) => m.materialName === selectedMaterial)
              ?.materialId
          )
        );
        const materialSnapshot = await getDocs(materialQuery);

        if (!materialSnapshot.empty) {
          const materialDoc = materialSnapshot.docs[0];
          const materialData = materialDoc.data();
          setCurrentQuantity(materialData.quantity);
        } else {
          setCurrentQuantity(0);
        }
      } catch (error) {
        console.error("Error fetching current quantity: ", error);
      }
    };

    if (selectedMaterial) {
      fetchCurrentQuantity();
    }
  }, [selectedMaterial, materialList]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedCategory ||
      !selectedMaterial ||
      !selectedOwner ||
      !assignedDate ||
      !quantity
    ) {
      setSnackbarMessage("All fields are required.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      const owner = userList.find((user) => user.name === selectedOwner);
      if (!owner || !owner.userId) {
        throw new Error("Owner not found or missing userId.");
      }

      const category = categoryList.find(
        (category) => category.categoryId === selectedCategory
      );
      if (!category) {
        throw new Error("Category not found.");
      }

      const materialRef = collection(db, "inventory");
      const materialQuery = query(
        materialRef,
        where(
          "materialId",
          "==",
          materialList.find((m) => m.materialName === selectedMaterial)
            ?.materialId
        )
      );
      const materialSnapshot = await getDocs(materialQuery);

      const inventoryData = {
        userId: currentUserId,
        categoryId: selectedCategory,
        categoryName: category.categoryName,
        materialId:
          materialList.find((m) => m.materialName === selectedMaterial)
            ?.materialId || "",
        materialName: selectedMaterial,
        ownerName: selectedOwner,
        assignedDate,
        quantity: parseInt(quantity),
        remarks,
        createdAt: new Date().toISOString(),
      };

      const materialDocRef = materialSnapshot.empty
        ? doc(collection(db, "inventory"))
        : materialSnapshot.docs[0].ref;

      await runTransaction(db, async (transaction) => {
        const materialDoc = await transaction.get(materialDocRef);
        let newQuantity = materialDoc.exists()
          ? materialDoc.data().quantity
          : 0;

        if (actionType === "Add") {
          newQuantity += parseInt(quantity);
        } else {
          newQuantity -= parseInt(quantity);
          if (newQuantity < 0) {
            throw new Error("Quantity cannot be less than zero.");
          }
        }

        transaction.set(materialDocRef, {
          ...inventoryData,
          quantity: newQuantity,
        });
        setCurrentQuantity(newQuantity);

        const transactionData = {
          ...inventoryData,
          actionType,
          newQuantity,
          typeOfWork: actionType === "Remove" ? typeOfWork : null,
          machineId: actionType === "Remove" ? selectedMachine : null,
          machineName: actionType === "Remove"
            ? machineList.find((m) => m.machineId === selectedMachine)?.machineName
            : null,
        };
        const transactionDocRef = doc(collection(db, "inventoryTransactions"));
        transaction.set(transactionDocRef, transactionData);
      });

      setSnackbarMessage(
        `Inventory ${actionType.toLowerCase()}ed successfully!`
      );
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error updating inventory: ", error);
      setSnackbarMessage("Failed to update inventory. Please try again.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <div>
      <Container
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ paddingTop: "3rem" }}
      >
        <Card
          style={{ alignItems: "center", width: "100%", maxWidth: "60rem" }}
        >
          <Card.Title>
            <h2 style={{ textAlign: "center", paddingTop: "2rem" }}>
              Material Entry
            </h2>
          </Card.Title>
          <Form
            onSubmit={handleSubmit}
            style={{ width: "100%", padding: "1rem" }}
          >
            <Row>
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Form.Group controlId="formCategory">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {categoryList.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Form.Group controlId="formMaterial">
                  <Form.Label>Material</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                  >
                    <option value="">Select Material</option>
                    {materialList.map((material) => (
                      <option
                        key={material.materialId}
                        value={material.materialName}
                      >
                        {material.materialName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Form.Group controlId="formOwner">
                  <Form.Label>Select Your Name</Form.Label>
                  <Form.Control
                    as="select"
                    value={selectedOwner}
                    onChange={(e) => setSelectedOwner(e.target.value)}
                  >
                    <option value="">Select Your Name</option>
                    {userList.map((user) => (
                      <option key={user.userId} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Form.Group controlId="formAssignedDate">
                  <Form.Label>Assigned Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Form.Group controlId="formQuantity">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Form.Group>
                  <Form.Label>Current Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    value={currentQuantity}
                    readOnly
                    aria-label="Current Quantity"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={6} lg={4} className="mb-3">
                <Form.Group controlId="formActionType">
                  <Form.Label>Action Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    <option value="Add">Add</option>
                    <option value="Remove">Required</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              {actionType === "Add" && (
                <Col xs={12} md={6} lg={4} className="mb-3">
                  <Form.Group controlId="formTypeOfWork">
                    <Form.Label>Type of Work</Form.Label>
                    <Form.Control
                      as="select"
                      value={typeOfWork}
                      onChange={(e) => setTypeOfWork(e.target.value)}
                    >
                      <option value="">Select Type of Work</option>
                      <option value="Add New Stock">Add New Stock</option>
                      <option value="Return">Return</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              )}
              {actionType === "Remove" && (
                <Col xs={12} md={6} lg={4} className="mb-3">
                  <Form.Group controlId="formTypeOfWork">
                    <Form.Label>Type of Work</Form.Label>
                    <Form.Control
                      as="select"
                      value={typeOfWork}
                      onChange={(e) => setTypeOfWork(e.target.value)}
                    >
                      <option value="">Select Type of Work</option>
                      <option value="Breakdown Maintainance">
                        Breakdown Maintainance
                      </option>
                      <option value="Preventive Maintainance">
                        Preventive Maintainance
                      </option>
                      <option value="Kaizen/ Modification">
                        Kaizen/ Modification
                      </option>
                      <option value="Test/Trial">Test/Trial</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
              )}

              {actionType === "Remove" && (
                <Col xs={12} md={6} lg={4} className="mb-3">
                  <Form.Group controlId="machineSelect">
                    <Form.Label>Name of Machine</Form.Label>
                    
                    <Form.Control
                      as="select"
                      value={selectedMachine}
                      onChange={(e) => setSelectedMachine(e.target.value)}
                    >
                      <option value="">Select Machine</option>
                      {machineList.map((machine) => (
                        <option
                          key={machine.machineId}
                          value={machine.machineId}
                        >
                          {machine.machineName}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              )}

              <Col xs={12} className="text-center">
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              onClose={handleCloseSnackbar}
              severity={snackbarSeverity}
            >
              {snackbarMessage}
            </MuiAlert>
          </Snackbar>
        </Card>
      </Container>
    </div>
  );
}
