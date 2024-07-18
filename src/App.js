import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/UserAuthContext";
import { MDBFooter } from "mdb-react-ui-kit";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Nvbr from "./Navbar/Navbar";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Profile from "./pages/Profile";
import AddItem from "./pages/add/AddItem";
import ManageInventory from "./pages/add/ManageInventory";
import ViewItems from "./pages/View/ViewItems";
import ForgotPassword from "./pages/ForgotPassword";
import GenerateQR from "./pages/add/GenerateQr";
import ViewInventory from "./pages/View/ViewInventory";
import ViewHistory from "./pages/View/ViewHistory";
import OrderRequirement from "./pages/OrderRequirement";
import AccessDenied from "./pages/AccessDenied";
import MachineWisePricing from "./pages/View/MachineWisePricing";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const ProtectedRoutes = () => {
  const { user } = useAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  if (user === null) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (role === null) {
    return <p>Loading...</p>; // or a spinner, or any other loading indicator
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Nvbr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home/" element={<Home />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="/signup" element={<Navigate to="/" />} />
        <Route path="/MachineWisePricing" element = {role === "user" ? <AccessDenied />: <MachineWisePricing /> } /> 
        <Route path="/addItem" element={role === "user" ? <AccessDenied /> : <AddItem />} />
        <Route path="/ManageInventory" element={<ManageInventory />} />
        <Route path="/addItem" element={role === "user" ? <AccessDenied /> : <AddItem />} />
        <Route path="/viewItems" element={role === "user" ? <AccessDenied /> :<ViewItems />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/viewInventory" element={role === "user" ? <AccessDenied /> :<ViewInventory />} />
        <Route path="/viewHistory" element={role === "user" ? <AccessDenied /> : <ViewHistory />} />
        <Route path="/generateQr" element={role === "user" ? <AccessDenied /> : <GenerateQR />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/orderRequirement" element={role === "user" ? <AccessDenied /> :<OrderRequirement />} />
      </Routes>
      <MDBFooter className="text-center text-lg-left mt-auto">
        <div className="text-center p-3">
          &copy; {new Date().getFullYear()} Copyright :{" "}
          <a href="https://github.com/shreyas100100">Shreyas Shripad Kulkarni</a>
        </div>
      </MDBFooter>
    </div>
  );
};

export default App;
