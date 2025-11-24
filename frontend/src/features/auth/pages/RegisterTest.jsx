import React from "react";
import { Link } from "react-router-dom";

const RegisterTest = () => {
  return (
    <div style={{ padding: "20px", backgroundColor: "lightblue" }}>
      <h1>Register Test Page</h1>
      <p>If you see this, the component is rendering!</p>
      <Link to="/login">Back to Login</Link>
    </div>
  );
};

export default RegisterTest;
