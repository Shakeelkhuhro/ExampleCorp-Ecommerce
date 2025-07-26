import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faTruck, faShieldAlt, faHeadset } from '@fortawesome/free-solid-svg-icons';
import './HomePage.css';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
        // Add some dummy data for demo purposes
        setProducts([
          { _id: '1', name: 'Premium Headphones', price: 199.99, rating: 4, reviews: 156 },
          { _id: '2', name: 'Wireless Mouse', price: 49.99, rating: 5, reviews: 89 },
          { _id: '3', name: 'Mechanical Keyboard', price: 129.99, rating: 4, reviews: 234 },
          { _id: '4', name: 'Smartphone Stand', price: 24.99, rating: 4, reviews: 67 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to ExampleCorp</h1>
          <p>Discover amazing products with unbeatable quality and prices</p>
          <button className="cta-button">Shop Now</button>
        </div>
        <div className="hero-image">
          <img src="https://via.placeholder.com/600x400?text=Hero+Image" alt="Hero" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <FontAwesomeIcon icon={faTruck} className="feature-icon" />
              <h3>Free Shipping</h3>
              <p>Free shipping on orders over $50</p>
            </div>
            <div className="feature-item">
              <FontAwesomeIcon icon={faShieldAlt} className="feature-icon" />
              <h3>Secure Payment</h3>
              <p>100% secure payment processing</p>
            </div>
            <div className="feature-item">
              <FontAwesomeIcon icon={faHeadset} className="feature-icon" />
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support</p>
            </div>
            <div className="feature-item">
              <FontAwesomeIcon icon={faShoppingBag} className="feature-icon" />
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : error && products.length === 0 ? (
            <div className="error">{error}</div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 8).map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for the latest products and offers</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
