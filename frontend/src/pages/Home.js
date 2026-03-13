import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await productsAPI.getAll({ featured: true, limit: 6 });
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>VENHART</h1>
          <p className="hero-subtitle">CONCEPT STORE</p>
          <p className="hero-description">Elegancija. Stil. Kvalitet.</p>
          <Link to="/shop" className="btn btn-hero">
            Pogledaj kolekciju
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Istaknuti Proizvodi</h2>
          
          {loading ? (
            <div className="loading">Učitavanje...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <Link 
                  to={`/product/${product._id}`} 
                  key={product._id} 
                  className="product-card"
                >
                  <div className="product-image">
                    <img 
                      src={product.images[0]?.url || '/placeholder.jpg'} 
                      alt={product.name} 
                    />
                    {product.onSale && <span className="badge sale">SALE</span>}
                    {product.isNew && <span className="badge new">NEW</span>}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <div className="product-price">
                      {product.oldPrice && (
                        <span className="old-price">{product.oldPrice.toLocaleString()} RSD</span>
                      )}
                      <span className="price">{product.price.toLocaleString()} RSD</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {featuredProducts.length === 0 && !loading && (
            <p className="no-products">Trenutno nema dostupnih proizvoda.</p>
          )}
        </div>
      </section>

      {/* About Preview */}
      <section className="about-preview">
        <div className="container">
          <div className="about-content">
            <h2>O Nama</h2>
            <p>
              Venhart Concept Store je moderan butik muške i ženske garderobe koji nudi pažljivo birane komade sa fokusom na kvalitet, eleganciju i savremen stil.
            </p>
            <Link to="/about" className="btn btn-outline">
              Saznaj više
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;