import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHeart } from '@fortawesome/free-solid-svg-icons';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const handleAddToCart = () => {
    // Add to cart functionality
    console.log('Added to cart:', product);
  };

  const handleAddToWishlist = () => {
    // Add to wishlist functionality
    console.log('Added to wishlist:', product);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <img 
          src={product.image || 'https://via.placeholder.com/300x200?text=Product+Image'} 
          alt={product.name}
        />
        <div className="product-overlay">
          <button className="overlay-btn" onClick={handleAddToWishlist}>
            <FontAwesomeIcon icon={faHeart} />
          </button>
          <button className="overlay-btn" onClick={handleAddToCart}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </button>
        </div>
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">
          {product.description || 'High-quality product with excellent features and design.'}
        </p>
        <div className="product-price">
          <span className="current-price">${product.price}</span>
          {product.originalPrice && (
            <span className="original-price">${product.originalPrice}</span>
          )}
        </div>
        
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`star ${i < (product.rating || 4) ? 'filled' : ''}`}>
                ★
              </span>
            ))}
          </div>
          <span className="rating-count">({product.reviews || 0} reviews)</span>
        </div>
        
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
