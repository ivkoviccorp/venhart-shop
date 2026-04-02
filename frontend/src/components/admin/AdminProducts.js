import React, { useEffect, useState } from 'react';
import { productsAPI } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiFilter } from 'react-icons/fi';
import ProductForm from './ProductForm';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'Muška odela',
    'Muški sakoi',
    'Muški džemperi',
    'Muške košulje i natkošulje',
    'Muške farmerke',
    'Muške pantalone',
    'Muške majice',
    'Ženska odela',
    'Ženski sakoi',
    'Ženski kompleti',
    'Ženski triko komplet',
    'Haljine',
    'Bluze',
    'Suknje',
    'Ženske pantalone',
    'Jakne i kaputi',
    'Muške kravate i aksesoari',
    'Čarape',
    'Cipele',
    'Torbe',
    'Ostalo'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllAdmin();
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Greška pri učitavanju proizvoda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
      return;
    }

    try {
      await productsAPI.delete(id);
      toast.success('Proizvod obrisan!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Greška pri brisanju proizvoda');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const toggleActive = async (product) => {
    try {
      const formData = new FormData();
      formData.append('active', !product.active);
      
      await productsAPI.update(product._id, formData);
      toast.success(`Proizvod ${!product.active ? 'aktiviran' : 'deaktiviran'}!`);
      fetchProducts();
    } catch (error) {
      console.error('Error toggling product:', error);
      toast.error('Greška pri ažuriranju proizvoda');
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1 className="admin-page-title">Proizvodi ({filteredProducts.length})</h1>
        <button 
          className="btn btn-add-product" 
          onClick={() => setShowForm(true)}
        >
          <FiPlus /> Dodaj proizvod
        </button>
      </div>

      <div className="admin-products-filter">
        <div className="filter-group">
          <FiFilter className="filter-icon" />
          <label htmlFor="categoryFilter">Filtriraj po kategoriji:</label>
          <select 
            id="categoryFilter"
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="all">Sve kategorije ({products.length})</option>
            {categories.map((cat) => {
              const count = products.filter(p => p.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
        </div>
        
        {selectedCategory !== 'all' && (
          <button 
            className="btn btn-clear-filter"
            onClick={() => setSelectedCategory('all')}
          >
            ✕ Poništi filter
          </button>
        )}
      </div>

      {showForm && (
        <ProductForm 
          product={editingProduct} 
          onClose={handleFormClose} 
        />
      )}

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Slika</th>
              <th>Naziv</th>
              <th>Kategorija</th>
              <th>Cena</th>
              <th>Status</th>
              <th>Oznake</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className={!product.active ? 'inactive' : ''}>
                <td>
                  <img 
                    src={product.images[0]?.url || '/placeholder.jpg'} 
                    alt={product.name}
                    className="product-thumbnail"
                  />
                </td>
                <td>
                  <strong>{product.name}</strong>
                </td>
                <td>{product.category}</td>
                <td>
                  <div className="product-pricing">
                    {product.oldPrice && (
                      <span className="old-price">{formatPrice(product.oldPrice)}</span>
                    )}
                    <span className="price">{formatPrice(product.price)}</span>
                  </div>
                </td>
                <td>
                  <button
                    className={`status-toggle ${product.active ? 'active' : 'inactive'}`}
                    onClick={() => toggleActive(product)}
                  >
                    {product.active ? (
                      <><FiEye /> Aktivan</>
                    ) : (
                      <><FiEyeOff /> Neaktivan</>
                    )}
                  </button>
                </td>
                <td>
                  <div className="product-badges">
                    {product.featured && <span className="badge featured">Featured</span>}
                    {product.isNew && <span className="badge new">New</span>}
                    {product.onSale && <span className="badge sale">Sale</span>}
                  </div>
                </td>
                <td>
                  <div className="product-actions">
                    <button 
                      className="action-btn edit"
                      onClick={() => handleEdit(product)}
                      title="Izmeni"
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(product._id)}
                      title="Obriši"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>
              {selectedCategory === 'all' 
                ? 'Nema proizvoda. Dodajte prvi proizvod!' 
                : `Nema proizvoda u kategoriji "${selectedCategory}".`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;