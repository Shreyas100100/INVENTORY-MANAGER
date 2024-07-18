import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
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
  Table,
  Modal,
} from "react-bootstrap";
import { nanoid } from "nanoid";
import * as XLSX from "xlsx";

export default function AddMaterialCategoryAndDetails() {
  const [categoryName, setCategoryName] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [materialPrice, setMaterialPrice] = useState("");
  const [materialLocation, setMaterialLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [materialDetails, setMaterialDetails] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const [userId, setUserId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterCategory, setFilterCategory] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userModule, setUserModule] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserRole(user.uid).then((role) => setUserRole(role));
        fetchUserModule(user.uid).then((module) => setUserModule(module));
      } else {
        setUserId(null);
        setUserRole(null);
        setUserModule(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserRole = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().role;
    } else {
      console.error("No such document!");
      return null;
    }
  };

  const fetchUserModule = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().module;
    } else {
      console.error("No such document!");
      return null;
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(
        collection(db, "materialCategories")
      );
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoryList);
    };

    const fetchMaterialDetails = async () => {
      const materialDetailsSnapshot = await getDocs(
        collection(db, "materialDetails")
      );
      const materialDetailsList = materialDetailsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMaterialDetails(materialDetailsList);
    };

    fetchCategories();
    fetchMaterialDetails();
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

  const handleAddMaterialDetail = async (e) => {
    e.preventDefault();

    if (
      !materialName ||
      !materialPrice ||
      !selectedCategory ||
      !materialLocation
    ) {
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
        materialPrice,
        materialLocation,
        categoryId: selectedCategory,
        materialId,
      });

      setSnackbarMessage("Material detail added successfully!");
      setSeverity("success");
      setOpenSnackbar(true);
      setMaterialName("");
      setMaterialPrice("");
      setMaterialLocation("");
      setSelectedCategory("");

      const newMaterialDetail = {
        userId,
        materialName,
        materialPrice,
        materialLocation,
        categoryId: selectedCategory,
        materialId,
      };
      setMaterialDetails([...materialDetails, newMaterialDetail]);
    } catch (error) {
      console.error("Error adding material detail: ", error);
      setSnackbarMessage("Failed to add material detail. Please try again.");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleEditMaterialDetail = async (e) => {
    e.preventDefault();

    if (
      !editingMaterial.materialName ||
      !editingMaterial.materialPrice ||
      !editingMaterial.categoryId ||
      !editingMaterial.materialLocation
    ) {
      setSnackbarMessage("All fields are required.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    try {
      await updateDoc(doc(db, "materialDetails", editingMaterial.materialId), {
        materialName: editingMaterial.materialName,
        materialPrice: editingMaterial.materialPrice,
        materialLocation: editingMaterial.materialLocation,
        categoryId: editingMaterial.categoryId,
      });

      setSnackbarMessage("Material detail updated successfully!");
      setSeverity("success");
      setOpenSnackbar(true);

      const updatedMaterialDetails = materialDetails.map((material) =>
        material.materialId === editingMaterial.materialId
          ? editingMaterial
          : material
      );
      setMaterialDetails(updatedMaterialDetails);
      setShowEditModal(false);
      setEditingMaterial(null);
    } catch (error) {
      console.error("Error updating material detail: ", error);
      setSnackbarMessage("Failed to update material detail. Please try again.");
      setSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleDeleteMaterialDetail = async (materialId) => {
    try {
      await deleteDoc(doc(db, "materialDetails", materialId));

      setSnackbarMessage("Material detail deleted successfully!");
      setSeverity("success");
      setOpenSnackbar(true);

      const updatedMaterialDetails = materialDetails.filter(
        (material) => material.materialId !== materialId
      );
      setMaterialDetails(updatedMaterialDetails);
    } catch (error) {
      console.error("Error deleting material detail: ", error);
      setSnackbarMessage("Failed to delete material detail. Please try again.");
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

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(
      materialDetails.map((material) => ({
        "Material Name": material.materialName,
        Category:
          categories.find(
            (category) => category.categoryId === material.categoryId
          )?.categoryName || "Unknown",
        Location: material.materialLocation,
        Price: material.materialPrice,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Material Details");
    XLSX.writeFile(wb, "material_details.xlsx");
  };

  const sortedMaterialDetails = [...materialDetails].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredMaterialDetails = sortedMaterialDetails.filter((material) => {
    if (userRole === "superAdmin") {
      return true;
    }
    if (!filterCategory) {
      return material.materialLocation === userModule;
    }
    return (
      material.categoryId === filterCategory &&
      material.materialLocation === userModule
    );
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const openEditModal = (material) => {
    setEditingMaterial(material);
    setShowEditModal(true);
  };

  const handleEditModalChange = (e) => {
    const { name, value } = e.target;
    setEditingMaterial({ ...editingMaterial, [name]: value });
  };

  return (
    <div>
      <Container
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ paddingTop: "3rem" }}
      >
        <Row className="w-100 mt-4">
          <Col md={12}>
            <Card>
              <Card.Body>
                <Form.Group controlId="formCategoryFilter">
                  <Form.Label>Filter by Category</Form.Label>
                  <Form.Control
                    as="select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Button
                  variant="secondary"
                  onClick={handleDownload}
                  className="mt-3"
                >
                  Download Material Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="w-100 mt-4">
          <Col md={12}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th onClick={() => requestSort("materialName")}>
                    Material Name
                  </th>
                  <th>Category</th>
                  <th onClick={() => requestSort("materialLocation")}>
                    Module
                  </th>
                  <th> Cupboard </th>
                  <th> Shelf</th>
                  <th onClick={() => requestSort("materialPrice")}>Price</th>
                  {userRole === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMaterialDetails.map((material) => (
                  <tr key={material.materialId}>
                    <td>{material.materialName}</td>
                    <td>
                      {categories.find(
                        (category) =>
                          category.categoryId === material.categoryId
                      )?.categoryName || "Unknown"}
                    </td>
                    <td>{material.materialLocation}</td>
                    <td>{material.materialCupboard}</td>
                    <td>{material.materialShelf}</td>
                    <td>{material.materialPrice}</td>
                    {userRole === "admin" && (
                      <td>
                        <Button
                          variant="warning"
                          onClick={() => openEditModal(material)}
                        >
                          Edit
                        </Button>{" "}
                        <Button
                          variant="danger"
                          onClick={() =>
                            handleDeleteMaterialDetail(material.materialId)
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Material Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingMaterial && (
            <Form onSubmit={handleEditMaterialDetail}>
              <Form.Group controlId="editMaterialName">
                <Form.Label>Material Name</Form.Label>
                <Form.Control
                  type="text"
                  name="materialName"
                  value={editingMaterial.materialName}
                  onChange={handleEditModalChange}
                />
              </Form.Group>

              <Form.Group controlId="editMaterialPrice" className="mt-3">
                <Form.Label>Material Price</Form.Label>
                <Form.Control
                  type="number"
                  name="materialPrice"
                  value={editingMaterial.materialPrice}
                  onChange={handleEditModalChange}
                />
              </Form.Group>

              <Form.Group controlId="editMaterialLocation" className="mt-3">
                <Form.Label>Material Location (Module)</Form.Label>
                <Form.Control
                  type="text"
                  name="materialLocation"
                  value={editingMaterial.materialLocation}
                  onChange={handleEditModalChange}
                />
              </Form.Group>

              <Form.Group controlId="editMaterialCupboard" className="mt-3">
                <Form.Label>Cupboard</Form.Label>
                <Form.Control
                  type="text"
                  name="materialCupboard"
                  value={editingMaterial.materialCupboard}
                  onChange={handleEditModalChange}
                />
              </Form.Group>

              <Form.Group controlId="editMaterialShelf" className="mt-3">
                <Form.Label>Shelf</Form.Label>
                <Form.Control
                  type="text"
                  name="materialShelf"
                  value={editingMaterial.materialShelf}
                  onChange={handleEditModalChange}
                />
              </Form.Group>

              <Form.Group controlId="editCategorySelect" className="mt-3">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  as="select"
                  name="categoryId"
                  value={editingMaterial.categoryId}
                  onChange={handleEditModalChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option
                      key={category.categoryId}
                      value={category.categoryId}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3">
                Save Changes
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
