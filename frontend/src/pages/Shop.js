import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import './Shop.css';

const Shop = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: categoryFromUrl,
    search: '',
    sort: 'newest',
  });

  const categoryCards = [
    {
      title: 'Muške farmerke',
      value: 'Muške farmerke',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774377063/venhart-shop/nidachoiukzlnhvewiv6.jpg'
    },
    {
      title: 'Muška odela',
      value: 'Muška odela',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774376054/venhart-shop/kukeneqoxtikvmnkkg5q.webp'
    },
    {
      title: 'Ženske haljine i kompleti',
      value: 'Haljine',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774469591/venhart-shop/go7hpljtjnkxh53rjq8o.webp'
    },
    {
      title: 'Muški sakoi',
      value: 'Muški sakoi',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774731575/venhart-shop/sxa0knrny8zer9vxcqzq.webp'
    },
    {
      title: 'Muške košulje i natkošulje',
      value: 'Muške košulje i natkošulje',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774731962/venhart-shop/g07vkjvmghyaltjjzusi.webp'
    },
    {
      title: 'Ženska odela',
      value: 'Ženska odela',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774732113/venhart-shop/wurngrwyckcxrk3jwdra.webp'
    },
    {
      title: 'Muški džemperi',
      value: 'Muški džemperi',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774733423/venhart-shop/ma8wdz0hvi5jnjfgcxwx.webp'
    },
    {
      title: 'Ženski triko kompleti',
      value: 'Ženski triko komplet',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774733759/venhart-shop/muoyh2ivw25sum1xihwc.webp'
    },
    {
      title: 'Ženski sakoi',
      value: 'Ženski sakoi',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774733882/venhart-shop/xevqjnnwvuhjjqrkgnza.jpg'
    },
    {
      title: 'Muške kravate i aksesoari',
      value: 'Muške kravate i aksesoari',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774734343/venhart-shop/ndjujdf8oe9xplipywnq.webp'
    },
    {
      title: 'Muške majice',
      value: 'Muške majice',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774734460/venhart-shop/swxkhappel1anocyrxki.webp'
    },
    {
      title: 'Ženske pantalone',
      value: 'Ženske pantalone',
      image: 'https://res.cloudinary.com/ddpyveu6d/image/upload/v1774904028/venhart-shop/dlu5ogf02asslywv4kee.webp'
    }
  ];

  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    setFilters((prev) => ({
      ...prev,
      category: categoryParam
    }));
  }, [searchParams]);

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

        {/* Category Cards */}
        <section className="shop-categories-section">
          <div className="category-grid">
            {categoryCards.map((category) => (
              <button
                key={category.value}
                className={`category-card shop-category-card ${filters.category === category.value ? 'active' : ''}`}
                onClick={() => handleFilterChange('category', category.value)}
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45)), url(${category.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="category-card-overlay">
                  <h3>{category.title}</h3>
                  <span>
                    Pogledaj ponudu <FiArrowRight />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Filters */}
        <div className="filters">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Pretraži proizvode..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">Sve kategorije</option>
            {categoryCards.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.title}</option>
            ))}
          </select>

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

        {loading ? (
          <div className="loading">Učitavanje proizvoda...</div>
        ) : (
          <>
            <div className="products-count">
              {filters.category ? `Kategorija: ${filters.category} • ` : ''}
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