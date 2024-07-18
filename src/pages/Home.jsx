import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="home-container">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="home-content"
        style={{alignItems:"center", padding:"10rem"}}
      >
        <h1>Welcome to Inventory Manager</h1>
        <p>View and Manage Inventory Seamlessly</p>
        <Link to="/viewTasks">
          <button className="btn btn-primary">Get Started</button>
        </Link>
      </motion.div>
    </div>
  );
};

export default Home;
