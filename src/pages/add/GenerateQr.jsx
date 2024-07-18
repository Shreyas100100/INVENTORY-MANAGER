import React, { useState, useEffect } from 'react';
import { getDocs, collection, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import QRCode from 'qrcode.react';
import { Form, Card, Container, Row, Col, Button } from 'react-bootstrap';

export default function GenerateQR() {
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [qrData, setQRData] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
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
      try {
        const querySnapshot = await getDocs(collection(db, "materialCategories"));
        const categoryList = querySnapshot.docs.map(doc => ({
          categoryId: doc.id,
          categoryName: doc.data().categoryName
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    if (userId) {
      fetchCategories();
    }
  }, [userId]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "materialDetails"));
        const materialList = querySnapshot.docs
          .filter(doc => doc.data().categoryId === selectedCategory)
          .map(doc => ({
            materialId: doc.id,
            materialName: doc.data().materialName,
            categoryId: doc.data().categoryId
          }));
        setMaterials(materialList);
      } catch (error) {
        console.error("Error fetching materials: ", error);
      }
    };

    if (selectedCategory) {
      fetchMaterials();
    } else {
      setMaterials([]);
    }
  }, [selectedCategory]);

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);

    if (categoryId) {
      try {
        const categoryDoc = await getDoc(doc(db, "materialCategories", categoryId));
        if (categoryDoc.exists()) {
          setSelectedCategoryName(categoryDoc.data().categoryName);
        }
      } catch (error) {
        console.error("Error fetching category name: ", error);
      }
    } else {
      setSelectedCategoryName("");
    }
  };

  const handleGenerateQR = () => {
    if (selectedCategory && selectedMaterial) {
      const selectedMaterialObj = materials.find(material => material.materialId === selectedMaterial);
      const qrPayload = {
        categoryId: selectedCategory,
        categoryName: selectedCategoryName,
        materialId: selectedMaterialObj.materialId,
        materialName: selectedMaterialObj.materialName
      };
      setQRData(JSON.stringify(qrPayload));
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ paddingTop: "3rem" }}>
      <Card style={{ alignItems: "center", width: "100%", maxWidth: "40rem" }}>
        <Card.Title>
          <h2 style={{ textAlign: "center", paddingTop: "2rem" }}>
            Generate QR Code
          </h2>
        </Card.Title>
        <Form style={{ width: "100%", padding: "1rem" }}>
          <Row>
            <Col xs={12} className="mb-3">
              <Form.Group>
                <Form.Label>Choose Product Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  aria-label="Choose Product Category"
                >
                  <option value="">Choose Product Category</option>
                  {categories.map((item) => (
                    <option key={item.categoryId} value={item.categoryId}>
                      {item.categoryName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} className="mb-3">
              <Form.Group>
                <Form.Label>Choose Material</Form.Label>
                <Form.Select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  aria-label="Choose Material"
                  disabled={!selectedCategory}
                >
                  <option value="">Choose Material</option>
                  {materials.map((item) => (
                    <option key={item.materialId} value={item.materialId}>
                      {item.materialName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-center" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
            <Col className="text-center">
              <Button
                variant="primary"
                onClick={handleGenerateQR}
                disabled={!selectedCategory || !selectedMaterial}
              >
                Generate QR Code
              </Button>
            </Col>
          </Row>
        </Form>
        {qrData && (
          <div style={{ padding: "2rem" }}>
            <QRCode value={qrData} />
          </div>
        )}
      </Card>
    </Container>
  );
}
