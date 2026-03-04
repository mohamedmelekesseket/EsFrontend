import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ModifyProduct = ({ id, setModify }) => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [genre, setGenre] = useState('');
  const [stock, setStock] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [size, setSize] = useState([]);
  const [color, setColor] = useState([]);
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [colorImages, setColorImages] = useState({});
  const [existingColorImages, setExistingColorImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef(null);

  const getCategory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-category`, { withCredentials: true });
      // ✅ Handle { success, data: [...] } shape
      const data = res.data.data || res.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[getCategory]", error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories.', { id: 'modifyproduct-fetch-category-error' });
    }
  };

  const getSubCategory = async (catId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Subcategory/${catId}`, { withCredentials: true });
      // ✅ Handle { success, data: [...] } shape
      const data = res.data.data || res.data;
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[getSubCategory]", error);
      toast.error(error.response?.data?.message || 'Failed to fetch subcategories.', { id: 'modifyproduct-fetch-subcategory-error' });
    }
  };

  useEffect(() => {
    setFilteredSubcategories(subcategories.filter(sub => sub.genre === genre));
  }, [subcategoryId, genre, subcategories]);

  useEffect(() => {
    GetProduct();
    getCategory();
  }, []);

  const handleColorImageChange = (colorKey, e) => {
    const files = Array.from(e.target.files);
    setColorImages(prev => ({ ...prev, [colorKey]: [...(prev[colorKey] || []), ...files] }));
  };

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (trimmed && !size.includes(trimmed)) {
      setSize(prev => [...prev, trimmed]);
      setSizeInput('');
    }
  };

  const removeSize = (index) => setSize(prev => prev.filter((_, i) => i !== index));

  const addColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !color.includes(trimmed)) {
      setColor(prev => [...prev, trimmed]);
      setColorInput('');
      setColorImages(prev => ({ ...prev, [trimmed]: [] }));
    }
  };

  const removeColor = (index) => {
    const colorToRemove = color[index];
    setColor(prev => prev.filter((_, i) => i !== index));
    setColorImages(prev => { const n = { ...prev }; delete n[colorToRemove]; return n; });
    setExistingColorImages(prev => { const n = { ...prev }; delete n[colorToRemove]; return n; });
  };

  const removeColorImage = (colorKey, idx, isExisting) => {
    if (isExisting) {
      setExistingColorImages(prev => ({ ...prev, [colorKey]: prev[colorKey].filter((_, i) => i !== idx) }));
    } else {
      setColorImages(prev => ({ ...prev, [colorKey]: prev[colorKey].filter((_, i) => i !== idx) }));
    }
  };

  const GetProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-product/${id}`, { withCredentials: true });
      // ✅ Handle { success, data: {...} } shape
      const product = res.data.data || res.data;

      setName(product.name || '');
      setPrice(product.price || '');
      setCategoryId(product.categoryId || '');
      setSubcategoryId(product.subcategoryId || '');
      setGenre(product.genre || '');
      setStock(product.stock || 0);
      setIsFeatured(product.isFeatured || false);

      // ✅ Safely parse sizes
      if (Array.isArray(product.size)) {
        try {
          const raw = product.size[0];
          setSize(typeof raw === 'string' && raw.startsWith('[') ? JSON.parse(raw) : product.size);
        } catch {
          setSize(product.size);
        }
      } else {
        setSize([]);
      }

      setColor(Array.isArray(product.color) ? product.color : []);

      if (Array.isArray(product.images)) {
        const existingImages = {};
        product.images.forEach(img => {
          if (img.color && img.urls) existingImages[img.color] = img.urls;
        });
        setExistingColorImages(existingImages);
      }

      if (product.categoryId) getSubCategory(product.categoryId);

    } catch (err) {
      console.error('[GetProduct]', err);
      toast.error('Erreur lors du chargement du produit.', { id: "modifyproduct-load-error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!name || !price || !categoryId || !genre) {
      toast.error("Please fill in all required fields.", { id: "modifyproduct-required-fields" });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("categoryId", categoryId);
    formData.append("genre", genre);
    formData.append("stock", stock);
    formData.append("isFeatured", isFeatured);
    if (subcategoryId) formData.append("subcategoryId", subcategoryId);
    if (size.length) size.forEach(s => formData.append("size[]", s));
    if (color.length) color.forEach(c => formData.append("color[]", c));

    Object.entries(colorImages).forEach(([colorKey, files]) => {
      files.forEach(file => formData.append(`images[${colorKey}][]`, file));
    });

    color.forEach(colorKey => {
      const existingUrls = existingColorImages[colorKey] || [];
      if (existingUrls.length > 0) {
        formData.append(`existingImages[${colorKey}]`, JSON.stringify(existingUrls));
      }
    });

    try {
      const res = await axios.put(`${API_BASE_URL}/Admin/UpdateProduct/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 200) {
        toast.success("Product updated successfully.", { id: "modifyproduct-update-success" });
        setModify(false);
      }
    } catch (error) {
      console.error("[handleUpdate]", error);
      toast.error(error.response?.data?.message || 'Failed to update product.', { id: "modifyproduct-update-error" });
    } finally {
      setLoading(false);
    }
  };

  const DeleteProduct = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/Admin/Delete-Product/${id}`, { withCredentials: true });
      if (res.status === 200) {
        setModify(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('[DeleteProduct]', err);
      toast.error('Erreur lors de la suppression du produit.', { id: "modifyproduct-delete-error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const isLocal = window.location.hostname === 'localhost';
    const base = isLocal ? 'http://localhost:2025' : 'https://esseket.duckdns.org';
    const fileName = imagePath.split('/').pop().split('\\').pop();
    return `${base}/uploads/${fileName}`;
  };

  if (loading) {
    return (
      <div className='AddProduct'>
        <div style={{ textAlign: 'center', color: 'white', marginTop: '20px' }}>
          Chargement des données du produit...
        </div>
      </div>
    );
  }

  return (
    <div className='AddProduct'>
      <Toaster />
      <div className="imagesadd" style={{ display: "flex", flexWrap: "wrap", width: "50%", gap: "10px", marginTop: "10px" }}>
        {/* Existing Images */}
        {Object.entries(existingColorImages).map(([c, urls]) =>
          urls.map((url, idx) => (
            <div key={`existing-${c}-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <X style={{ color: "white", position: "relative", left: "40%", cursor: "pointer" }} onClick={() => removeColorImage(c, idx, true)} />
              <img
                src={formatImageUrl(url)}
                alt={`${c} ${idx}`}
                style={{ width: "160px", height: "190px", objectFit: "cover", borderRadius: "6px", border: `2px solid ${c}`, marginBottom: "4px" }}
              />
              <span style={{ fontSize: "10px", color: "white" }}>{c}</span>
            </div>
          ))
        )}
        {/* New Images */}
        {Object.entries(colorImages).map(([c, files]) =>
          files.map((file, idx) => (
            <div key={`new-${c}-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <X style={{ color: "white", position: "relative", left: "40%", cursor: "pointer" }} onClick={() => removeColorImage(c, idx, false)} />
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                style={{ width: "160px", height: "190px", objectFit: "cover", borderRadius: "6px", border: `2px solid ${c}`, marginBottom: "4px" }}
              />
              <span style={{ fontSize: "10px", color: "white" }}>{c}</span>
            </div>
          ))
        )}
      </div>

      <div className='AddDonner'>
        <X onClick={() => setModify(false)} style={{ position: "absolute", right: "10px", cursor: "pointer" }} />
        <h1>Modifier le produit</h1>

        <div style={{ display: "flex", marginBottom: "4%" }}>
          <div className='donner'>
            <p>Name *</p>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder='Name' />
          </div>
          <div className='donner'>
            <p>Price *</p>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder='Price' />
          </div>
        </div>

        <div style={{ display: "flex", marginBottom: "4%" }}>
          <div className='donner'>
            <p>Category *</p>
            <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategoryId(''); getSubCategory(e.target.value); }}>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>
          <div className='donner'>
            <p>Genre *</p>
            <select value={genre} onChange={e => { setGenre(e.target.value); setSubcategoryId(''); }}>
              <option value="">Genre</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", marginBottom: "4%" }}>
          <div className='donner'>
            <p>SubCategory</p>
            <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} disabled={!categoryId || !genre}>
              <option value="">Select SubCategory</option>
              {filteredSubcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
            </select>
          </div>
          <div className='donner'>
            <p>Stock</p>
            <input type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="Stock" />
          </div>
        </div>

        <div style={{ display: "flex", marginBottom: "4%" }}>
          <div className='donner'>
            <p>Sizes</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder='Add size (e.g., S, M, L)'
                value={sizeInput}
                onChange={e => setSizeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <button type="button" onClick={addSize} className='plus'><Plus /></button>
            </div>
            {size.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                {size.map((s, i) => (
                  <span key={i} style={{ background: "#e0e0e0", color: "black", padding: "2px 10px", borderRadius: "12px", fontSize: "12px" }}>
                    {s} <button type="button" onClick={() => removeSize(i)} style={{ border: "none", background: "none", cursor: "pointer" }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className='donner'>
            <p>Colors</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder='Add color (e.g., Black, Red)'
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
              />
              <button type="button" onClick={addColor} className='plus'><Plus /></button>
            </div>
            {color.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                {color.map((c, i) => (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ background: "#e0e0e0", color: "black", padding: "2px 10px", borderRadius: "12px", fontSize: "12px" }}>{c}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => handleColorImageChange(c, e)}
                      id={`file-${c}`}
                    />
                    <button type="button" className='BtAddImg' onClick={() => document.getElementById(`file-${c}`).click()} style={{ marginBottom: '10px' }}>
                      Choose Images
                    </button>
                    <button type="button" onClick={() => removeColor(i)} style={{ border: "none", background: "none", cursor: "pointer", color: "red" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", marginBottom: "4%" }}>
          <div className='donner' style={{ display: "flex" }}>
            <p>Featured Product</p>
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ marginTop: '10px' }} />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button
            style={{ padding: "10px 60px", borderRadius: "8px", border: "none", background: "#a50505ff", color: "white", marginRight: "3%", cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.7 : 1 }}
            onClick={DeleteProduct}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Deleting...
              </span>
            ) : 'Delete'}
          </button>
          <button
            type="submit"
            style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#4CAF50", color: "white", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Updating...
              </span>
            ) : 'Update Product'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyProduct;