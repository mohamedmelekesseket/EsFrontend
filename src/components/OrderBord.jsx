import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit2, X, User, MapPin, Package, Clock, ChevronDown, Check, Search, Printer } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OederBord = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [orderstatus, setOrderStauts] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  const Orderstatus = [
    { id: 1, title: "Total Orders", color: "#a855f7" },
    { id: 2, title: "Delivered", color: "#29b883" },
    { id: 3, title: "Pending", color: "#F59F0A" },
    { id: 4, title: "Cancelled", color: "#EF3D3A" },
  ];

  const mapStatus = (status) => {
    const statusMap = { 'pending': 'Pending', 'shipped': 'Processing', 'delivered': 'Completed', 'cancelled': 'Cancelled' };
    return statusMap[status] || status;
  };

  const mapStatusTitleToBackend = (title) => {
    const statusMap = { 'Total Orders': null, 'Delivered': 'delivered', 'Pending': 'pending', 'Cancelled': 'cancelled' };
    return statusMap[title];
  };

  useEffect(() => {
    let filtered = [...allOrders];
    if (orderstatus && orderstatus !== 'Total Orders') {
      const backendStatus = mapStatusTitleToBackend(orderstatus);
      if (backendStatus) filtered = filtered.filter(order => order.status === backendStatus);
    }
    if (customerEmail.trim()) {
      const term = customerEmail.trim().toLowerCase();
      filtered = filtered.filter(order =>
        (order.email || '').toLowerCase().includes(term) ||
        (order.customer || '').toLowerCase().includes(term) ||
        (order.id || '').toLowerCase().includes(term)
      );
    }
    setOrders(filtered);
  }, [orderstatus, customerEmail, allOrders]);

  const orderStats = {
    total: allOrders.length,
    completed: allOrders.filter(o => o.status === 'delivered').length,
    pending: allOrders.filter(o => o.status === 'pending').length,
    cancelled: allOrders.filter(o => o.status === 'cancelled').length,
  };

  const getOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/Admin/Get-Orders`, { withCredentials: true });
      // ✅ Handle { success, data: [...] } shape
      const raw = res.data.data || res.data;
      const list = Array.isArray(raw) ? raw : [];

      const transformedOrders = list.map((order) => {
        const customerName = order.customerInfo
          ? `${order.customerInfo.prenom || ''} ${order.customerInfo.nom || ''}`.trim() || 'N/A'
          : 'N/A';
        const customerEmail = order.customerInfo?.email || 'N/A';
        const customerPhone = order.customerInfo?.telephone || 'N/A';
        const place = order.shippingAddress
          ? [order.shippingAddress.ville, order.shippingAddress.province, order.shippingAddress.postal]
              .filter(Boolean)
              .join(', ') || 'N/A'
          : 'N/A';
        const productNames = order.products
          ? order.products.map(p => (p.productId && typeof p.productId === 'object' ? p.productId.name : 'Unknown Product')).join(', ')
          : 'N/A';
        const orderDate = order.createdAt
          ? new Date(order.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];
        return {
          _id: order._id,
          id: order._id.toString().slice(-6).toUpperCase(),
          customer: customerName,
          email: customerEmail,
          phone: customerPhone,
          place,
          product: productNames,
          amount: `${order.totalAmount?.toFixed(2) || '0.00'} TND`,
          status: order.status,
          date: orderDate,
          originalOrder: order
        };
      });

      setOrders(transformedOrders);
      setAllOrders(transformedOrders);
    } catch (error) {
      console.error("[getOrders]", error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders.', { id: "orders-fetch-error" });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/Admin/Update-Order-Status/${orderId}`, { status: newStatus }, { withCredentials: true });
      toast.success('Order status updated successfully.', { id: "orders-update-success" });
      setOpenMenuId(null);
      getOrders();
    } catch (error) {
      console.error("[updateOrderStatus]", error);
      toast.error(error.response?.data?.message || 'Failed to update order status.', { id: "orders-update-error" });
    }
  };

  const toggleMenu = (orderId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === orderId ? null : orderId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.order-context-menu') && !event.target.closest('.order-menu-trigger')) setOpenMenuId(null);
      if (!event.target.closest('.status-dropdown-container')) setIsDropdownOpen(false);
    };
    if (openMenuId || isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId, isDropdownOpen]);

  useEffect(() => { getOrders(); }, []);

  const handleViewDetails = (order) => { setOpenMenuId(null); setSelectedOrder(order); };
  const handleCloseModal = () => setSelectedOrder(null);
  const handleEditOrder = (order) => { setOpenMenuId(null); setSelectedOrderForEdit(order); setSelectedStatus(order.status); setIsDropdownOpen(false); };
  const handleSaveOrderStatus = async () => {
    if (!selectedOrderForEdit || !selectedStatus) return;
    await updateOrderStatus(selectedOrderForEdit._id, selectedStatus);
    setSelectedOrderForEdit(null);
    setSelectedStatus('');
    setIsDropdownOpen(false);
  };
  const handleCloseEditModal = () => { setSelectedOrderForEdit(null); setSelectedStatus(''); setIsDropdownOpen(false); };
  const handleCancelOrder = (order) => {
    setOpenMenuId(null);
    if (order.status === 'cancelled') { toast.error('Order is already cancelled.', { id: "orders-already-cancelled" }); return; }
    updateOrderStatus(order._id, 'cancelled');
  };

  const handlePrintOrder = (order) => {
    if (!order) return;
    const original = order.originalOrder || {};
    const customerInfo = original.customerInfo || {};
    const shipping = original.shippingAddress || {};
    const products = original.products || [];
    const orderId = original._id || order._id;
    const orderDate = original.createdAt
      ? new Date(original.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      : order.date;

    const productsRows = products.map((item, index) => {
      const product = item.productId && typeof item.productId === 'object' ? item.productId : {};
      const unitPrice = product.price || 0;
      const quantity = item.quantity || 1;
      const lineTotal = unitPrice * quantity;
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${product.name || 'Product'}</td>
          <td>${item.size || '-'}</td>
          <td>${item.color || '-'}</td>
          <td>${quantity}</td>
          <td>${unitPrice.toFixed(2)} TND</td>
          <td>${lineTotal.toFixed(2)} TND</td>
        </tr>
      `;
    }).join('');

    const totalAmount = original.totalAmount != null
      ? Number(original.totalAmount).toFixed(2)
      : (order.amount || '').replace(' TND', '');

    const place = shipping
      ? [shipping.rue, shipping.ville, shipping.province, shipping.postal].filter(Boolean).join(', ')
      : order.place;

    const phone = customerInfo.telephone || order.phone || 'N/A';

    const html = `
      <html>
        <head>
          <title>Order ${orderId}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 0; padding: 24px; background: #f3f4f6; color: #111827; }
            .invoice { max-width: 800px; margin: 0 auto; background: #ffffff; padding: 24px 32px; border-radius: 12px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15); }
            .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
            .invoice-title { font-size: 20px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: #111827; }
            .invoice-meta { text-align: right; font-size: 13px; color: #6b7280; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: #e5f6ff; color: #0369a1; margin-top: 4px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 13px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
            .section-body { font-size: 14px; color: #111827; }
            .two-columns { display: flex; justify-content: space-between; gap: 24px; }
            .two-columns > div { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
            th, td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
            th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; background: #f9fafb; }
            tfoot td { border-top: 2px solid #e5e7eb; font-weight: 600; }
            .right { text-align: right; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .note { font-size: 12px; color: #6b7280; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="invoice-header">
              <div>
                <div class="invoice-title">Order Summary</div>
                <div class="mt-2" style="font-size: 13px; color: #4b5563;">Order ID: <strong>${orderId}</strong></div>
              </div>
              <div class="invoice-meta">
                <div>Created: ${orderDate || ''}</div>
                <div class="badge">${mapStatus(order.status || original.status || 'pending')}</div>
              </div>
            </div>

            <div class="two-columns section">
              <div>
                <div class="section-title">Customer</div>
                <div class="section-body">
                  <div><strong>${order.customer || '-'}</strong></div>
                  <div>${order.email || customerInfo.email || '-'}</div>
                  <div class="mt-2">Phone: ${phone}</div>
                </div>
              </div>
              <div>
                <div class="section-title">Shipping Address</div>
                <div class="section-body">
                  <div>${shipping.rue || '-'}</div>
                  <div>${place || '-'}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Products</div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Size</th>
                    <th>Color</th>
                    <th class="right">Qty</th>
                    <th class="right">Unit Price</th>
                    <th class="right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsRows || '<tr><td colspan="7" style="text-align:center; padding: 16px 8px;">No products found.</td></tr>'}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="6" class="right">Total</td>
                    <td class="right">${totalAmount || '0.00'} TND</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="note">
              This document was generated automatically from the ES Brand order management system.
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#F59F0A' },
    { value: 'shipped', label: 'Shipped', color: '#3b82f6' },
    { value: 'delivered', label: 'Delivered', color: '#29b883' },
    { value: 'cancelled', label: 'Cancelled', color: '#EF3D3A' }
  ];

  if (loading) {
    return (
      <div className='OederBord'>
        <div className='HeaderOrder'>
          <div className='HeaderOrder-1'>
            <h2 style={{ color: "white" }}>Orders</h2>
            <h4 style={{ color: "white" }}>Manage and track all customer orders</h4>
          </div>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center', color: "white" }}>Loading orders...</div>
      </div>
    );
  }

  return (
    <div className='OederBord'>
      <div className='HeaderOrder' style={{ marginBottom: "6%" }}>
        <div className='HeaderOrder-1'>
          <h2>Orders</h2>
          <h4>Manage and track all customer orders</h4>
          <div className="HeaderOrder-Search">
            <Search style={{ color: "gray" }} />
            <input type="text" onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Search Orders..." />
          </div>
        </div>
      </div>

      <div className='HeaderOrder' style={{ paddingLeft: "1%" }}>
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
              style={{ backgroundColor: orderstatus === statusItem.title ? '#1e293b' : '#0F1729', borderColor: orderstatus === statusItem.title ? statusItem.color : '#03294F' }}
            >
              <h5>{statusItem.title}</h5>
              <h2 style={{ color: statusItem.color }}>{count}</h2>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="table-container desktop-only">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Place</th>
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
                <td className="order-id">#{order.id}</td>
                <td>
                  <div className="customer-info">
                    <span className="customer-name">{order.customer}</span>
                    <span className="customer-email">{order.email}</span>
                  </div>
                </td>
              <td>{order.phone}</td>
              <td>{order.place}</td>
                <td>{order.product}</td>
                <td className="amount">{order.amount}</td>
                <td>
                  <span className={`status-badge ${mapStatus(order.status).toLowerCase()}`}>
                    {mapStatus(order.status)}
                  </span>
                </td>
                <td>{order.date}</td>
                <td className="actions" style={{ position: 'relative' }}>
                  <span className="order-menu-trigger" style={{ cursor: 'pointer' }} onClick={(e) => toggleMenu(order._id, e)}>•••</span>
                  <AnimatePresence>
                    {openMenuId === order._id && (
                      <motion.div
                        className="order-context-menu"
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        style={{ position: 'absolute', right: 0, top: '-100%', marginTop: '8px', backgroundColor: '#1e293b', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 1000, minWidth: '180px' }}
                      >
                        <motion.div onClick={() => handleViewDetails(order)} whileHover={{ backgroundColor: '#475569' }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#334155', marginBottom: '4px' }}>
                          <Eye size={18} color="#ffffff" />
                          <span style={{ color: '#ffffff', fontSize: '14px' }}>View Details</span>
                        </motion.div>
                        <motion.div onClick={() => handleEditOrder(order)} whileHover={{ backgroundColor: '#2563eb' }} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', cursor: 'pointer', backgroundColor: '#3b82f6', marginBottom: '4px' }}>
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

      {/* Mobile Cards */}
      <div className="mobile-orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-mobile-card" onClick={() => handleViewDetails(order)}>
            <div className="card-header">
              <span className="order-id">#{order.id}</span>
              <span className={`status-badge ${mapStatus(order.status).toLowerCase()}`}>{mapStatus(order.status)}</span>
            </div>
            <div className="card-body">
              <h3 className="customer-name">{order.customer}</h3>
              <p className="customer-email">{order.email}</p>
              <p className="customer-phone">📞 {order.phone}</p>
              <p className="customer-place">📍 {order.place}</p>
              <p className="product-summary">{order.product}</p>
            </div>
            <div className="card-footer">
              <span className="amount">{order.amount}</span>
              <span className="date">{order.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="order-modal-backdrop" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="order-details-modal" onClick={(e) => e.stopPropagation()}
            >
              <div className="order-modal-header">
                <div className="order-modal-header-left">
                  <h2>Order Details</h2>
                  <p className="order-modal-id">#{selectedOrder.originalOrder?._id || selectedOrder._id}</p>
                </div>
                <div className="order-modal-header-right">
                  <span className={`status-badge ${mapStatus(selectedOrder.status).toLowerCase()}`}>{mapStatus(selectedOrder.status)}</span>
                <button
                  onClick={() => handlePrintOrder(selectedOrder)}
                  style={{
                    marginLeft: '12px',
                    padding: '6px 10px',
                    borderRadius: '999px',
                    border: '1px solid #1d4ed8',
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                  <button onClick={handleCloseModal} className="order-modal-close"><X size={20} /></button>
                </div>
              </div>
              <div className="order-modal-content">
                <div className="order-detail-card">
                  <div className="order-detail-card-header"><User size={20} color="#ffffff" /><h3>Customer Info</h3></div>
                  <div className="order-detail-card-body">
                    <div className="customer-avatar">{selectedOrder.customer.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                    <div className="customer-details">
                      <h4>{selectedOrder.customer}</h4>
                      <p>{selectedOrder.email}</p>
                      {selectedOrder.originalOrder?.customerInfo?.telephone && (
                        <div className="customer-phone"><span>📞</span><span>{selectedOrder.originalOrder.customerInfo.telephone}</span></div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedOrder.originalOrder?.shippingAddress && (
                  <div className="order-detail-card">
                    <div className="order-detail-card-header"><MapPin size={20} color="#ffffff" /><h3>Shipping Address</h3></div>
                    <div className="order-detail-card-body">
                      <div className="shipping-details">
                        <p className="shipping-street">{selectedOrder.originalOrder.shippingAddress.rue}</p>
                        <p className="shipping-city">{[selectedOrder.originalOrder.shippingAddress.ville, selectedOrder.originalOrder.shippingAddress.province, selectedOrder.originalOrder.shippingAddress.postal].filter(Boolean).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.originalOrder?.products?.length > 0 && (
                  <div className="order-detail-card">
                    <div className="order-detail-card-header"><Package size={20} color="#ffffff" /><h3>Products ({selectedOrder.originalOrder.products.length} {selectedOrder.originalOrder.products.length === 1 ? 'item' : 'items'})</h3></div>
                    <div className="order-detail-card-body">
                      <div className="products-list">
                        {selectedOrder.originalOrder.products.map((item, index) => {
                          const product = item.productId && typeof item.productId === 'object' ? item.productId : null;
                          return (
                            <div key={index} className="product-item">
                              <div className="product-item-left">
                                <Package size={18} color="#64748b" />
                                <div>
                                  <p className="product-name">{product?.name || 'Unknown Product'}</p>
                                  <p className="product-quantity">Quantity: {item.quantity || 1}</p>
                                </div>
                              </div>
                              <div className="product-item-right">
                                <span className="product-price">{(product?.price || 0).toFixed(2)} TND</span>
                                <span className="product-price-label">per unit</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="order-modal-footer">
                  <div className="order-date-card">
                    <div className="order-date-header"><Clock size={18} color="#64748b" /><h4>CREATED</h4></div>
                    <p className="order-date-text">
                      {selectedOrder.originalOrder?.createdAt
                        ? new Date(selectedOrder.originalOrder.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="order-total-card">
                    <h4>TOTAL AMOUNT</h4>
                    <p className="order-total-amount">{selectedOrder.originalOrder?.totalAmount?.toFixed(2) || '0.00'} TND</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {selectedOrderForEdit && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseEditModal} className="order-modal-backdrop" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="edit-order-modal" onClick={(e) => e.stopPropagation()}
            >
              <div className="edit-order-header">
                <div><h2>Edit Order Status</h2><p className="edit-order-subtitle">Update the status of this order</p></div>
                <button onClick={handleCloseEditModal} className="order-modal-close"><X size={20} /></button>
              </div>
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
                    <div className="status-dropdown" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                      <div className="status-dropdown-selected">
                        <span className="status-dot" style={{ backgroundColor: statusOptions.find(opt => opt.value === selectedStatus)?.color || '#F59F0A' }} />
                        <span>{statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Pending'}</span>
                      </div>
                      <ChevronDown size={20} color="#94a3b8" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </div>
                    {isDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="status-dropdown-menu">
                        {statusOptions.map((option) => (
                          <div key={option.value} className={`status-dropdown-option ${selectedStatus === option.value ? 'selected' : ''}`} onClick={() => { setSelectedStatus(option.value); setIsDropdownOpen(false); }}>
                            <span className="status-dot" style={{ backgroundColor: option.color }} />
                            <span>{option.label}</span>
                            {selectedStatus === option.value && <Check size={18} color="#3b82f6" style={{ marginLeft: 'auto' }} />}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
              <div className="edit-order-footer">
                <button onClick={handleCloseEditModal} className="edit-order-cancel">Cancel</button>
                <button onClick={handleSaveOrderStatus} className="edit-order-save">Save Changes</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OederBord;