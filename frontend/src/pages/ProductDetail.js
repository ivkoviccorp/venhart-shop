import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { FiTag } from 'react-icons/fi';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsAPI.getById(id);
      setProduct(response.data.product);
      
      // Auto-select first available size and color
      if (response.data.product.sizes?.length > 0) {
        setSelectedSize(response.data.product.sizes[0].size);
      }
      if (response.data.product.colors?.length > 0) {
        setSelectedColor(response.data.product.colors[0].name);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Greška pri učitavanju proizvoda');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.warning('Molimo izaberite veličinu');
      return;
    }

    addToCart(product, selectedSize, selectedColor, quantity);
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  if (!product) {
    return <div className="loading">Proizvod nije pronađen</div>;
  }

  const showTiePromo = product.category === 'Muška odela';

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image">
              <img
                src={product.images[selectedImage]?.url || '/placeholder.jpg'}
                alt={product.name}
              />
              {product.onSale && <span className="badge sale">SALE</span>}
              {product.isNew && <span className="badge new">NEW</span>}
            </div>

            {product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.url}
                    alt={`${product.name} ${index + 1}`}
                    className={selectedImage === index ? 'active' : ''}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-details">
            <p className="product-category">{product.category}</p>
            <h1>{product.name}</h1>

            <div className="product-price-section">
              {product.oldPrice && (
                <span className="old-price">{product.oldPrice.toLocaleString()} RSD</span>
              )}
              <span className="price">{product.price.toLocaleString()} RSD</span>
            </div>

            {/* PROMO BANNER ZA MUŠKA ODELA */}
            {showTiePromo && (
              <div className="product-promo-banner">
                <div className="promo-icon">
                  <FiTag />
                </div>
                <div className="promo-text">
                  <strong>Kravata 20% jeftinije uz kupovinu muškog odela</strong>
                  <p>Iskoristite specijalnu ponudu i upotpunite elegantan izgled po povoljnijoj ceni.</p>
                </div>
              </div>
            )}

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="product-options">
                <label>Veličina:</label>
                <div className="size-options">
                  {product.sizes.map((sizeObj) => (
                    <button
                      key={sizeObj.size}
                      className={`size-btn ${selectedSize === sizeObj.size ? 'active' : ''} ${!sizeObj.inStock ? 'disabled' : ''}`}
                      onClick={() => sizeObj.inStock && setSelectedSize(sizeObj.size)}
                      disabled={!sizeObj.inStock}
                    >
                      {sizeObj.size}
                      {!sizeObj.inStock && <span className="out-of-stock">Nema na stanju</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="product-options">
                <label>Boja:</label>
                <div className="color-options">
                  {product.colors.map((colorObj) => (
                    <button
                      key={colorObj.name}
                      className={`color-btn ${selectedColor === colorObj.name ? 'active' : ''}`}
                      onClick={() => setSelectedColor(colorObj.name)}
                      title={colorObj.name}
                    >
                      {colorObj.hex ? (
                        <span 
                          className="color-circle" 
                          style={{ backgroundColor: colorObj.hex }}
                        ></span>
                      ) : (
                        colorObj.name
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="product-options">
              <label>Količina:</label>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Add to Cart */}
            <button className="btn btn-add-to-cart" onClick={handleAddToCart}>
              Dodaj u korpu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;