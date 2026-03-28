import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { FiSearch } from 'react-icons/fi';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sort: 'newest',
  });

  const categories = [
    'Muška odela',
    'Muški sakoi',
    'Muške košulje i natkošulje',
    'Muške farmerke',
    'Muške pantalone',
    'Ženska odela',
    'Ženski kompleti',
    'Kravate',
    'Carape',
    'Haljine',
    'Bluze',
    'Suknje',
    'Ženske pantalone',
    'Jakne i kaputi',
    'Aksesoari',
    'Cipele',
    'Torbe',
    'Ostalo'
  ];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getAll(filters);
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const showSuitPromo =
    filters.category === 'Muška odela' ||
    products.some((product) => product.category === 'Muška odela');

  return (
    <div className="shop">
      <div className="container">
        <h1 className="page-title">Shop</h1>

        {/* Filters */}
        <div className="filters">
          {/* Search */}
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Pretraži proizvode..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Sve kategorije</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="filter-select"
          >
            <option value="newest">Najnovije</option>
            <option value="price_asc">Cena: Rastuće</option>
            <option value="price_desc">Cena: Opadajuće</option>
            <option value="name">Ime: A-Z</option>
          </select>
        </div>

        {/* PROMO BANNER ZA MUŠKA ODELA */}
        {showSuitPromo && (
          <div className="shop-promo-banner">
            <div className="promo-badge">SPECIJALNA PONUDA</div>
            <h2>UZ SVAKO MUŠKO ODELO — KRAVATA 20% JEFTINIJE! 🎉</h2>
            <p>
              Iskoristite ekskluzivnu pogodnost i upotpunite elegantan izgled uz kravatu
              po specijalnoj ceni. Savršena kombinacija za poslovne i svečane prilike.
            </p>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="loading">Učitavanje proizvoda...</div>
        ) : (
          <>
            <div className="products-count">
              Pronađeno: {products.length} proizvoda
            </div>

            <div className="products-grid">
              {products.map((product) => (
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
                    <p className="product-category">{product.category}</p>
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

            {products.length === 0 && (
              <div className="no-products">
                <p>Nema proizvoda koji odgovaraju vašoj pretrazi.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;