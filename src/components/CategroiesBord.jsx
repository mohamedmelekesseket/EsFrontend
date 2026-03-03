import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from 'react-spinners';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CategroiesBord = () => {
  const [images, setImages] = useState([]);
  const [name, setName] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [categoryId, setIdCategory] = useState('');
  const [Categorys, setCategorys] = useState([]);
  const [SubCategorys, setSubCategorys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, SetShowModal] = useState(false);
  const [showSub, SetShowSub] = useState(false);
  const [genre, setGenre] = useState('men');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => { getCategory(); }, []);

  const handleImageChange = (e) => setImages(Array.from(e.target.files));

  const getCategory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-category`, { withCredentials: true });
      // ✅ Handle { success, data: [...] } shape
      const data = res.data.data || res.data;
      setCategorys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[getCategory]", error);
      toast.error(error.response?.data?.message || 'Failed to fetch categories.', { id: 'categories-fetch-error' });
    } finally {
      setLoading(false);
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
      toast.error(error.response?.data?.message || 'Failed to fetch subcategories.', { id: 'subcategories-fetch-error' });
    }
  }, []);

  const AddCategory = async () => {
    if (isAddingCategory) return;
    if (!name.trim()) return toast.error('Category name is required.', { id: 'categories-name-required' });

    setIsAddingCategory(true);
    const formData = new FormData();
    formData.append('name', name);
    images.forEach(image => formData.append('images', image));

    try {
      const res = await axios.post(`${API_BASE_URL}/Admin/Add-Category`, formData, { withCredentials: true });
      if (res.status === 200 || res.status === 201) {
        toast.success('Category created successfully.', { id: 'categories-create-success' });
        SetShowModal(false);
        setImages([]);
        setName('');
        getCategory();
      }
    } catch (error) {
      console.error("[AddCategory]", error);
      toast.error(error.response?.data?.message || 'Failed to create category.', { id: 'categories-create-error' });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const AddSubCategory = async () => {
    if (isAddingSubCategory) return;
    if (!subCategoryName.trim() || !genre) return toast.error('Subcategory name and genre are required.', { id: 'categories-subname-required' });

    setIsAddingSubCategory(true);
    const formData = new FormData();
    formData.append('name', subCategoryName);
    formData.append('genre', genre);
    formData.append('categoryId', categoryId);
    images.forEach(image => formData.append('images', image));

    try {
      const res = await axios.post(`${API_BASE_URL}/Admin/Add-CategorySub`, formData, { withCredentials: true });
      if (res.status === 201) {
        toast.success('Subcategory created successfully.', { id: 'categories-subcreate-success' });
        setImages([]);
        setSubCategoryName('');
        getSubCategory(categoryId);
      }
    } catch (error) {
      console.error("[AddSubCategory]", error);
      toast.error(error.response?.data?.message || 'Failed to create subcategory.', { id: 'categories-create-error' });
    } finally {
      setIsAddingSubCategory(false);
    }
  };

  const deleteUser = (id) => {
    toast(t => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Are you sure you want to delete this subcategory?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => confirmDelete(id, t.id)} style={{ background: 'red', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Yes</button>
          <button onClick={() => toast.dismiss(t.id)} style={{ background: 'gray', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>No</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const confirmDelete = async (id, toastId) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/Admin/Delete-SubCategory/${id}`, { withCredentials: true });
      if (res.status === 200) {
        toast.dismiss(toastId);
        toast.success('Subcategory deleted successfully.', { id: 'categories-subdelete-success' });
        getSubCategory(categoryId);
      }
    } catch (error) {
      console.error("[confirmDelete]", error);
      toast.error(error.response?.data?.message || 'Failed to delete subcategory.', { id: 'categories-subdelete-error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteCategory = (id) => {
    if (!id) return toast.error('Invalid category ID.', { id: 'categories-invalid-id' });
    toast(t => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p>Are you sure you want to delete this category?</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button onClick={() => confirmDeleteCategory(id, t.id)} style={{ background: 'red', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Yes</button>
          <button onClick={() => toast.dismiss(t.id)} style={{ background: 'gray', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>No</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const confirmDeleteCategory = async (id, toastId) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/Admin/Delete-category/${id}`, { withCredentials: true });
      if (res.status === 200) {
        toast.dismiss(toastId);
        toast.success('Category deleted successfully.', { id: 'categories-delete-success' });
        getCategory();
      }
    } catch (error) {
      console.error("[confirmDeleteCategory]", error);
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || 'Failed to delete category.', { id: 'categories-delete-error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='CategroiesDashBord'>
      {showSub && (
        <div className="SubModal-Container">
          <div className='SubModal'>
            <div className="modal-header">
              <h2>Subcategories</h2>
              <span className="close-x" onClick={() => SetShowSub(false)}>×</span>
            </div>
            <select className='SubMSelecte' value={genre} onChange={e => setGenre(e.target.value)}>
              <option value="">Select genre</option>
              <option value="men">men</option>
              <option value="women">women</option>
            </select>
            <div className='ListSub'>
              {SubCategorys.filter(sub => sub.genre === genre).map(sub => (
                <div className="sub-item-row" key={sub._id}>
                  <span>{sub.name}</span>
                  <Trash2 size={16} className="red-trash" onClick={() => deleteUser(sub._id)} />
                </div>
              ))}
            </div>
            <hr className="modal-divider" />
            <div className='AddSub-Section'>
              <h3>Add New SubCategory</h3>
              <input type="text" value={subCategoryName} onChange={e => setSubCategoryName(e.target.value)} placeholder='SubCategory Name' />
              {genre && <p className="status-text">This subcategory will be added to: <strong>{genre}</strong></p>}
            </div>
            <div className="modal-footer">
              <button className='btn-cancel' onClick={() => { SetShowSub(false); setGenre(''); }}>Cancel</button>
              <button className='btn-add' onClick={AddSubCategory} disabled={isAddingSubCategory}>{isAddingSubCategory ? 'Adding...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button className="close-btn" onClick={() => SetShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} className="modal-input" onKeyDown={e => e.key === 'Enter' && AddCategory()} />
            </div>
            <div className="modal-footer-actions">
              <button className="btn-cancel-light" onClick={() => SetShowModal(false)}>Cancel</button>
              <button className="btn-add-primary" onClick={AddCategory} disabled={isAddingCategory}>{isAddingCategory ? 'Adding...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="HeaderMangment">
        <h2>Categories Management Dashboard</h2>
        <button className='ADDCatg' onClick={() => SetShowModal(true)}>Add Category</button>
      </div>

      {loading ? (
        <ScaleLoader style={{ position: 'absolute', top: '50%', marginLeft: '40%' }} color="white" />
      ) : (
        <div className='div-categories'>
          {Categorys.map(category => (
            <div key={category._id} className='categorie'>
              <div className="corner-accent" />
              <div className="card-header">
                <h3 style={{ margin: '0', textAlign: 'start' }}>{category.name}</h3>
                <span className="sub-count">2 subcategories</span>
              </div>
              <div className='card-footer'>
                <button className='viewSub' onClick={() => { getSubCategory(category._id); SetShowSub(true); setIdCategory(category._id); setName(category.name); }}>
                  View Subcategories
                </button>
                <Trash2 className="delete-icon" onClick={() => deleteCategory(category._id)} size={18} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategroiesBord;