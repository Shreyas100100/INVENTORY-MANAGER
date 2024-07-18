import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import * as XLSX from "xlsx";

export default function ViewHistory() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, "inventoryTransactions")
        );
        const historyData = querySnapshot.docs.map((doc) => doc.data());
        setHistory(historyData);
        setFilteredHistory(historyData);

        const categorySnapshot = await getDocs(
          collection(db, "materialCategories")
        );
        const categoryData = categorySnapshot.docs.map((doc) => doc.data());
        setCategories(categoryData);

        const locationSnapshot = await getDocs(
          collection(db, "materialDetails")
        );
        const locationData = locationSnapshot.docs.map((doc) => doc.data());
        const uniqueLocations = [
          ...new Set(locationData.map((item) => item.materialLocation)),
        ];
        setLocations(uniqueLocations);

        const machineSnapshot = await getDocs(
          collection(db, "machines")
        );
        const machineData = machineSnapshot.docs.map((doc) => doc.data());
        setMachines(machineData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    filterHistory(category, selectedMonth, selectedLocation, selectedMachine);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    filterHistory(selectedCategory, month, selectedLocation, selectedMachine);
  };

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setSelectedLocation(location);
    filterHistory(selectedCategory, selectedMonth, location, selectedMachine);
  };

  const handleMachineChange = (e) => {
    const machine = e.target.value;
    setSelectedMachine(machine);
    filterHistory(selectedCategory, selectedMonth, selectedLocation, machine);
  };

  const filterHistory = (category, month, location, machine) => {
    let filtered = [...history];
    if (category) {
      filtered = filtered.filter((item) => item.categoryId === category);
    }
    if (month) {
      const monthString = new Date(month).toISOString().substring(0, 7);
      filtered = filtered.filter((item) =>
        item.assignedDate.startsWith(monthString)
      );
    }
    if (location) {
      filtered = filtered.filter((item) => item.location === location);
    }
    if (machine) {
      filtered = filtered.filter((item) => item.machineName === machine);
    }
    setFilteredHistory(filtered);
  };

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(filteredHistory);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, "inventory_history.xlsx");
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
    <Container style={{ paddingTop: "3rem" }}>
      <h2>Inventory History</h2>
      <Row className="mb-3">
        <Col xs={12} md={3}>
          <Form.Group>
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} md={3}>
          <Form.Group>
            <Form.Label>Filter by Month</Form.Label>
            <Form.Control
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={3}>
          <Form.Group>
            <Form.Label>Filter by Location</Form.Label>
            <Form.Select
              value={selectedLocation}
              onChange={handleLocationChange}
            >
              <option value="">All Locations</option>
              {locations.map((location, index) => (
                <option key={index} value={location}>
                  {location}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} md={3}>
          <Form.Group>
            <Form.Label>Filter by Machine</Form.Label>
            <Form.Select
              value={selectedMachine}
              onChange={handleMachineChange}
            >
              <option value="">All Machines</option>
              {machines.map((machine, index) => (
                <option key={index} value={machine.machineName}>
                  {machine.machineName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>
      <Button onClick={handleDownload} variant="success" className="mb-3">
        Download Excel
      </Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Owner</th>
            <th>Action</th>
            <th>Date</th>
            <th>New Quantity</th>
            <th>Work Type</th>
            <th>Machine</th>
          </tr>
        </thead>
        <tbody>
          {filteredHistory.map((item, index) => (
            <tr key={index}>
              <td>{item.materialName}</td>
              <td>{item.categoryName}</td>
              <td>{item.quantity}</td>
              <td>{item.ownerName}</td>
              <td>{item.actionType}</td>
              <td>{new Date(item.assignedDate).toLocaleDateString()}</td>
              <td>{item.newQuantity}</td>
              <td>{item.typeOfWork}</td>
              <td>{item.machineName}</td>
            </tr>
          ))}
        </tbody>
      </Table>
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
    </Container>
  );
}