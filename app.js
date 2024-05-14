require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Remove duplicate import
const User = require("./models/User");
const UserMoneyAdd = require("./models/Moneyadd.js");
const Products = require("./models/Products");
const cors = require("cors");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Signup endpoint
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    // If everything is okay, create a new user
    const user = new User({ username, email, password });
    await user.save();
    // Generate token
    const token = jwt.sign({ email: user.email }, JWT_SECRET);
    // console.log('JWT_SECRET:', JWT_SECRET);
    // Return token in response
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
    // console.log(token);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Money Add Home page
app.post("/addMoney", async (req, res) => {
  try {
    const { email, accountBalance } = req.body;
    let userAccount = await UserMoneyAdd.findOne({ email });
    if (!userAccount) {
      userAccount = new UserMoneyAdd({ accountBalance, email });
    } else {
      userAccount.accountBalance = accountBalance;
    }
    await userAccount.save();
    res.status(200).json({ accountBalance: userAccount.accountBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});
// Account Balance Api
app.get("/getAccountBalance", async (req, res) => {
  try {
    const { email } = req.query;
    const userAccount = await UserMoneyAdd.findOne({ email }).sort({
      createdAt: -1,
    });
    if (!userAccount) {
      return res.status(404).json({ message: "Account balance not found" });
    }
    res.status(200).json({ accountBalance: userAccount.accountBalance });
  } catch (error) {
    res.status(500).json({ errror: "Internal Server Error" });
    console.log(error);
  }
});

// product added
app.post("/addProduct", async (req, res) => {
  try {
    const { email, productName, productAmount } = req.body;
    const newProduct = new Products({ productName, productAmount, email });
    await newProduct.save();
    let balancemoney;
    if (newProduct) {
      const user1 = await UserMoneyAdd.findOne({ email });
      if (productAmount > user1.accountBalance) {
        return res.status(422).json({ newProduct });
      }

      balancemoney = user1.accountBalance - productAmount;
      const newm = await UserMoneyAdd.findByIdAndUpdate(user1._id, {
        accountBalance: balancemoney,
      });
      
    }

    res.status(200).json({ newProduct, balancemoney });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error adding product:", error);
  }
});


// Product display for today
app.post("/getProducts", async (req, res) => {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
    
    const products = await Products.find({
      email: req.body.email,
      timestamp: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const totalAmount = products.reduce((acc, product) => acc + product.productAmount, 0);

    res.status(200).json({ products, totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error fetching products:", error);
  }
});

// View All Transaction  filtering 
// app.post("/filterProducts", async (req, res) => {
//   try {
//     const { email, filterCriteria } = req.body;
//     let filter = {};
//     if (filterCriteria.category) {
//       filter.category = filterCriteria.category;
//     }
//     if (filterCriteria.startDate && filterCriteria.endDate) {
//       filter.timestamp = {
//         $gte: new Date(filterCriteria.startDate),
//         $lt: new Date(filterCriteria.endDate)
//       };
//     }
//     const products = await Products.find({ email, ...filter });
//     const totalAmount = products.reduce((acc, product) => acc + product.productAmount, 0);
//     res.status(200).json({ products, totalAmount });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//     console.error("Error filtering products:", error);
//   }
// });


app.post("/filterProducts", async (req, res) => {
  try {
    const { email, filterCriteria } = req.body;
    let filter = {};
    
    // Extract month from the filterCriteria
    let month;
    if (typeof filterCriteria === 'string') {
      // Assuming filterCriteria is a string containing the month name
      const monthName = filterCriteria.toLowerCase();
      month = new Date(Date.parse(`${monthName} 1, 2024`)).getMonth() + 1;
    } else {
      // Assuming filterCriteria is already in a format like '2024-05'
      month = parseInt(filterCriteria.split('-')[1]);
    }
    
    if (!isNaN(month)) {
      // Construct the filter based on the month
      filter.timestamp = {
        $gte: new Date(`2024-${month}-01`),
        $lt: new Date(`2024-${month + 1}-01`)
      };
    }
    
    const products = await Products.find({ email, ...filter });
    const totalAmount = products.reduce((acc, product) => acc + product.productAmount, 0);
    res.status(200).json({ products, totalAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error("Error filtering products:", error);
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "./frontend/build")));

// Handle routes for SPA
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./frontend/build/index.html"), (err) => {
        if (err) {
            console.error('Error sending index.html:', err);
            res.status(500).send(err);
        }
    });
});




// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
