import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function OrderRequirement() {
  const [lowStockMaterials, setLowStockMaterials] = useState([]);

  useEffect(() => {
    const fetchLowStockMaterials = async () => {
      try {
        // Fetch material details
        const materialsSnapshot = await getDocs(collection(db, "materialDetails"));
        const materials = materialsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch material categories
        const categoriesSnapshot = await getDocs(collection(db, "materialCategories"));
        const categories = categoriesSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data().categoryName;
          return acc;
        }, {});

        // Fetch inventory transactions
        const transactionsSnapshot = await getDocs(collection(db, "inventoryTransactions"));
        const transactions = transactionsSnapshot.docs.map((doc) => doc.data());

        // Calculate current stock for each material
        const materialStock = materials.reduce((acc, material) => {
          acc[material.materialId] = transactions
            .filter((tx) => tx.materialId === material.materialId)
            .reduce((total, tx) => {
              return tx.actionType === "Add" ? total + tx.quantity : total - tx.quantity;
            }, 0);
          return acc;
        }, {});

        // Find materials below minimum quantity
        const lowStock = materials.filter(
          (material) => materialStock[material.materialId] <= material.materialMinQuantity
        ).map((material) => ({
          materialName: material.materialName,
          materialCategory: categories[material.categoryId] || "Unknown Category",
          materialPrice: material.materialPrice,
          currentStock: materialStock[material.materialId],
          materialMinQuantity: material.materialMinQuantity,
        }));

        setLowStockMaterials(lowStock);
      } catch (error) {
        console.error("Error fetching low stock materials: ", error);
      }
    };

    fetchLowStockMaterials();
  }, []);

  return (
    <Container>
      <Row className="mt-5 justify-content-center">
        <Col xs={12} className="text-center">
          <h1>Order Requirements</h1>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col xs={12}>
          {lowStockMaterials.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Material Category</th>
                  <th>Material Price</th>
                  <th>Current Stock</th>
                  <th>Minimum Quantity</th>
                </tr>
              </thead>
              <tbody>
                {lowStockMaterials.map((material, index) => (
                  <tr key={index}>
                    <td>{material.materialName}</td>
                    <td>{material.materialCategory}</td>
                    <td>{material.materialPrice}</td>
                    <td>{material.currentStock}</td>
                    <td>{material.materialMinQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No materials are below the minimum quantity.</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}
