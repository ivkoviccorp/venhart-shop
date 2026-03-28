import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import './ProductForm.css';

const ProductForm = ({ product, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    category: 'Muška odela',
    gender: 'Muški',
    featured: false,
    isNew: true,
    onSale: false,
  });

  const [sizes, setSizes] = useState([
    { size: 'M', inStock: true },
    { size: 'L', inStock: true },
    { size: 'XL', inStock: true },
  ]);

  const [colors, setColors] = useState([]);
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const categories = [
    'Muška odela',
    'Muški sakoi',
    'Muške košulje i natkošulje',
    'Muške farmerke',
    'Muške pantalone',
    'Ženska odela',
    'Ženski kompleti',
    'Haljine',
    'Bluze',
    'Suknje',
    'Ženske pantalone',
    'Jakne i kaputi',
    'Kravate',
    'Čarape',
    'Aksesoari',
    'Cipele',
    'Torbe',
    'Ostalo'
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', 'One Size'];
  const numericSizes = ['30', '31', '32', '33', '34', '36', '38', '39', '40', '41', '42', '43', '44', '45', '46', '48', '50', '52', '54', '56'];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        oldPrice: product.oldPrice || '',
        category: product.category,
        gender: product.gender || 'Unisex',
        featured: product.featured,
        isNew: product.isNew,
        onSale: product.onSale,
      });
      setSizes(product.sizes || []);
      setColors(product.colors || []);
      setExistingImages(product.images || []);
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSizeToggle = (size) => {
    const exists = sizes.find(s => s.size === size);
    if (exists) {
      setSizes(sizes.filter(s => s.size !== size));
    } else {
      setSizes([...sizes, { size, inStock: true }]);
    }
  };

  const toggleSizeStock = (size) => {
    setSizes(sizes.map(s => 
      s.size === size ? { ...s, inStock: !s.inStock } : s
    ));
  };

  const addColor = () => {
    if (newColor.name) {
      setColors([...colors, newColor]);
      setNewColor({ name: '', hex: '#000000' });
    }
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (publicId, index) => {
    if (!window.confirm('Obrisati ovu sliku?')) return;

    try {
      await productsAPI.deleteImage(product._id, publicId);
      setExistingImages(existingImages.filter((_, i) => i !== index));
      toast.success('Slika obrisana');
    } catch (error) {
      toast.error('Greška pri brisanju slike');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      data.append('sizes', JSON.stringify(sizes));
      data.append('colors', JSON.stringify(colors));

      images.forEach((image) => {
        data.append('images', image);
      });

      if (product) {
        await productsAPI.update(product._id, data);
        toast.success('Proizvod ažuriran!');
      } else {
        await productsAPI.create(data);
        toast.success('Proizvod dodat!');
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Greška pri čuvanju proizvoda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form-overlay">
      <div className="product-form-container">
        <div className="product-form-header">
          <h2>{product ? 'Izmeni Proizvod' : 'Dodaj Proizvod'}</h2>
          <button className="close-btn" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3>Osnovne informacije</h3>

            <div className="form-group">
              <label>Naziv proizvoda *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="npr. Elegantno muško odelo"
                required
              />
            </div>

            <div className="form-group">
              <label>Opis</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Detaljan opis proizvoda..."
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cena (RSD) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="9990"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stara cena (opciono)</label>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleChange}
                  placeholder="12990"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kategorija *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pol</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Muški">Muški</option>
                  <option value="Ženski">Ženski</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div className="form-section">
            <h3>Veličine (slova)</h3>
            <div className="sizes-grid">
              {availableSizes.map((size) => {
                const sizeObj = sizes.find(s => s.size === size);
                const isSelected = !!sizeObj;
                
                return (
                  <div key={size} className="size-item">
                    <label className={`size-checkbox ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSizeToggle(size)}
                      />
                      <span>{size}</span>
                    </label>
                    {isSelected && (
                      <button
                        type="button"
                        className={`stock-toggle ${sizeObj.inStock ? 'in-stock' : 'out-of-stock'}`}
                        onClick={() => toggleSizeStock(size)}
                      >
                        {sizeObj.inStock ? 'Na stanju' : 'Nema'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 style={{ marginTop: '20px' }}>Veličine (brojevi)</h3>
            <div className="sizes-grid">
              {numericSizes.map((size) => {
                const sizeObj = sizes.find(s => s.size === size);
                const isSelected = !!sizeObj;
                
                return (
                  <div key={size} className="size-item">
                    <label className={`size-checkbox ${isSelected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSizeToggle(size)}
                      />
                      <span>{size}</span>
                    </label>
                    {isSelected && (
                      <button
                        type="button"
                        className={`stock-toggle ${sizeObj.inStock ? 'in-stock' : 'out-of-stock'}`}
                        onClick={() => toggleSizeStock(size)}
                      >
                        {sizeObj.inStock ? 'Na stanju' : 'Nema'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="form-section">
            <h3>Boje</h3>
            <div className="colors-list">
              {colors.map((color, index) => (
                <div key={index} className="color-item">
                  <div className="color-preview" style={{ backgroundColor: color.hex }}></div>
                  <span>{color.name}</span>
                  <button type="button" onClick={() => removeColor(index)}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-color">
              <input
                type="text"
                placeholder="Naziv boje (npr. Teget)"
                value={newColor.name}
                onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
              />
              <input
                type="color"
                value={newColor.hex}
                onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
              />
              <button type="button" onClick={addColor}>Dodaj</button>
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <h3>Slike proizvoda</h3>

            {existingImages.length > 0 && (
              <div className="existing-images">
                <p>Postojeće slike:</p>
                <div className="images-preview">
                  {existingImages.map((img, index) => (
                    <div key={index} className="image-preview">
                      <img src={img.url} alt={`Existing ${index}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeExistingImage(img.publicId, index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="new-images">
                <p>Nove slike:</p>
                <div className="images-preview">
                  {images.map((img, index) => (
                    <div key={index} className="image-preview">
                      <img src={URL.createObjectURL(img)} alt={`New ${index}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <label className="upload-btn">
              <FiUpload /> Dodaj slike
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </label>
          </div>

          {/* Options */}
          <div className="form-section">
            <h3>Opcije prikaza</h3>
            <div className="checkboxes">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span>⭐ Istaknut proizvod (prikaži na početnoj)</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                />
                <span>🆕 Novi proizvod</span>
              </label>

              <label>
                <input
                  type="checkbox"
                  name="onSale"
                  checked={formData.onSale}
                  onChange={handleChange}
                />
                <span>🏷️ Na sniženju</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Otkaži
            </button>
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? 'Čuvanje...' : (product ? 'Ažuriraj proizvod' : 'Dodaj proizvod')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;