import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Table, Form, Container, Row, Col, Button, Spinner } from "react-bootstrap";
import * as XLSX from 'xlsx';

export default function ViewInventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventorySnapshot = await getDocs(collection(db, "inventory"));
        const inventoryData = inventorySnapshot.docs.map(doc => doc.data());
        setInventory(inventoryData);
        setFilteredInventory(inventoryData);

        const categorySnapshot = await getDocs(collection(db, "materialCategories"));
        const categoryData = categorySnapshot.docs.map(doc => doc.data());
        setCategories(categoryData);
        
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
    filterInventory(category, selectedMonth);
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    filterInventory(selectedCategory, month);
  };

  const filterInventory = (category, month) => {
    let filtered = [...inventory];
    if (category) {
      filtered = filtered.filter(item => item.categoryId === category);
    }
    if (month) {
      const monthString = new Date(month).toISOString().substring(0, 7);
      filtered = filtered.filter(item => item.assignedDate.startsWith(monthString));
    }
    setFilteredInventory(filtered);
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredInventory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    XLSX.writeFile(workbook, "Inventory.xlsx");
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
    <Container>
      <Row className="mb-3">
        <Col xs={12} md={6} lg={4}>
          <Form.Group>
            <Form.Label>Filter by Category</Form.Label>
            <Form.Select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category.categoryId}>
                  {category.categoryName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Form.Group>
            <Form.Label>Filter by Month</Form.Label>
            <Form.Control
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={6} lg={4} className="d-flex align-items-end">
          <Button variant="success" onClick={downloadExcel}>Download as Excel</Button>
        </Col>
      </Row>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Category</th>
            <th>Material</th>
            <th>Owner</th>
            <th>Assigned Date</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map((item, index) => (
            <tr key={index}>
              <td>{item.categoryName}</td>
              <td>{item.materialName}</td>
              <td>{item.ownerName}</td>
              <td>{item.assignedDate}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
