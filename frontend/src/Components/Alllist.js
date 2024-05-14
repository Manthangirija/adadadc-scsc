import React, { useState, useEffect } from "react";
import "./Alllist.css";
import Select from "react-select";
import { Link } from "react-router-dom";
import axios from "axios";
import html2pdf from "html2pdf.js";

function Alllist() {
  const [selectedOption, setSelectedOption] = useState({
    value: "today",
    label: "Today All",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const options = [
    { value: "today", label: "Today All" },
    { value: "All", label: "All" },
    { value: "january", label: "January" },
    { value: "february", label: "February" },
    { value: "march", label: "March" },
    { value: "april", label: "April" },
    { value: "may", label: "May" },
    { value: "june", label: "June" },
    { value: "july", label: "July" },
    { value: "august", label: "August" },
    { value: "september", label: "September" },
    { value: "october", label: "October" },
    { value: "november", label: "November" },
    { value: "december", label: "December" },
  ];

  useEffect(() => {
    fetchFilteredProducts(selectedOption.value);
  }, [selectedOption]);

  const fetchFilteredProducts = async (filterCriteria) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        "/filterProducts",
        {
          email: localStorage.getItem("rememberedEmail"),
          filterCriteria: filterCriteria,
        }
      );
      setFilteredProducts(response.data.products);
      setTotalAmount(response.data.totalAmount);
    } catch (error) {
      setError("Error fetching data");
      console.error("Error fetching filtered products:", error);
    } finally {
      setLoading(false);
    }
  };

  const isMonthAvailable = () => {
    if (
      selectedOption.value !== "today" &&
      filteredProducts.length === 0 &&
      !loading &&
      !error
    ) {
      return true;
    }
    return false;
  };

  const exportToPDF = () => {
    const content = document.getElementById("pdf-content");
    html2pdf(content);
  };
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    const formattedDate = `${formattedHours}.${formattedMinutes} ${ampm} || ${date.getDate()}-${
      date.getMonth() + 1
    }-${date.getFullYear()}`;

    return formattedDate;
  };
  let kharcha = filteredProducts.reduce((accumulator, product) => {
    return accumulator + parseInt(product.productAmount);
  }, 0);

  return (
    <div className="view_all">
      <div className="title">
        <p>
          <Link className="link" to="/home">
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
        </p>
        <h1>View All Transactions</h1>
      </div>

      <div className="btn_viewall">
        <div className="dropdown">
          <Select
            options={options}
            value={selectedOption}
            onChange={setSelectedOption}
          />
        </div>
        <div className="export_pdf">
          <button onClick={exportToPDF}>Export Pdf</button>
        </div>
      </div>
      <div className="main_list">
        <div className="transaction_details_lists" id="pdf-content">
          <table>
            <thead>
              <tr>
                <th>Products</th>
                <th>Date and Time</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3">Loading...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan="3">{error}</td>
                </tr>
              )}
              {isMonthAvailable() && (
                <tr>
                  <td className="error_messag" colSpan="3">
                    No transactions found for {selectedOption.label}
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                !isMonthAvailable() &&
                filteredProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.productName}</td>
                    <td>{formatTimestamp(product.timestamp)}</td>
                    <td className="red_span">- {  product.productAmount}</td>
                  </tr>
                ))}
                <tr>
                  <td className="total_text" colSpan={1}>Total</td>
                  <td></td>
                  <td className="total_text" colSpan={1}>{kharcha}</td>
                </tr>
                
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Alllist; 
