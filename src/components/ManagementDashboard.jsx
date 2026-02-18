import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UsersRound, 
  ShoppingCart, 
  Folders, 
  Package, 
  PackagePlus, 
  Menu, 
  X, 
  MessageCircleWarning 
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ScaleLoader } from "react-spinners";

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/ManagementDashboard/DashBord', icon: <LayoutDashboard size={20} /> },
  { id: 'users', label: 'Users', path: '/ManagementDashboard/user', icon: <UsersRound size={20} /> },
  { id: 'orders', label: 'Orders', path: '/ManagementDashboard/Order', icon: <ShoppingCart size={20} /> },
  { id: 'categories', label: 'Categories', path: '/ManagementDashboard/CategroiesBord', icon: <Folders size={20} /> },
  { id: 'products', label: 'All Products', path: '/ManagementDashboard/AllProducts', icon: <Package size={20} /> },
  { id: 'add-product', label: 'Add Product', path: '/ManagementDashboard/AddNewProduct', icon: <PackagePlus size={20} /> },
  { id: 'reports', label: 'Sales Reports', path: '/ManagementDashboard/BugsReports', icon: <MessageCircleWarning size={20} /> },
];


const ManagementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const selectedMenu = menuItems.find(item =>
    location.pathname.startsWith(item.path)
  )?.id;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="ManagementDashboard">
          <Menu onClick={() => setShowMenu(true)} className="menu-icon" />

      <div className="ManagementDashboard-1">
        <div className="mobile-header">
          {/* {showMenu ? (
            <X onClick={() => setShowMenu(false)} className="menu-icon" />
          ) : (
            <Menu onClick={() => setShowMenu(true)} className="menu-icon" />
          )} */}
          {/* <Link to="/" className="logo-link"><h2>Es</h2></Link> */}
        </div>

        <div className="MenuDashbordPhone" style={{ left: showMenu ? '0%' : '-100%' }}>
          <Menu onClick={() => setShowMenu(true)} className="menu-icon" />

          <h3>Menu</h3>
          {menuItems.map(item => (
            <Link 
              key={item.id}
              to={item.path}
              onClick={() => setShowMenu(false)}
              className={`LienDash ${selectedMenu === item.id ? 'active' : ''}`}
            >
              {item.icon} <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {showMenu && <div onClick={() => setShowMenu(false)} className="overflowPhone" />}

        <div className="MenuDashbord">
          <h4 className="menu-title">MENU</h4>
          {menuItems.map(item => (
            <Link 
              key={item.id}
              to={item.path}
              className={`h2Dash ${selectedMenu === item.id ? 'active' : ''}`}
            >
              <div className="icon-box">
                {React.cloneElement(item.icon, {
                  color: selectedMenu === item.id ? 'white' : '#64748b'
                })}
              </div>
              <h3>{item.label}</h3>
            </Link>
          ))}
        </div>
      </div>

      <div className="ManagementDashboard-2">
        {loading ? (
          <div className="loader-container">
            <ScaleLoader color="white" height={35} width={4} radius={2} margin={2} />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
};

export default ManagementDashboard;
