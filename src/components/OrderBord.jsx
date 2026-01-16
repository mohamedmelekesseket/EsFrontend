import React ,{useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit2, X, User, MapPin, Package, Clock, ChevronDown, Check,Search  } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OederBord = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [orderstatus, setOrderStauts] = useState(null);
  const[customerEmail,setCustomerEmail]=useState('')
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const Orderstatus = [
    { id: 1, title: "Total Orders", color: "#a855f7" },
    { id: 2, title: "Delivered",  color: "#29b883" },
    { id: 3, title: "Pending",  color: "#F59F0A" },
    { id: 4, title: "Cancelled", color: "#EF3D3A" },
  ];

  // Map backend status to frontend display status
  const mapStatus = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'shipped': 'Processing',
      'delivered': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  // Reverse map: frontend display status to backend status
  const mapStatusToBackend = (displayStatus) => {
    const statusMap = {
      'Pending': 'pending',
      'Processing': 'shipped',
      'Completed': 'delivered',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled',
      'Total Orders': null
    };
    return statusMap[displayStatus] || displayStatus.toLowerCase();
  };

  // Map status card title to backend status for filtering
  const mapStatusTitleToBackend = (title) => {
    const statusMap = {
      'Total Orders': null, // Show all
      'Delivered': 'delivered',
      'Pending': 'pending',
      'Cancelled': 'cancelled'
    };
    return statusMap[title];
  };

  // Filter orders based on selected status and email search
  useEffect(() => {
    let filtered = [...allOrders];

    // Filter by status
    if (orderstatus && orderstatus !== 'Total Orders') {
      const backendStatus = mapStatusTitleToBackend(orderstatus);
      if (backendStatus) {
        filtered = filtered.filter(order => order.status === backendStatus);
      }
    }

    // Filter by email search (case-insensitive, partial match)
    if (customerEmail && customerEmail.trim() !== '') {
      const searchTerm = customerEmail.trim().toLowerCase();
      filtered = filtered.filter(order => {
        // Check email field (from transformed order structure)
        const email = (order.email || '').toLowerCase();
        // Also check customer name for broader search
        const customer = (order.customer || '').toLowerCase();
        // Check order ID
        const orderId = (order.id || '').toLowerCase();
        return email.includes(searchTerm) || 
               customer.includes(searchTerm) || 
               orderId.includes(searchTerm);
      });
    }

    setOrders(filtered);
  }, [orderstatus, customerEmail, allOrders]);

  // Calculate order statistics (use allOrders for accurate counts)
  const orderStats = {
    total: allOrders.length,
    completed: allOrders.filter(o => o.status === 'delivered').length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length,
  };

  // Fetch orders from server
  const getOrders = async () => {
    try {
      
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Orders`, {
        withCredentials: true
      });
      
      // Transform orders to match frontend format
      const transformedOrders = res.data.map((order, index) => {
        const customerName = order.customerInfo 
          ? `${order.customerInfo.prenom || ''} ${order.customerInfo.nom || ''}`.trim() || 'N/A'
          : 'N/A';
        
        const customerEmail = order.customerInfo?.email || 'N/A';
        
        const productNames = order.products 
          ? order.products.map(p => {
              if (p.productId && typeof p.productId === 'object') {
                return p.productId.name || 'Unknown Product';
              }
              return 'Unknown Product';
            }).join(', ')
          : 'N/A';
        
        const orderDate = order.createdAt 
          ? new Date(order.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        
        return {
          _id: order._id,
          id: order._id.toString().slice(-6).toUpperCase(),
          customer: customerName,
          email: customerEmail,
          product: productNames,
          amount: `${order.totalAmount?.toFixed(2) || '0.00'} TND`,
          status: order.status,
          date: orderDate,
          originalOrder: order
        };
      });
      
      setOrders(transformedOrders);
      setAllOrders(transformedOrders); // Store all orders
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/Admin/Update-Order-Status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      
      toast.success('Order status updated successfully');
      setOpenMenuId(null);
      getOrders(); // Refresh orders
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  // Handle context menu toggle
  const toggleMenu = (orderId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === orderId ? null : orderId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any menu
      if (!event.target.closest('.order-context-menu') && !event.target.closest('.order-menu-trigger')) {
        setOpenMenuId(null);
      }
      // Close dropdown if clicking outside
      if (!event.target.closest('.status-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (openMenuId || isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId, isDropdownOpen]);

  useEffect(() => {
    getOrders();
  }, []);
  const handleViewDetails = (order) => {
    setOpenMenuId(null);
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleEditOrder = (order) => {
    setOpenMenuId(null);
    setSelectedOrderForEdit(order);
    setSelectedStatus(order.status);
    setIsDropdownOpen(false);
  };

  const handleSaveOrderStatus = async () => {
    if (!selectedOrderForEdit || !selectedStatus) return;
    
    await updateOrderStatus(selectedOrderForEdit._id, selectedStatus);
    setSelectedOrderForEdit(null);
    setSelectedStatus('');
    setIsDropdownOpen(false);
  };

  const handleCloseEditModal = () => {
    setSelectedOrderForEdit(null);
    setSelectedStatus('');
    setIsDropdownOpen(false);
  };

  // Status options for dropdown
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#F59F0A' },
    { value: 'shipped', label: 'Shipped', color: '#3b82f6' },
    { value: 'delivered', label: 'Delivered', color: '#29b883' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF3D3A' }
  ];

  const handleCancelOrder = (order) => {
    setOpenMenuId(null);
    if (order.status === 'cancelled') {
      toast.error('Order is already cancelled');
      return;
    }
    updateOrderStatus(order._id, 'cancelled');
  };

  if (loading) {
    return (
      <div className='OederBord'>
        <div className='HeaderOrder'>
          <div className='HeaderOrder-1'>
            <h2 style={{color:"white"}}>Orders</h2>
            <h4 style={{color:"white"}}>Manage and track all customer orders</h4>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center',color:"white" }}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className='OederBord'>
      <div className='HeaderOrder' style={{marginBottom:"6%"}}>
        <div className='HeaderOrder-1'>
          <h2>Orders</h2>
          <h4>Manage and track all customer orders</h4>
          <div className="HeaderOrder-Search">
            <Search style={{color:"gray"}} />
            <input type="text" onChange={(e)=>setCustomerEmail(e.target.value)} placeholder="Search Orders..." />
          </div>
        </div>
      </div>
      <div className='HeaderOrder' style={{paddingLeft:"4%"}}>
        {Orderstatus.map((statusItem) => {
          let count = 0;
          if (statusItem.title === "Total Orders") count = orderStats.total;
          else if (statusItem.title === "Delivered") count = orderStats.completed;
          else if (statusItem.title === "Pending") count = orderStats.pending;
          else if (statusItem.title === "Cancelled") count = orderStats.cancelled;

          return (
            <motion.div
              key={statusItem.id}
              onClick={() => setOrderStauts(statusItem.title)}
              className="OrderStatus"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                backgroundColor: orderstatus === statusItem.title ? '#1e293b' : '#0F1729',
                borderColor: orderstatus === statusItem.title ? statusItem.color : '#03294F'
              }}
            >
              <h5>{statusItem.title}</h5>
              <h2 style={{color:`${statusItem.color}`}}>{count}</h2>
            </motion.div>
          );
        })}
      </div>
      <div className="table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="order-id">{order.id}</td>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">{order.customer}</span>
                    <span className="customer-email">{order.email}</span>
                  </div>
                </td>
                <td>{order.product}</td>
                <td className="amount">{order.amount}</td>
                <td>
                  <span className={`status-badge ${mapStatus(order.status).toLowerCase()}`}>
                    {mapStatus(order.status)}
                  </span>
                </td>
                <td>{order.date}</td>
                <td className="actions" style={{ position: 'relative' }}>
                  <span 
                    className="order-menu-trigger"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={(e) => toggleMenu(order._id, e)}
                  >
                    •••
                  </span>
                  <AnimatePresence>
                    {openMenuId === order._id && (
                      <motion.div
                        className="order-context-menu"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '-100%',
                          marginTop: '8px',
                          backgroundColor: '#1e293b',
                          borderRadius: '8px',
                          padding: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                          zIndex: 1000,
                          minWidth: '180px'
                        }}
                      >
                        <motion.div
                          onClick={() => handleViewDetails(order)}
                          whileHover={{ backgroundColor: '#475569' }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: '#334155',
                            marginBottom: '4px'
                          }}
                        >
                          <Eye size={18} color="#ffffff" />
                          <span style={{ color: '#ffffff', fontSize: '14px' }}>View Details</span>
                        </motion.div>
                        <motion.div
                          onClick={() => handleEditOrder(order)}
                          whileHover={{ backgroundColor: '#2563eb' }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            backgroundColor: '#3b82f6',
                            marginBottom: '4px'
                          }}
                        >
                          <Edit2 size={18} color="#ffffff" />
                          <span style={{ color: '#ffffff', fontSize: '14px' }}>Edit Order</span>
                        </motion.div>
                        
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="order-modal-backdrop"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="order-details-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="order-modal-header">
                <div className="order-modal-header-left">
                  <h2>Order Details</h2>
                  <p className="order-modal-id">#{selectedOrder.originalOrder?._id || selectedOrder._id}</p>
                </div>
                <div className="order-modal-header-right">
                  <span className={`status-badge ${mapStatus(selectedOrder.status).toLowerCase()}`}>
                    {mapStatus(selectedOrder.status)}
                  </span>
                  <button onClick={handleCloseModal} className="order-modal-close">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="order-modal-content">
                {/* Customer Info Card */}
                <div className="order-detail-card">
                  <div className="order-detail-card-header">
                    <User size={20} color="#ffffff" />
                    <h3>Customer Info</h3>
                  </div>
                  <div className="order-detail-card-body">
                    <div className="customer-avatar">
                      {selectedOrder.customer
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div className="customer-details">
                      <h4>{selectedOrder.customer}</h4>
                      <p>{selectedOrder.email}</p>
                      {selectedOrder.originalOrder?.customerInfo?.telephone && (
                        <div className="customer-phone">
                          <span>📞</span>
                          <span>{selectedOrder.originalOrder.customerInfo.telephone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address Card */}
                {selectedOrder.originalOrder?.shippingAddress && (
                  <div className="order-detail-card">
                    <div className="order-detail-card-header">
                      <MapPin size={20} color="#ffffff" />
                      <h3>Shipping Address</h3>
                    </div>
                    <div className="order-detail-card-body">
                      <div className="shipping-details">
                        <p className="shipping-street">{selectedOrder.originalOrder.shippingAddress.rue}</p>
                        <p className="shipping-city">
                          {[
                            selectedOrder.originalOrder.shippingAddress.ville,
                            selectedOrder.originalOrder.shippingAddress.province,
                            selectedOrder.originalOrder.shippingAddress.postal
                          ].filter(Boolean).join(', ')}
                        </p>
                        {selectedOrder.originalOrder.shippingAddress.province && (
                          <p className="shipping-country">{selectedOrder.originalOrder.shippingAddress.province}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Products Card */}
                {selectedOrder.originalOrder?.products && selectedOrder.originalOrder.products.length > 0 && (
                  <div className="order-detail-card">
                    <div className="order-detail-card-header">
                      <Package size={20} color="#ffffff" />
                      <h3>Products ({selectedOrder.originalOrder.products.length} {selectedOrder.originalOrder.products.length === 1 ? 'item' : 'items'})</h3>
                    </div>
                    <div className="order-detail-card-body">
                      <div className="products-list">
                        {selectedOrder.originalOrder.products.map((item, index) => {
                          const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                          const productName = product?.name || 'Unknown Product';
                          const productPrice = product?.price || 0;
                          const quantity = item.quantity || 1;
                          
                          return (
                            <div key={index} className="product-item">
                              <div className="product-item-left">
                                <Package size={18} color="#64748b" />
                                <div>
                                  <p className="product-name">{productName}</p>
                                  <p className="product-quantity">Quantity: {quantity}</p>
                                </div>
                              </div>
                              <div className="product-item-right">
                                <span className="product-price">{productPrice.toFixed(2)} TND</span>
                                <span className="product-price-label">per unit</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Info Footer */}
                <div className="order-modal-footer">
                  <div className="order-date-card">
                    <div className="order-date-header">
                      <Clock size={18} color="#64748b" />
                      <h4>CREATED</h4>
                    </div>
                    <p className="order-date-text">
                      {selectedOrder.originalOrder?.createdAt
                        ? new Date(selectedOrder.originalOrder.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="order-total-card">
                    <h4>TOTAL AMOUNT</h4>
                    <p className="order-total-amount">
                      {selectedOrder.originalOrder?.totalAmount?.toFixed(2) || '0.00'} TND
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Edit Order Status Modal */}
        {selectedOrderForEdit && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseEditModal}
              className="order-modal-backdrop"
            />
            
            {/* Edit Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="edit-order-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="edit-order-header">
                <div>
                  <h2>Edit Order Status</h2>
                  <p className="edit-order-subtitle">Update the status of this order</p>
                </div>
                <button onClick={handleCloseEditModal} className="order-modal-close">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="edit-order-body">
                <div className="edit-order-field">
                  <label>ORDER ID</label>
                  <p className="edit-order-value">{selectedOrderForEdit.originalOrder?._id || selectedOrderForEdit._id}</p>
                </div>

                <div className="edit-order-field">
                  <label>CUSTOMER</label>
                  <p className="edit-order-value">{selectedOrderForEdit.customer}</p>
                </div>

                <div className="edit-order-field">
                  <label>STATUS</label>
                  <div className="status-dropdown-container">
                    <div 
                      className="status-dropdown"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <div className="status-dropdown-selected">
                        <span 
                          className="status-dot" 
                          style={{ backgroundColor: statusOptions.find(opt => opt.value === selectedStatus)?.color || '#F59F0A' }}
                        />
                        <span>{statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Pending'}</span>
                      </div>
                      <ChevronDown 
                        size={20} 
                        color="#94a3b8"
                        style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      />
                    </div>
                    
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="status-dropdown-menu"
                      >
                        {statusOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`status-dropdown-option ${selectedStatus === option.value ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedStatus(option.value);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span className="status-dot" style={{ backgroundColor: option.color }} />
                            <span>{option.label}</span>
                            {selectedStatus === option.value && (
                              <Check size={18} color="#3b82f6" style={{ marginLeft: 'auto' }} />
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="edit-order-footer">
                <button onClick={handleCloseEditModal} className="edit-order-cancel">
                  Cancel
                </button>
                <button onClick={handleSaveOrderStatus} className="edit-order-save">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OederBord