import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Load email and password from local storage if Remember Me is checked
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';

    if (rememberedEmail && rememberedPassword && rememberMe) {
      setFormData({
        ...formData,
        email: rememberedEmail,
        password: rememberedPassword,
        rememberMe: true
      });
    }
  }, []); // Run only once on component mount

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', formData);
  
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('token', response.data.token);
        toast.success('Login successful!');

        // Remember email and password if Remember Me is checked
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
          localStorage.setItem('rememberedPassword', formData.password);
          localStorage.setItem('rememberMe', true);
        } else {
          // Clear remembered email and password if Remember Me is unchecked
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }

        window.location.href = '/home';
      } else {
        console.error('Login failed:', response);
        toast.error('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Invalid username or password. Please try again.');
      } else {
        toast.error('Login failed. Please try again.');
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
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Enter Your Email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="input_form">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Enter Your Password" value={formData.password} onChange={handleChange} />
            </div>
            <div className="input_form2">
              <input type='checkbox' id='check' name='rememberMe' checked={formData.rememberMe} onChange={handleChange} />
              <label htmlFor="check">Remember Me</label>
            </div>
            <div className="input_form">
              <button type="submit">Submit</button>
            </div>
          </form>
          <div className="login_content">
            <p>I don't have an account <Link to="/signup">Signup</Link></p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default Login;
