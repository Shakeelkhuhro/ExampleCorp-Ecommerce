import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        // Add some dummy data for demo purposes
        const dummyProducts = [
          { _id: '1', name: 'Premium Headphones', price: 199.99, rating: 4, reviews: 156, category: 'Electronics' },
          { _id: '2', name: 'Wireless Mouse', price: 49.99, rating: 5, reviews: 89, category: 'Electronics' },
          { _id: '3', name: 'Mechanical Keyboard', price: 129.99, rating: 4, reviews: 234, category: 'Electronics' },
          { _id: '4', name: 'Smartphone Stand', price: 24.99, rating: 4, reviews: 67, category: 'Accessories' },
          { _id: '5', name: 'USB-C Cable', price: 19.99, rating: 5, reviews: 123, category: 'Accessories' },
          { _id: '6', name: 'Portable Charger', price: 39.99, rating: 4, reviews: 89, category: 'Electronics' },
          { _id: '7', name: 'Bluetooth Speaker', price: 79.99, rating: 5, reviews: 156, category: 'Electronics' },
          { _id: '8', name: 'Phone Case', price: 14.99, rating: 4, reviews: 78, category: 'Accessories' },
        ];
        setProducts(dummyProducts);
        setFilteredProducts(dummyProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Discover our wide range of quality products</p>
        </div>

        <div className="products-controls">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="sort-dropdown">
            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
            <select value={sortBy} onChange={handleSortChange}>
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="products-content">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              {searchTerm ? 
                `No products found matching "${searchTerm}"` : 
                'No products available'
              }
            </div>
          ) : (
            <>
              <div className="products-count">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </div>
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
