import React, { useState, useEffect, useRef } from 'react';
import { Eye , SquareArrowRight,Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { ScaleLoader } from "react-spinners"; // Import ScaleLoader

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import axios from 'axios'
const CategroiesBord = () => {
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [categoryId,setIdCategory]=useState('')
  const [Categorys, setCategorys] = useState([]);
  const [SubCategorys, setSubCategorys] = useState([]);
  const [loading, setLoading] = useState(true); 
  const user=JSON.parse(localStorage.getItem("user"))
  const [showModal,SetShowModal]=useState(false)
  const [showModals,SetShowModals]=useState(false)
  const [showSub,SetShowSub]=useState(false)
  const fileInputRef = useRef(null); 
  const [genre, setGenre] = useState('men');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);



  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };
  const triggerFileSelect = () => {
    fileInputRef.current.click(); // 👈 Trigger file picker
  };
  const AddCategory = async()=>{
    if (isAddingCategory) return; // Prevent spam clicks
    if (!name) {
      toast.error("Category Name required", { id: "categories-name-required" })
      return
    }
    setIsAddingCategory(true);
    const formadata= new FormData()
    formadata.append('name',name)
    formadata.append('icon',icon)
    images.forEach((image)=>{
      formadata.append('images',image)
    })
    try {
      
        const res = await axios.post(`${API_BASE_URL}/Admin/Add-Category`, formadata, {
          withCredentials: true
        });

      if (res.status === 200) {
        toast.success("Category Created successfully", { id: "categories-create-success" })
        SetShowModal(false)
        setImages([])
        setImagePreviews([])
        setName('')
        getCategory() // Refresh the categories list
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status != 200) {
        toast.error(error.response?.data?.message, { id: "categories-create-error" })
      }
      
    } finally {
      setIsAddingCategory(false);
    }
  }
  const AddSubCategory = async()=>{
    if (isAddingSubCategory) return; // Prevent spam clicks
    if (!subCategoryName || !genre) {
      toast.error("SubCategory Name required", { id: "categories-subname-required" })
      return
    }
    setIsAddingSubCategory(true);
    const formadata= new FormData()
      formadata.append('name',subCategoryName)
      formadata.append('genre',genre)
      formadata.append('categoryId',categoryId)
      if (images.length > 0) {
        images.forEach((image)=>{
        formadata.append('images',image)
      })
      }
    try {
      const res= await axios.post(`${API_BASE_URL}/Admin/Add-CategorySub`,
        formadata,
        {
          withCredentials: true
        }
      )
      if (res.status === 201) {
        toast.success("SubCategory Created successfully", { id: "categories-subcreate-success" })
        // SetShowSub(false)
        setImages([])
        setImagePreviews([])
        setSubCategoryName('')
        getSubCategory(categoryId)
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status != 201) {
        toast.error(error.response?.data?.message, { id: "categories-create-error" })
      }
      
    } finally {
      setIsAddingSubCategory(false);
    }
  }
    const getCategory = async () => {  
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-category`,{
        withCredentials: true
      });
      setCategorys(res.data);      
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "categories-create-error" })
      }
      setLoading(false);
    }
  };
    const getSubCategory = async (id) => {  
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Subcategory/${id}`,{
        withCredentials: true
      });
      setSubCategorys(res.data);      
      setLoading(false);
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "categories-create-error" })
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    getCategory();
  }, []);
  const deleteUser = async (id) => {
    toast((t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "white" }}>
        <p>Are you sure you want to delete this SubCategory?</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={() => confirmDelete(id, t.id)}
            style={{ background: "red", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "gray", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            No
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const confirmDelete = async (id, toastId) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/Admin/Delete-SubCategory/${id}`,
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.dismiss(toastId);
        toast.success("SubCategory deleted successfully!", { id: "categories-subdelete-success" });
        console.log(res);
        
        // FIXED:
        getSubCategory(categoryId);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Server error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteCategory = (id) => {
    if (!id) {
      toast.error("Invalid category ID", { id: "categories-invalid-id" });
      return;
    }

    const toastId = toast((t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "white" }}>
        <p>Are you sure you want to delete this Category?</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            onClick={() => confirmDeleteCategory(id, t.id)}
            style={{ background: "red", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ background: "gray", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            No
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };


  const confirmDeleteCategory = async (id, toastId) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await axios.delete(`${API_BASE_URL}/Admin/Delete-category/${id}`,
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.dismiss(toastId);
        toast.success("Category deleted successfully!", { id: "categories-delete-success" });
        getCategory(); // Refresh the list
      }
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || 'Server error occurred');
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className='CategroiesDashBord'>

      {showSub ? (
        <div className="SubModal-Container"> {/* Centering Wrapper */}
          <div className='SubModal'>
            <div className="modal-header">
              <h2>Subcategories</h2>
              <span className="close-x" onClick={() => {SetShowSub(false); }}>×</span>
            </div>

            {/* Genre Selector */}
            <select className='SubMSelecte' value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">Select genre</option>
              <option value="men">men</option>
              <option value="women">women</option>
            </select>

            {/* Subcategory List */}
            <div className='ListSub'>
              {SubCategorys.filter((sub) => sub.genre === genre).map((sub) => (
                <div className="sub-item-row" key={sub._id}>
                  <span>{sub.name}</span>
                  <Trash2 size={16} className="red-trash" onClick={() => deleteUser(sub._id)} />
                </div>
              ))}
            </div>

            <hr className="modal-divider" />

            {/* Add New Section */}
            <div className='AddSub-Section'>
              <h3>Add New SubCategory</h3>
              <input 
                type="text" 
                onChange={(e) => setSubCategoryName(e.target.value)} 
                placeholder='SubCategory Name'
              />
              {genre && (
                <p className="status-text">
                  This subcategory will be added to: <strong>{genre}</strong>
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer">
              <button className='btn-cancel' onClick={() => {SetShowSub(false); setGenre('');}}>Cancel</button>
              <button 
                className='btn-add' 
                onClick={AddSubCategory}
                disabled={isAddingSubCategory}
              >
                {isAddingSubCategory ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Category</h3>
              <button className="close-btn" onClick={() => SetShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <input 
                type="text" 
                placeholder="Category Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="modal-input"
              />
            </div>

            <div className="modal-footer-actions">
              <button className="btn-cancel-light" onClick={() => SetShowModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-add-primary" 
                onClick={AddCategory}
                disabled={isAddingCategory}
              >
                {isAddingCategory ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="HeaderMangment">
          <h2>Categories Mangment Dashbord</h2>
          {/* <div className='recherche-categorie'>
            <input onChange={(e) =>setSearchTerm(e.target.value)} type="text" placeholder='Search with E-mail' />
            <Search style={{cursor:"pointer",color:"black"}}/>
          </div> */}
            <button className='ADDCatg' onClick={()=>SetShowModal(true)}>Add Categoie</button>
      </div>
      {loading ? (
        <ScaleLoader style={{position:"absolute",top:"50%",marginLeft:"40%",fontSize:"xx-large"}} color="white" />
        ) :( 
          <div className='div-categories'>
            {Categorys.map((category) => (
              <div key={category._id} className='categorie'>
                {/* Background Accent */}
                <div className="corner-accent"></div>

                <div className="card-header">
                  <h3 style={{margin:"0",textAlign:"start"}}>{category.name}</h3>
                  <span className="sub-count">2 subcategories</span>
                </div>

                <div className='card-footer'>
                  <button 
                    className='viewSub' 
                    onClick={() => {
                      getSubCategory(category._id);
                      SetShowSub(true);
                      setIdCategory(category._id);
                      setName(category.name);
                    }}
                  >
                    View Subcategories
                  </button>
                  
                  <Trash2 
                    className="delete-icon"
                    onClick={() => deleteCategory(category._id)} 
                    size={18}
                  />
                </div>
              </div>
            ))}
          </div>)
      }
    </div>
  )
}

export default CategroiesBord