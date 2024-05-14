import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import Alllist from "./Components/Alllist";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userLoggedIn = checkIfUserIsLoggedIn();
    setIsLoggedIn(userLoggedIn);
  }, []);

  function checkIfUserIsLoggedIn() {
    const token = localStorage.getItem("token");
    return !!token;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/login"
            element={<Login onLogin={() => setIsLoggedIn(true)} />}
          />
          {isLoggedIn ? (
            <>
              <Route path="/home" element={<Home onLogout={handleLogout} />} />
              <Route path="/alllist" element={<Alllist />} />
              <Route path="/" element={<Navigate to="/home" />} />
            </>
          ) : (
            <Route path="/" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </div>
      <ToastContainer theme="dark" />
    </BrowserRouter>
  );
}

export default App;
