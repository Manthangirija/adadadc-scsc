import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const [accountBalance, setAccountBalance] = useState("");

  const [inputAmount, setInputAmount] = useState("");
  const [productName, setProductName] = useState("");
  const [productAmount, setProductAmount] = useState("");
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [filter, setFilter] = useState("day");
  const [products, setProducts] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // open modal code
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Fetch account balance
  useEffect(() => {
    fetchAccountBalance();
    fetchProducts();
  }, []);

  const fetchAccountBalance = async () => {
    try {
      const response = await axios.get(
        "/getAccountBalance",
        {
          params: { email: localStorage.getItem("rememberedEmail") },
        }
      );
      setAccountBalance(response.data.accountBalance);
      setInputAmount("");
    } catch (error) {
      console.log("Error fetching account balance: ", error);
    }
  };

  // Handle input amount change
  const handleAmountChange = (e) => {
    setInputAmount(e.target.value);
  };

  const filterfc = (e) => {
    const flval = document.getElementById("filtertab").value;
    alert(flval);
    setFilter(flval);
  };

  // Handle adding money
  const handleAddMoney = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/addMoney", {
        email: localStorage.getItem("rememberedEmail"),
        accountBalance: inputAmount,
      });
      setAccountBalance(response.data.accountBalance);
      setInputAmount("");
      toast.success("Money Added successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error:", error);
    }
  };

  // Add products Item
  const handleProductChange = (e) => {
    const { name, value } = e.target;
    if (name === "productName") {
      setProductName(value);
    } else if (name === "productAmount") {
      setProductAmount(value);
    }
  };

  const handleAddProduct = async () => {
    try {
      const response = await axios.post("/addProduct", {
        email: localStorage.getItem("rememberedEmail"),
        productName,
        productAmount,
      });
      fetchProducts();
      if (response.status === 422) {
        toast.error("Error high price:");
      } else {
        setProducts([...products, response.data.newProduct]);
        setAccountBalance(response.data.balancemoney);
        toast.success("Product added successfully");
        setProductName("");
        setProductAmount("");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      // toast.error("Error adding product:", error);
      toast.error("Error high price:");
    }
  };

  // fetch the products
  const fetchProducts = async () => {
    try {
      const response = await axios.post("/getProducts", {
        email: localStorage.getItem("rememberedEmail"),
      });
      // setProducts(response.data);
      setProducts(response.data.products);
      setTotalAmount(response.data.totalAmount);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  };

  // Get the first letter of the user's email
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  const firstLetter = rememberedEmail
    ? rememberedEmail.charAt(0).toUpperCase()
    : "";

  function getClassForProduct(amount) {
    if (amount >= 100) {
      return "red-background";
    } else if (amount >= 50 && amount < 100) {
      return "orange-background";
    } else {
      return "green-background";
    }
  }

  return (
    <div className="Signup_main1">
      <div className="login_container1">
        <div className="navbar">
          <h1>Pocket Saving</h1>
          <div className="user-name">
            <h2>{firstLetter}</h2>
          </div>
        </div>

        <div
          className="account_saving"
          style={{ backgroundColor: `${(accountBalance / 100) * 255}` }}
        >
          <h2>Account Balance</h2>
          <div className="amount">
            <h2>{accountBalance}</h2>
            <i className="fa-solid fa-pen" onClick={openModal}></i>
          </div>
          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Add Your Amount</h2>
                <p>This is Your total amount</p>
                <input
                  type="number"
                  placeholder="enter your money"
                  value={inputAmount}
                  onChange={handleAmountChange}
                />
                <div className="modal_btn">
                  <button onClick={handleAddMoney}>Submit</button>
                  <button onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="content_text">
          <h4>Spending Money</h4>
          <div className="input_form1">
            <input
              type="text"
              name="productName"
              placeholder="Products..."
              value={productName}
              onChange={handleProductChange}
            />
            <input
              type="number"
              name="productAmount"
              placeholder="Amounts..."
              value={productAmount}
              onChange={handleProductChange}
            />
          </div>
          <button onClick={handleAddProduct}>Submit</button>
        </div>

        <div className="transaction_details">
          <p>Today Transactions</p>
          <Link to="/alllist">
            {" "}
            <p>View All</p>
          </Link>
        </div>
        <div className="markque_text">
          <marquee>
            {totalAmount < 100 ? (
              <span>Good news!!! You are saving your Money</span>
            ) : (
              <span>Bad News!! You are losing Your Money</span>
            )}
          </marquee>
        </div>
        <div className="products_details_list">
          <h4>Products</h4>
          <ul>
            {products.map((product, index) => (
              <li
                key={index}
                className={getClassForProduct(product.productAmount)}
              >
                <span>{product.productName}</span>
                <span>- {product.productAmount}</span>
              </li>
            ))}
          </ul>
          <div className="total_ammount">
            <span>Total</span>
            <span> {totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;
