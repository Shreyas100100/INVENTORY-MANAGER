import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import {
  Container,
  Table,
  Spinner,
} from "react-bootstrap";

export default function MachineWisePricing() {
  const [toolUsage, setToolUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [machinePricing, setMachinePricing] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toolUsageSnapshot = await getDocs(
          collection(db, "toolUsage")
        );
        const toolUsageData = toolUsageSnapshot.docs.map((doc) => doc.data());
        setToolUsage(toolUsageData);

        const machineSnapshot = await getDocs(
          collection(db, "machines")
        );
        const machineData = machineSnapshot.docs.map((doc) => doc.data());

        // Group tool usage by machine and calculate total pricing
        const groupedData = toolUsageData.reduce((acc, item) => {
          const machine = machineData.find(machine => machine.machineId === item.machineId);
          if (!acc[item.machineId]) {
            acc[item.machineId] = {
              machineName: machine ? machine.machineName : "Unknown",
              totalCost: 0,
            };
          }
          acc[item.machineId].totalCost += item.toolCost;
          return acc;
        }, {});

        setMachinePricing(Object.values(groupedData));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <h2>Machine-Wise Pricing of Tools Utilized</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Machine Name</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {machinePricing.map((machine, index) => (
            <tr key={index}>
              <td>{machine.machineName}</td>
              <td>{machine.totalCost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
