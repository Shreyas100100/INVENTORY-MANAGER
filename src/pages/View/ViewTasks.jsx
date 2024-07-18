import React, { useState, useEffect } from "react";
import { doc, updateDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { Table, Container, Card, Button, Modal, Form, Spinner } from "react-bootstrap";
import './ViewTasks.css'; // Importing the CSS file

export default function ViewTasks() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

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
    const fetchInventory = async () => {
      if (userId) {
        try {
          const q = query(collection(db, "inventory"), where("userId", "==", userId));
          const querySnapshot = await getDocs(q);
          const inventoryList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setInventory(inventoryList);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching inventory: ", error);
          setLoading(false);
        }
      }
    };
  
    fetchInventory();
  }, [userId]);

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (currentItem) {
      try {
        const itemDocRef = doc(db, "inventory", currentItem.id);
        await updateDoc(itemDocRef, currentItem);
        setShowEditModal(false);
        // Refresh inventory after edit
        const q = query(collection(db, "inventory"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const inventoryList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInventory(inventoryList);
      } catch (error) {
        console.error("Error updating inventory: ", error);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "inventory", itemToDelete.id));
        // Refresh inventory after delete
        const q = query(collection(db, "inventory"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const inventoryList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInventory(inventoryList);
        setShowDeleteModal(false);
      } catch (error) {
        console.error("Error deleting inventory: ", error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
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
    <Container className="d-flex flex-column justify-content-center align-items-center" style={{ paddingTop: "2rem" }}>
      <Card className="w-100">
        <Card.Body>
          <Card.Title>
            <h2 style={{ textAlign: "center" }}>View Inventory</h2>
          </Card.Title>
          <div className="table-responsive">
            <Table striped bordered hover className="table-fixed">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Owner Name</th>
                  <th>Owner ID</th>
                  <th>Assigned At</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Remarks</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.materialName}</td>
                    <td>{item.ownerName}</td>
                    <td>{item.ownerId}</td>
                    <td>{formatDate(item.assignedDate)}</td>
                    <td>{item.categoryId}</td>
                    <td>{item.quantity}</td>
                    <td>{item.remarks}</td>
                    <td>
                      <Button variant="primary" onClick={() => handleEditClick(item)}>
                        Update
                      </Button>
                    </td>
                    <td>
                      <Button variant="danger" onClick={() => handleDeleteClick(item)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Inventory Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Inventory Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentItem && (
            <Form>
              <Form.Group>
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="materialName"
                  value={currentItem.materialName}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Owner Name</Form.Label>
                <Form.Control
                  type="text"
                  name="ownerName"
                  value={currentItem.ownerName}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Assigned Date</Form.Label>
                <Form.Control
                  type="date"
                  name="assignedDate"
                  value={new Date(currentItem.assignedDate).toISOString().substring(0, 10)}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="categoryId"
                  value={currentItem.categoryId}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  value={currentItem.quantity}
                  onChange={handleEditChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Remarks</Form.Label>
                <Form.Control
                  type="text"
                  name="remarks"
                  value={currentItem.remarks}
                  onChange={handleEditChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Inventory Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this item?</p>
          <p>
            <strong>Product Name: </strong>{itemToDelete?.materialName}<br />
            <strong>Owner Name: </strong>{itemToDelete?.ownerName}<br />
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
