import React, { useState } from "react";
import "./Signup.css";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


function Signup() {
  const [formData, setFormData] = useState({
    username: "", 
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/signup", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      if (response.status === 201) {
        toast.success("User signed up successfully");
  
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data.error;
        if (errorMessage === "User with this email already exists") {
          toast.error(errorMessage);
        } else {
          toast.error("Signup failed. Please try again.");
        }
      } else {
        console.error("Signup failed:", error);
        toast.error("Signup failed. Please try again.");
      }
    }
  };

  

  return (
    <div className="Signup_main">
      <div className="login_container">
        <h1>Welcome To Pocket Saving</h1>
        <div className="signup_form">
          <form onSubmit={handleSubmit}>
            <div className="input_form">
              <label htmlFor="username">Name</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter Your Name"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="input_form">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="input_form">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter Your Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="input_form">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Enter Your Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="input_form">
              <button type="submit">Submit</button>
            </div>
          </form>
          <div className="login_content">
            <p>
              I have an account <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
