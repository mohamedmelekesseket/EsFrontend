import React, { useState, useEffect } from "react";
import { Search, SquareArrowRight } from 'lucide-react';
import { Trash,Check,Pen ,X  } from 'lucide-react';
import axios from 'axios'
import toast, { Toaster } from "react-hot-toast";
import { ScaleLoader } from "react-spinners"; // Import ScaleLoader

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserBord = () => {
  const [role, setRole] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const user = JSON.parse(localStorage.getItem('user'));
  const [editMode, setEditMode] = useState(null);
  const [loading, setLoading] = useState(true); // State for loading
  const [updatedName, setUpdatedName] = useState(''); // Added missing state
  const [Users, setUsers] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);


    const getUser = async () => {  
    try {
      // TODO: Replace hardcoded API URL with environment variable for production
      const res = await axios.get(`${API_BASE_URL}/Owner/getUser`,{
        withCredentials: true
      });
      setUsers(res.data);      
      setTimeout(() => {
        setLoading(false);
      }, 4000);
    } catch (error) {
      console.log(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message, { id: "userbord-fetch-error" })
      }
    }
  };

  // Function to update a user
  const updateUser = async(id) => {
    if (isUpdating) return; // Prevent spam clicks
    try {
        if (role == '') {
          return toast.error('select new role or close', { id: "userbord-role-required" })
        }
      setIsUpdating(true);
      // TODO: Replace hardcoded API URL with environment variable for production
      const res = await axios.put(`${API_BASE_URL}/Owner/Update-User/${id}` ,{
        role
      },{
        withCredentials: true
      });
      if(res.status === 200) {
        toast.success('User Updated', { id: "userbord-update-success" });
        setEditMode(null)
        setRole('')
        getUser();
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message || 'Server error occurred');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to delete a user
  const deleteUser = async (id) => {
    toast((t) => (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "white" }}>
        <p>Are you sure you want to delete this user?</p>
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
    if (isDeleting) return; // Prevent spam clicks
    setIsDeleting(true);
    try {
      // TODO: Replace hardcoded API URL with environment variable for production
      const res = await axios.delete(`${API_BASE_URL}/Owner/DeleteUser/${id}`,{
        withCredentials: true
      });
      if (res.status === 200) {
        toast.dismiss(toastId);
        toast.success("User deleted successfully!", { id: "userbord-delete-success" });
        getUser();
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status !== 200) {
        toast.error(error.response?.data?.message || 'Server error occurred');
      }
    } finally {
      setIsDeleting(false);
    }
  };
  const displayForm = (user) => {
    if (editMode === user._id) {
      return (
        <tr key={user._id}>
        <td>{user.email}</td>
        <td>
          <select 
            className="roleselecte" 
            value={role || user.role} // Pre-select current role
            onChange={(e) => setRole( e.target.value)}
          >
            <option value="">Role</option>
            <option value="Admin">Admin</option>
            <option value="Owner">Owner</option>
          </select>
        </td>
        <td>{user.phoneNumber}</td>
        <td style={{ display: "flex", justifyContent: "space-evenly", fontSize: "large", alignItems:"center", gap:"8px" }}>
          {isUpdating ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'green' }}>
              <span style={{
                width: '14px',
                height: '14px',
                border: '2px solid currentColor',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block'
              }}></span>
              Saving...
            </span>
          ) : (
            <>
              <Check onClick={() => updateUser(user._id)} style={{ color: "green", cursor: "pointer" }} size={22} />
              <X  onClick={() => setEditMode(null)} size={22} style={{ cursor: "pointer", color: "red" }} />
            </>
          )}
        </td>
      </tr>
      
      );
    } else {
      return (
        <tr key={user._id}>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td>{user.phoneNumber}</td>
          <td style={{ display: "flex", justifyContent: "space-evenly", fontSize: "large", alignItems:"center", gap:"8px" }}>
            {isDeleting ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'red' }}>
                <span style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid currentColor',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block'
                }}></span>
                Deleting...
              </span>
            ) : (
              <>
                <Trash size={20} onClick={() => deleteUser(user._id)} style={{ cursor: "pointer" }} />
                <Pen size={20} onClick={() => { setEditMode(user._id); setRole(user.role); }} style={{ cursor: "pointer" }} />
              </>
            )}
          </td>
        </tr>
      );
    }
  };
  const filteredUsers = Users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    getUser();
  }, []);
  return (
    <div className='UserMangment'>
      <Toaster/>
      <div className="HeaderMangment">
          <h2>User Mangment Dashbord</h2>
          <div className='recherche-2'>
            <input onChange={(e) =>setSearchTerm(e.target.value)} type="text" placeholder='Search with E-mail' />
            <Search style={{cursor:"pointer",color:"black"}}/>
        </div>
      </div>

        <div>        
        <div className='div-tab'>
          <table border={0}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Phone Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {filteredUsers.map((user) => displayForm(user))}
            </tbody>
          </table>
        </div>
        <div className="PhoneDisplay">
          {filteredUsers.map((user) => (
            <div key={user._id} className="UserCard">
              <p><strong style={{color:"#70787fff"}}>Email:</strong> <br /> {user.email}</p>
              <div style={{width:"60%",display:"flex",justifyContent:'space-between'}}>
                <p><strong style={{color:"#70787fff"}}>Role:</strong> <br /> {user.role}</p>
                <p><strong style={{color:"#70787fff"}}>Phone:</strong> <br /> {user.phoneNumber}</p>
              </div>
              <div className="actions">
                <Trash size={20} onClick={() => deleteUser(user._id)} />
                <Pen size={20} onClick={() => { setEditMode(user._id); setRole(user.role); }} />
              </div>
            </div>
          ))}
        </div>
        </div>
    </div>
  )
}

export default UserBord