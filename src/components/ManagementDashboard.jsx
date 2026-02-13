import React, { useState, useEffect } from 'react';
import { 
  AlignStartVertical, 
  UsersRound, 
  BarChart3, 
  Users, 
  PlusCircle, 
  LayoutGrid, 
  Folder, 
  ShoppingCart, 
  Folders, 
  X, 
  Package, 
  PackagePlus, 
  Menu, 
  MessageCircleWarning 
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ScaleLoader } from "react-spinners";

const ManagementDashboard = () => {
  const [selecteMenu, setSelecteMenu] = useState(() => localStorage.getItem('selecteMenu') || 'Dashbord');
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  const handleMenuSelect = (menu) => {
    setSelecteMenu(menu);
    localStorage.setItem('selecteMenu', menu);
    setShowMenu(false); // Close mobile menu on select
  };

  // Synchronize menu selection with URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/user')) setSelecteMenu('Users');
    else if (path.includes('/DashBord')) setSelecteMenu('Dashbord');
    else if (path.includes('/Order')) setSelecteMenu('Order');
    else if (path.includes('/CategroiesBord')) setSelecteMenu('Categories');
    else if (path.includes('/AllProducts')) setSelecteMenu('AllProducts');
    else if (path.includes('/AddNewProduct')) setSelecteMenu('AddNewProduct');
    else if (path.includes('/BugsReports')) setSelecteMenu('BugsReports');
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // Reduced to 2s for better UX
    return () => clearTimeout(timer);
  }, []);

  // Menu items configuration for cleaner rendering
  const menuItems = [
    { id: 'Dashbord', icon: <AlignStartVertical size={20} />, label: 'Dashboard', path: '/ManagementDashboard/DashBord' },
    { id: 'Users', icon: <UsersRound size={20} />, label: 'Users', path: '/ManagementDashboard/user' },
    { id: 'Order', icon: <ShoppingCart size={20} />, label: 'Order', path: '/ManagementDashboard/Order' },
    { id: 'Categories', icon: <Folders size={20} />, label: 'Categories', path: '/ManagementDashboard/CategroiesBord' },
    { id: 'AllProducts', icon: <Package size={20} />, label: 'All Products', path: '/ManagementDashboard/AllProducts' },
    { id: 'AddNewProduct', icon: <PackagePlus size={20} />, label: 'Add New Product', path: '/ManagementDashboard/AddNewProduct' },
    { id: 'BugsReports', icon: <MessageCircleWarning size={20} />, label: 'Sales Reports', path: '/ManagementDashboard/BugsReports' },
  ];

  return (
    <div className='ManagementDashboard'>
      {/* Mobile Header & Sidebar Logic */}
      <div className='ManagementDashboard-1'>
        <div className='mobile-header'>
          {showMenu ? (
            <X onClick={() => setShowMenu(false)} className="menu-icon" />
          ) : (
            <Menu onClick={() => setShowMenu(true)} className="menu-icon" />
          )}
          <Link to="/" className="logo-link">
            <h2>Es</h2>
          </Link>
        </div>

        {/* Mobile Sidebar */}
        <div className='MenuDashbordPhone' style={{ left: showMenu ? '0%' : '-100%' }}>
          <h3>Menu</h3>
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className={`LienDash ${selecteMenu === item.id ? 'active-mobile' : ''}`}
              onClick={() => handleMenuSelect(item.id)}
            >
              <Link to={item.path} className="mobile-link-inner">
                {item.icon} <span>{item.label}</span>
              </Link>
            </div>
          ))}
        </div>

        {showMenu && <div onClick={() => setShowMenu(false)} className='overflowPhone'></div>}

        {/* Desktop Sidebar */}
        <div className='MenuDashbord'>
          <h4 className="menu-title">MENU</h4>
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className={`h2Dash ${selecteMenu === item.id ? 'active' : ''}`}
            >
              {/* Glowing Indicator for active state */}
              {/* <div className='clickLink' style={{ display: selecteMenu === item.id ? 'block' : 'none' }}></div> */}
              
              <div className="icon-box">
                {React.cloneElement(item.icon, { 
                  color: selecteMenu === item.id ? 'white' : '#64748b' 
                })}
              </div>

              <Link 
                onClick={() => handleMenuSelect(item.id)} 
                className="nav-link" 
                style={{textDecoration:"none"}}
                to={item.path}
              >
                <h3 className={selecteMenu === item.id ? 'text-white' : 'text-gray'}>
                  {item.label}
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className='ManagementDashboard-2'>
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