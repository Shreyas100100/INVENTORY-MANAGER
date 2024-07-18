import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { Form, Card, Container, Button, Table, Spinner } from "react-bootstrap";

export default function MyTasks() {
  const [vId, setVId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vId) {
      fetchTasks();
    }
  }, [vId]);

  const fetchTasks = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, "tasks"), where("vId", "==", vId));
      const querySnapshot = await getDocs(q);

      const taskList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        assignedAt: formatDate(doc.data().assignedAt), // Format assignedAt date
      }));

      setTasks(taskList);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  };

  const handleAddQuote = async (taskId) => {
    try {
      // Prompt the user for the quote
      const quote = prompt("Enter your quote:");
      if (!quote) return; // If the user cancels or enters nothing, do nothing

      // Update the task with the quote and update time
      await updateDoc(doc(db, "tasks", taskId), {
        quote,
        updateTime: serverTimestamp(), // Store the update time
      });

      // Refetch tasks after updating quote
      fetchTasks();
    } catch (error) {
      console.error("Error updating quote: ", error);
    }
  };

  return (
    <Container className="d-flex flex-column justify-content-center align-items-center">
      <h2 style={{ textAlign: "center", paddingTop: "2rem" }}>Schedule</h2>
      <Card
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "1rem",
          marginBottom: "1rem",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Form onSubmit={fetchTasks} className="d-flex flex-column w-100">
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={vId}
              onChange={(e) => setVId(e.target.value)}
              placeholder="Enter vId"
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Fetch Tasks
          </Button>
        </Form>
      </Card>

      <Container className="d-flex flex-column justify-content-center align-items-center">
        {loading ? (
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : tasks.length === 0 ? (
          <Card style={{ width: "100%", maxWidth: "600px", marginTop: "2rem" }}>
            <Card.Body>
              <Card.Title style={{ textAlign: "center" }}>No Schedule!</Card.Title>
            </Card.Body>
          </Card>
        ) : (
          <Card
            style={{
              width: "100%",
              maxWidth: "800px",
              padding: "1rem",
              marginTop: "2rem",
              margin: "auto",
              overflowX: "auto",
            }}
          >
            <Card.Title>
              <h2 style={{ textAlign: "center" }}>PRIORITY</h2>
            </Card.Title>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Product Name</th>
                  <th>Item Owner</th>
                  <th>Item Owner ID</th>
                  <th>Assigned At</th>
                  <th>Variety</th>
                  <th>Quantity</th>
                  <th>Quote</th>
                  <th>Updated By Vendor</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr key={task.id}>
                    <td>{index + 1}</td>
                    <td>{task.itemName}</td>
                    <td>{task.itemOwner}</td>
                    <td>{task.vId}</td>
                    <td>{task.assignedAt}</td>
                    <td>{task.variety}</td>
                    <td>{task.quantity}</td>
                    <td>
                      {task.quote ? (
                        task.quote
                      ) : (
                        <Button variant="primary" size="sm" onClick={() => handleAddQuote(task.id)}>
                          Add Quote
                        </Button>
                      )}
                    </td>
                    <td>
                      {task.updateTime ? (
                        // Calculate and display time since last update by vendor
                        formatTimeSinceUpdate(task.updateTime)
                      ) : (
                        "Not updated"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        )}
      </Container>
    </Container>
  );
}

// Function to calculate time since last update by vendor
const formatTimeSinceUpdate = (timestamp) => {
  const updateTime = timestamp.toDate();
  const now = new Date();
  const diffMs = now - updateTime;

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days} day(s) ago`;
  } else if (hours > 0) {
    return `${hours} hour(s) ago`;
  } else {
    return `${minutes} minute(s) ago`;
  }
};
