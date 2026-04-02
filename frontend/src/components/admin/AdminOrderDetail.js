import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../utils/api';
import { formatPrice } from '../../utils/formatPrice';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCheck, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiTruck, FiPackage } from 'react-icons/fi';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Greška pri učitavanju porudžbine');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!window.confirm('Da li ste sigurni da želite da prihvatite ovu porudžbinu?')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await ordersAPI.updateStatus(id, { 
        status: 'accepted',
        adminNote: adminNote || undefined
      });
      toast.success('Porudžbina prihvaćena! Email je poslat kupcu.');
      fetchOrder();
    } catch (error) {
      toast.error('Greška pri prihvatanju porudžbine');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.warning('Unesite razlog odbijanja');
      return;
    }

    setActionLoading(true);
    try {
      await ordersAPI.updateStatus(id, { 
        status: 'rejected',
        rejectionReason: rejectionReason 
      });
      toast.success('Porudžbina odbijena. Email je poslat kupcu.');
      setShowRejectModal(false);
      fetchOrder();
    } catch (error) {
      toast.error('Greška pri odbijanju porudžbine');
    } finally {
      setActionLoading(false);
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

  if (!order) {
    return <div className="loading">Porudžbina nije pronađena</div>;
  }

  return (
    <div className="admin-order-detail">
      <button className="back-btn" onClick={() => navigate('/admin/orders')}>
        <FiArrowLeft /> Nazad na porudžbine
      </button>

      <div className="order-detail-header">
        <div className="order-title">
          <h1>Porudžbina #{order.orderNumber}</h1>
          <span className={`status-badge ${order.status}`}>
            {getStatusText(order.status)}
          </span>
        </div>
        <div className="order-date">
          {new Date(order.createdAt).toLocaleDateString('sr-RS', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <div className="order-detail-grid">
        {/* Kupac */}
        <div className="detail-card">
          <h3><FiUser /> Informacije o kupcu</h3>
          <div className="detail-content">
            <p><strong>Ime i prezime:</strong> {order.customer.firstName} {order.customer.lastName}</p>
            <p><FiMail /> <a href={`mailto:${order.customer.email}`}>{order.customer.email}</a></p>
            <p><FiPhone /> <a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></p>
          </div>
        </div>

        {/* Dostava */}
        <div className="detail-card">
          <h3>{order.deliveryMethod === 'pickup' ? <FiMapPin /> : <FiTruck />} Način preuzimanja</h3>
          <div className="detail-content">
            {order.deliveryMethod === 'pickup' ? (
              <>
                <p className="delivery-type">📦 Preuzimanje u butiku</p>
                <p className="store-info">Generala Ljubomira Milića 1, Beograd 11000</p>
                <p className="store-info">Pon - Sub: 10:00 - 20:00</p>
              </>
            ) : (
              <>
                <p className="delivery-type">🚚 Dostava brzom poštom</p>
                {order.shippingAddress && (
                  <div className="shipping-address">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    {order.shippingAddress.note && (
                      <p className="address-note">Napomena: {order.shippingAddress.note}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Artikli */}
        <div className="detail-card full-width">
          <h3><FiPackage /> Poručeni artikli</h3>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                {item.image && (
                  <img src={item.image} alt={item.name} className="item-image" />
                )}
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>Veličina: <strong>{item.size}</strong> {item.color && `| Boja: ${item.color}`}</p>
                  <p>Količina: <strong>{item.quantity}</strong></p>
                </div>
                <div className="item-price">
                  <span className="unit-price">{formatPrice(item.price)}</span>
                  <span className="total-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Međuzbir:</span>
              <span>{formatPrice(order.totalAmount - (order.shippingCost || 0))}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="summary-row">
                <span>Dostava:</span>
                <span>{formatPrice(order.shippingCost)}</span>
              </div>
            )}
            {order.giftWrap && (
              <div className="summary-row">
                <span>🎁 Poklon pakovanje:</span>
                <span>{formatPrice(200)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>UKUPNO:</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Admin napomena - samo za pending */}
        {order.status === 'pending' && (
          <div className="detail-card full-width">
            <h3>Napomena za kupca (opciono)</h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Unesite napomenu koja će biti poslata kupcu..."
              rows={3}
            />
          </div>
        )}

        {/* Razlog odbijanja - ako je odbijena */}
        {order.status === 'rejected' && order.rejectionReason && (
          <div className="detail-card full-width rejected-info">
            <h3>Razlog odbijanja</h3>
            <p>{order.rejectionReason}</p>
          </div>
        )}

        {/* Admin napomena - ako je prihvaćena */}
        {order.status === 'accepted' && order.adminNote && (
          <div className="detail-card full-width accepted-info">
            <h3>Napomena za kupca</h3>
            <p>{order.adminNote}</p>
          </div>
        )}
      </div>

      {/* Akcije - samo za pending */}
      {order.status === 'pending' && (
        <div className="order-actions">
          <button 
            className="btn btn-accept" 
            onClick={handleAccept}
            disabled={actionLoading}
          >
            <FiCheck /> {actionLoading ? 'Prihvatanje...' : 'Prihvati porudžbinu'}
          </button>
          <button 
            className="btn btn-reject" 
            onClick={() => setShowRejectModal(true)}
            disabled={actionLoading}
          >
            <FiX /> Odbij porudžbinu
          </button>
        </div>
      )}

      {/* Modal za odbijanje */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Odbij porudžbinu</h3>
              <button className="close-modal" onClick={() => setShowRejectModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <label>Razlog odbijanja *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Unesite razlog zbog kog odbijate porudžbinu..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={() => setShowRejectModal(false)}
              >
                Otkaži
              </button>
              <button 
                className="btn btn-reject" 
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? 'Odbijanje...' : 'Odbij porudžbinu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetail;