import React, { useEffect, useState } from "react";
import {
  MessageCircleWarning,
  Package,
  SquareArrowRight,
  User,
  LayoutGrid,
  ClipboardList,
  PackagePlus,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleMenuSelect = (menu) => {
    localStorage.setItem("selecteMenu", menu);
  };

  const fetchAll = async () => {
    try {
      const [usersRes, categoriesRes, productsRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/Owner/getUser`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/Admin/Get-category`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/Admin/Get-products`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/Admin/Get-Orders`, { withCredentials: true }),
      ]);

      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const Stat = ({ title, count, icon, path, menuKey }) => (
    <div className="DashBord-Menu-1">
      <div className="dashbord-menu-header">
        <h3>{title}</h3>
        <span className="icon-circle">{icon}</span>
      </div>

      <h1>
        {loading ? <BeatLoader size={8} color="#4f8cff" /> : count}
      </h1>

      <Link
        to={path}
        onClick={() => handleMenuSelect(menuKey)}
        style={{ textDecoration: "none", width: "100%" }}
      >
        <div className="dashbord-menu-link">
          <span className="icon-arrow">
            <SquareArrowRight size={20} color="#4f8cff" />
          </span>
          <h5>Go to component</h5>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="DashBord">
      <div className="DashBord-Title">
        <h2>Dashboard</h2>
      </div>

      <div className="DashBord-Menu">
        <Stat
          title="Orders"
          count={orders.length}
          icon={<ClipboardList size={28} color="#4f8cff" />}
          path="/ManagementDashboard/Order"
          menuKey="Order"
        />

        <Stat
          title="Categories"
          count={categories.length}
          icon={<LayoutGrid size={28} color="#4f8cff" />}
          path="/ManagementDashboard/CategoriesBoard"
          menuKey="Categories"
        />

        <Stat
          title="Products"
          count={products.length}
          icon={<Package size={28} color="#4f8cff" />}
          path="/ManagementDashboard/AllProducts"
          menuKey="AllProducts"
        />

        <Stat
          title="Users"
          count={users.length}
          icon={<User size={28} color="#4f8cff" />}
          path="/ManagementDashboard/user"
          menuKey="Users"
        />

        <Stat
          title="Add New Product"
          count={<Plus size={30} />}
          icon={<PackagePlus size={28} color="#4f8cff" />}
          path="/ManagementDashboard/AddNewProduct"
          menuKey="AddNewProduct"
        />

        <Stat
          title="Bugs Reports"
          count={1}
          icon={<MessageCircleWarning size={28} color="#4f8cff" />}
          path="/ManagementDashboard/BugsReports"
          menuKey="BugsReports"
        />
      </div>
    </div>
  );
};

export default Dashboard;
