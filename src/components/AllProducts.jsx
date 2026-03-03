import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import ModifyProduct from './ModifyProduct';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const formatImageUrl = (path) => {
  if (!path) return null;
  const isLocal = window.location.hostname === 'localhost';
  const base = isLocal ? 'http://localhost:2025' : 'https://esseket.duckdns.org';
  const fileName = path.split('/').pop().split('\\').pop();
  return `${base}/uploads/${fileName}`;
};

const getImageByColor = (product, color) => {
  if (!product?.images?.length) return '';
  const match = product.images.find(img => img.color?.toLowerCase() === color?.toLowerCase());
  if (match?.urls?.[0]) return formatImageUrl(match.urls[0]);
  const fallback = product.images.find(img => img.urls?.[0]);
  return fallback?.urls?.[0] ? formatImageUrl(fallback.urls[0]) : '';
};

const getSecondImageByColor = (product, color) => {
  if (!product?.images?.length) return '';
  const match = product.images.find(img => img.color?.toLowerCase() === color?.toLowerCase());
  return match?.urls?.[1] ? formatImageUrl(match.urls[1]) : '';
};

const AllProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [Categorys, setCategorys] = useState([]);
  const [SubCategorys, setSubCategorys] = useState([]);
  const [filteredSubCategorys, setFilteredSubCategorys] = useState([]);
  const [Products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  const [modify, setModify] = useState(false);
  const [IdProduct, setIdProduct] = useState(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);

  const getCategory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-category`, { withCredentials: true });
      // ✅ Handle { success, data: [...] } shape
      const data = res.data.data || res.data;
      setCategorys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[getCategory]", error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories.', { id: 'allproducts-fetch-categories-error' });
    }
  }, []);

  const getSubCategory = useCallback(async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Subcategory/${id}`, { withCredentials: true });
      // ✅ Handle { success, data: [...] } shape
      const data = res.data.data || res.data;
      setSubCategorys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[getSubCategory]", error);
      toast.error(error.response?.data?.message || 'Failed to fetch subcategories.', { id: 'allproducts-fetch-subcategories-error' });
    }
  }, []);

  const getProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-products`, { withCredentials: true });
      // ✅ Handle { success, data: [...] } shape
      const data = res.data.data || res.data;
      const list = Array.isArray(data) ? data : [];

      setProducts(list);
      setFilteredProducts(list);

      const initialColors = {};
      list.forEach(product => {
        initialColors[product._id] = Array.isArray(product.color) ? product.color[0] : '';
      });
      setSelectedColors(initialColors);
    } catch (error) {
      console.error("[getProducts]", error);
      toast.error(error.response?.data?.message || 'Failed to fetch products.', { id: 'allproducts-fetch-products-error' });
    }
  }, []);

  useEffect(() => {
    getCategory();
    getProducts();
  }, [modify]);

  useEffect(() => {
    if (SubCategorys.length > 0) {
      setFilteredSubCategorys(selectedGenre ? SubCategorys.filter(sub => sub.genre === selectedGenre) : SubCategorys);
    }
  }, [SubCategorys, selectedGenre]);

  useEffect(() => {
    let filtered = Products;
    if (selectedCategory) filtered = filtered.filter(p => p.categoryId === selectedCategory);
    if (selectedSubCategory) filtered = filtered.filter(p => p.subcategoryId === selectedSubCategory);
    if (selectedGenre) filtered = filtered.filter(p => p.genre === selectedGenre);
    if (searchQuery.trim()) filtered = filtered.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredProducts(filtered);
  }, [Products, selectedCategory, selectedSubCategory, selectedGenre, searchQuery]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubCategory('');
    if (e.target.value) getSubCategory(e.target.value);
    else setSubCategorys([]);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setSelectedSubCategory('');
  };

  return (
    <div className='AllProduct'>
      <div className="HeaderMangment" style={{ flexDirection: 'column' }}>
        <h2>Products Management</h2><br />
        <p style={{ color: 'gray', fontWeight: '300', fontSize: '14px' }}>{filteredProducts.length} products found</p>
      </div>

      <div className='FilterDiv'>
        <div className='SearchPrd'>
          <Search />
          <input type="text" placeholder='Search By Name' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <span className='SpanFilter'><SlidersHorizontal size={17} /> Filter</span>
        <div className='Sub-Category'>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            <option value="">All Categories</option>
            {Categorys.map(category => <option key={category._id} value={category._id}>{category.name}</option>)}
          </select>
          <select value={selectedGenre} onChange={handleGenreChange}>
            <option value="">All Genres</option>
            <option value="women">Femme</option>
            <option value="men">Homme</option>
          </select>
          <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} disabled={!selectedCategory}>
            <option value="">All SubCategories</option>
            {filteredSubCategorys.map(subcategory => <option key={subcategory._id} value={subcategory._id}>{subcategory.name}</option>)}
          </select>
        </div>
      </div>

      {modify && (
        <div className='MProductblur'>
          <div className='MProduct'>
            <ModifyProduct setModify={setModify} id={IdProduct} />
          </div>
        </div>
      )}

      <div className='CardsProducts'>
        {filteredProducts.map(product => {
          const color = selectedColors[product._id];
          const mainImg = getImageByColor(product, color);
          const secondImg = getSecondImageByColor(product, color);
          const isHovered = hoveredProductId === product._id;
          return (
            <div
              key={product._id}
              className="product"
              onClick={() => { setModify(true); setIdProduct(product._id); }}
              onMouseEnter={() => setHoveredProductId(product._id)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              <div style={{ overflow: 'hidden', position: 'relative', height: '80%' }}>
                <img src={isHovered && secondImg ? secondImg : mainImg} alt={product.name} />
              </div>
              <p>{product.name}</p>
              <h3 style={{ color: 'white' }}>{product.price} TND</h3>
              <div className='Colors'>
                {(Array.isArray(product.color) ? product.color : []).map((c, index) => {
                  const imgUrl = getImageByColor(product, c);
                  const safeImgUrl = imgUrl ? imgUrl.replace(/\\/g, '/') : undefined;
                  return (
                    <div
                      key={index}
                      className='color'
                      onClick={e => { e.stopPropagation(); setSelectedColors(prev => ({ ...prev, [product._id]: c })); }}
                      style={{ width: '24px', height: '24px', margin: '5px', borderRadius: '50%', cursor: 'pointer', border: '1px solid black', backgroundColor: c, backgroundImage: safeImgUrl ? `url(${safeImgUrl})` : undefined, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', boxShadow: '0 0 0 2px #fff inset' }}
                      title={c}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllProducts;