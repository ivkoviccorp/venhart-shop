import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'react-toastify';
import { FiEye, FiClock, FiCheck, FiX, FiPackage, FiTruck, FiMapPin, FiTrash2 } from 'react-icons/fi';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await ordersAPI.getAll(params);
      setOrders(response.data.orders);
      setPendingCount(response.data.pendingCount);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Greška pri učitavanju porudžbina');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Da li ste sigurni da želite da obrišete porudžbinu ${orderNumber}?`)) {
      return;
    }

    try {
      await ordersAPI.delete(orderId);
      toast.success(`Porudžbina ${orderNumber} obrisana!`);
      fetchOrders();
    } catch (error) {
      toast.error('Greška pri brisanju porudžbine');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock />;
      case 'accepted':
        return <FiCheck />;
      case 'rejected':
        return <FiX />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    const statuses = {
      pending: 'Na čekanju',
      accepted: 'Prihvaćena',
      rejected: 'Odbijena',
      shipped: 'Poslata',
      delivered: 'Isporučena',
      cancelled: 'Otkazana'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h1 className="admin-page-title">
          Porudžbine ({orders.length})
          {pendingCount > 0 && (
            <span className="pending-badge">{pendingCount} na čekanju</span>
          )}
        </h1>
      </div>

      <div className="orders-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Sve
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Na čekanju {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Prihvaćene
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Odbijene
        </button>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <FiPackage size={60} />
            <p>Nema porudžbina za prikaz</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className={`order-card status-${order.status}`}>
              <div className="order-card-header">
                <span className="order-number">#{order.orderNumber}</span>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('sr-RS', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-info-group">
                  <label>Kupac</label>
                  <span>{order.customer.firstName} {order.customer.lastName}</span>
                </div>

                <div className="order-info-group">
                  <label>Kontakt</label>
                  <span>{order.customer.email}</span>
                  <span>{order.customer.phone}</span>
                </div>

                <div className="order-info-group">
                  <label>Artikli</label>
                  <span>{order.items.length} artikal(a)</span>
                </div>

                <div className="order-info-group">
                  <label>Ukupno</label>
                  <span className="order-total">{formatPrice(order.totalAmount)}</span>
                </div>

                <div className="order-info-group">
                  <label>Dostava</label>
                  <span className={`delivery-badge ${order.deliveryMethod}`}>
                    {order.deliveryMethod === 'pickup' ? (
                      <><FiMapPin /> Preuzimanje</>
                    ) : (
                      <><FiTruck /> Dostava</>
                    )}
                  </span>
                </div>
              </div>

              <div className="order-card-footer">
                <span className={`status-badge ${order.status}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </span>
                
                <div className="order-actions">
                  <Link 
                    to={`/admin/orders/${order._id}`} 
                    className="view-order-btn"
                  >
                    <FiEye /> Pogledaj detalje
                  </Link>
                  <button 
                    className="delete-order-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteOrder(order._id, order.orderNumber);
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;