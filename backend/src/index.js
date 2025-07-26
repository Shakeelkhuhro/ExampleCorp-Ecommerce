require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is live!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Ensure the server is running and connected to the database
console.log('Server and database connection established successfully.');