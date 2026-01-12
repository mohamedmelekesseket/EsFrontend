import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Plus,X } from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddProduct = () => {
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

  const [colorImages, setColorImages] = useState({}); // { Red: [File, File], Blue: [File] }
  const [loading, setLoading] = useState(false);

  const fileInputRefs = useRef({});


  const user = JSON.parse(localStorage.getItem("user"));


  const getCategory = async () => {  
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-category`,{
        withCredentials: true
      });
      setCategories(res.data);     
      console.log(res.data);
       
      setLoading(false);
    } catch (error) {
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "addproduct-fetch-category-error" })
      }
      setLoading(false);
    }
  };

  const getSubCategory = async (id) => {  
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Subcategory/${id}`,{
        withCredentials: true
      });
      setSubcategories(res.data);      
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "addproduct-fetch-category-error" })
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    const filtered = subcategories.filter(sub => sub.genre === genre);
    setFilteredSubcategories(filtered);
  }, [subcategoryId, genre, subcategories]);

  useEffect(() => {
    getCategory();
  }, []);

  const handleColorImageChange = (colorKey, e) => {
    const files = Array.from(e.target.files);
    setColorImages(prev => ({
      ...prev,
      [colorKey]: [...(prev[colorKey] || []), ...files]
    }));

    setPreviews(prev => ({
      ...prev,
      [colorKey]: files.map(file => URL.createObjectURL(file))
    }));

  };

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (trimmed && !size.includes(trimmed)) {
      setSize([...size, trimmed]);
      setSizeInput('');
    }
  };

  const removeSize = (index) => {
    setSize(size.filter((_, i) => i !== index));
  };

  const addColor = () => {
    const trimmed = colorInput.trim();
    if (trimmed && !color.includes(trimmed)) {
      setColor([...color, trimmed]);
      setColorInput('');
      setColorImages(prev => ({ ...prev, [trimmed]: [] }));
    }
  };


const removeColorImage = (colorKey, idx) => {
  setColorImages(prev => ({
    ...prev,
    [colorKey]: prev[colorKey].filter((_, i) => i !== idx)
  }));
};


  const AddProduct = async (e) => {
    e.preventDefault();

    if (loading) return; // Prevent spam clicks

    if (!name || !price || !categoryId || !genre) {
      toast.error("Please fill in all required fields", { id: "addproduct-required-fields" });
      return;
    }

    for (const c of color) {
    if (!colorImages[c] || colorImages[c].length === 0) {
      toast.error(`Please upload images for color: ${c}`, { id: `addproduct-missing-images-${c}` });
      return;
    }
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
    if (size.length) formData.append("size", JSON.stringify(size));
    if (color.length) formData.append("color", JSON.stringify(color));
    
    // Append images per color
    Object.entries(colorImages).forEach(([colorKey, files]) => {
      files.forEach(file => {
        formData.append(`images[${colorKey}][]`, file);
      });
    });
    
    console.log("=== FRONTEND FORM DATA ===");
    console.log("name:", name);
    console.log("color:", color);
    console.log("price:", price);
    console.log("size:", size);
    console.log("images count:", Object.values(colorImages).flat().length);
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, ":", value);
    }
    
    try {
      const res= await axios.post(`${API_BASE_URL}/Admin/Add-Product`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.status === 200) {
        toast.success("Product created successfully", { id: "addproduct-success" });
      }

      // Reset
      setName('');
      setPrice('');
      setCategoryId('');
      setSubcategoryId('');
      setGenre('');
      setStock(0);
      setIsFeatured(false);
      setSize([]);
      setColor([]);
      setColorImages({});
      setSizeInput('');
      setColorInput('');
    } catch (error) {
      console.log("Frontend error:", error);
      console.log("Error response:", error.response?.data);
        toast.error(error.response?.data?.message || 'Server error', { id: "addproduct-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='AddProduct'>
      <Toaster />
      <div className="imagesadd" style={{ display: "flex", flexWrap: "wrap",width:"50%", gap: "10px", marginTop: "10px" }}>
        {Object.entries(colorImages).length === 0 || Object.values(colorImages).every(files => files.length === 0) ? (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center", 
            justifyContent: "center", 
            width: "100%", 
            marginTop:"30%",
            height: "300px",
            borderRadius: "15px",
            color: "white",
            gap: "15px"
          }}>
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "rgba(255, 255, 255, 0.6)"
            }}>
              📷
            </div>
            <div style={{
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.8)"
            }}>
              Aucune image pour le moment
            </div>
            <div style={{
              textAlign: "center",
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.5)",
              maxWidth: "250px",
              lineHeight: "1.4"
            }}>
              Ajoutez des couleurs et sélectionnez des images pour voir un aperçu ici
            </div>
          </div>
        ) : (
          Object.entries(colorImages).map(([color, files]) =>
            files.map((file, idx) => (
              <div key={color + idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <X onClick={() => removeColorImage(color, idx)} style={{color:"white",position:"relative",left:"40%"}}/>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{
                    width: "160px",
                    height: "190px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: `2px solid ${color}`,
                    marginBottom: "4px"
                  }}
                />
                <span style={{ fontSize: "10px", color:"white" }}>{color}</span>
              </div>
            ))
          )
        )}
      </div>
      <div className='AddDonner'>
        <h1>Add New Product</h1>
          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner'>
              <p>Name *</p>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
            </div>
            <div className='donner'>
              <p>Price *</p>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder='Price' />
            </div>
          </div>

          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner'>
              <p>Category *</p>
              <select value={categoryId} onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId('');
                getSubCategory(e.target.value);
              }}>
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className='donner'>
              <p>Genre *</p>
              <select value={genre} onChange={(e) => {
                setGenre(e.target.value);
                setSubcategoryId('');
              }}>
                <option value="">Genre</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner'>
              <p>SubCategory</p>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                disabled={!categoryId || !genre}
              >
                <option value="">Select SubCategory</option>
                {filteredSubcategories.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div className='donner'>
              <p>Stock</p>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" />
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
                  onChange={(e) => setSizeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
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
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                />
                <button type="button" onClick={addColor} className='plus'><Plus /></button>
              </div>
              {color.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                  {color.map((c, i) => (
                    <div key={c}>
                      <span>{c}</span>
                      <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={el => (fileInputRefs.current[c] = el)}
                      style={{ display: 'none' }}
                      onChange={e => handleColorImageChange(c, e)}
                    />

                    <button
                      type="button"
                      className="BtAddImg"
                      onClick={() => fileInputRefs.current[c]?.click()}
                    >
                      Choose Images
                    </button>
 
                    <button
                      type="button"
                      style={{cursor:"pointer"}}
                      onClick={() =>
                        setColorImages(prev => ({ ...prev, [c]: [] }))
                      }
                    >
                      X
                    </button>



                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", marginBottom: "4%" }}>
            <div className='donner' style={{display:"flex",}}>
              <p>Featured Product</p>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ marginTop: '10px' }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#4CAF50",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
              onClick={AddProduct}
              disabled={loading}
            >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block'
                }}></span>
                Creating...
              </span>
            ) : 'Create Product'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default AddProduct;
