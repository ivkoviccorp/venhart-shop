import React, { useEffect, useState } from 'react';
import { productsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import ProductForm from './ProductForm';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

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

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h1 className="admin-page-title">Proizvodi ({products.length})</h1>
        <button 
          className="btn btn-add-product" 
          onClick={() => setShowForm(true)}
        >
          <FiPlus /> Dodaj proizvod
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm 
          product={editingProduct} 
          onClose={handleFormClose} 
        />
      )}

      {/* Products Table */}
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
            {products.map((product) => (
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
                      <span className="old-price">{product.oldPrice.toLocaleString()}</span>
                    )}
                    <span className="price">{product.price.toLocaleString()} RSD</span>
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

        {products.length === 0 && (
          <div className="no-products">
            <p>Nema proizvoda. Dodajte prvi proizvod!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;