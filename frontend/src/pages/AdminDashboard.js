import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, productsAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { 
  FiHome, 
  FiShoppingBag, 
  FiPackage, 
  FiLogOut,
  FiTrendingUp,
  FiDollarSign,
  FiClock,
  FiSettings,
  FiTrash2,
  FiAlertTriangle,
  FiRefreshCw
} from 'react-icons/fi';
import './AdminDashboard.css';

// Admin Components
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminOrderDetail from '../components/admin/AdminOrderDetail';

const AdminDashboard = () => {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sačekaj da se auth učita
    if (authLoading) return;
    
    if (!user || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [user, isAdmin, navigate, authLoading]);

  const fetchStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Čekaj auth
  if (authLoading) {
    return <div className="loading">Učitavanje...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>VENHART</h2>
          <p>ADMIN</p>
        </div>

        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link">
            <FiHome /> Kontrolna tabla
          </Link>
          <Link to="/admin/products" className="admin-nav-link">
            <FiShoppingBag /> Proizvodi
          </Link>
          <Link to="/admin/orders" className="admin-nav-link">
            <FiPackage /> Porudžbine
          </Link>
          <Link to="/admin/settings" className="admin-nav-link">
            <FiSettings /> Podešavanja
          </Link>
        </nav>

        <div className="admin-user">
          <p>{user.name}</p>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut /> Odjavi se
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<DashboardHome stats={stats} loading={loading} onRefresh={fetchStats} />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/orders/:id" element={<AdminOrderDetail />} />
          <Route path="/settings" element={<AdminSettings onRefresh={fetchStats} />} />
        </Routes>
      </main>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ stats, loading, onRefresh }) => {
  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1 className="admin-page-title">Kontrolna tabla</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock size={30} />
          </div>
          <div className="stat-info">
            <h3>Porudžbine na čekanju</h3>
            <p className="stat-number">{stats?.pendingOrders || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">
            <FiPackage size={30} />
          </div>
          <div className="stat-info">
            <h3>Ukupno porudžbina</h3>
            <p className="stat-number">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accepted">
            <FiTrendingUp size={30} />
          </div>
          <div className="stat-info">
            <h3>Prihvaćene porudžbine</h3>
            <p className="stat-number">{stats?.acceptedOrders || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue">
            <FiDollarSign size={30} />
          </div>
          <div className="stat-info">
            <h3>Ukupan prihod</h3>
            <p className="stat-number">{stats?.totalRevenue?.toLocaleString() || 0} RSD</p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <h2>Poslednje porudžbine</h2>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Broj</th>
                  <th>Kupac</th>
                  <th>Iznos</th>
                  <th>Status</th>
                  <th>Datum</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customer.firstName} {order.customer.lastName}</td>
                    <td>{order.totalAmount.toLocaleString()} RSD</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status === 'pending' && 'Na čekanju'}
                        {order.status === 'accepted' && 'Prihvaćena'}
                        {order.status === 'rejected' && 'Odbijena'}
                        {order.status === 'shipped' && 'Poslata'}
                        {order.status === 'delivered' && 'Isporučena'}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('sr-RS')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">Nema porudžbina</p>
        )}
      </div>
    </div>
  );
};

// Settings Component
const AdminSettings = ({ onRefresh }) => {
  const [deletingOrders, setDeletingOrders] = useState(false);
  const [deletingProducts, setDeletingProducts] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteOrdersModal, setShowDeleteOrdersModal] = useState(false);
  const [showDeleteProductsModal, setShowDeleteProductsModal] = useState(false);

  const handleDeleteAllOrders = async () => {
    if (confirmText !== 'OBRIŠI SVE') {
      toast.error('Morate ukucati "OBRIŠI SVE" za potvrdu');
      return;
    }

    setDeletingOrders(true);
    try {
      await ordersAPI.deleteAll();
      toast.success('Sve porudžbine su obrisane!');
      setShowDeleteOrdersModal(false);
      setConfirmText('');
      onRefresh();
    } catch (error) {
      toast.error('Greška pri brisanju porudžbina');
    } finally {
      setDeletingOrders(false);
    }
  };

  const handleDeleteAllProducts = async () => {
    if (confirmText !== 'OBRIŠI SVE') {
      toast.error('Morate ukucati "OBRIŠI SVE" za potvrdu');
      return;
    }

    setDeletingProducts(true);
    try {
      const response = await productsAPI.getAllAdmin();
      const products = response.data.products;
      
      for (const product of products) {
        await productsAPI.delete(product._id);
      }
      
      toast.success('Svi proizvodi su obrisani!');
      setShowDeleteProductsModal(false);
      setConfirmText('');
    } catch (error) {
      toast.error('Greška pri brisanju proizvoda');
    } finally {
      setDeletingProducts(false);
    }
  };

  return (
    <div className="admin-settings">
      <h1 className="admin-page-title">Podešavanja</h1>

      <div className="settings-section">
        <h2><FiRefreshCw /> Osvežavanje podataka</h2>
        <p>Osvežite statistiku kontrolne table.</p>
        <button className="btn btn-refresh" onClick={onRefresh}>
          <FiRefreshCw /> Osveži podatke
        </button>
      </div>

      <div className="settings-section danger-zone">
        <h2><FiAlertTriangle /> Opasna zona</h2>
        <p className="danger-warning">
          ⚠️ Ove akcije su nepovratne! Koristite samo ako želite da resetujete sistem.
        </p>

        <div className="danger-actions">
          <div className="danger-action">
            <div className="danger-info">
              <h3><FiTrash2 /> Obriši sve porudžbine</h3>
              <p>Trajno briše sve porudžbine iz sistema. Ovo ne može da se poništi.</p>
            </div>
            <button 
              className="btn btn-danger" 
              onClick={() => setShowDeleteOrdersModal(true)}
            >
              Obriši porudžbine
            </button>
          </div>

          <div className="danger-action">
            <div className="danger-info">
              <h3><FiTrash2 /> Obriši sve proizvode</h3>
              <p>Trajno briše sve proizvode iz sistema. Ovo ne može da se poništi.</p>
            </div>
            <button 
              className="btn btn-danger" 
              onClick={() => setShowDeleteProductsModal(true)}
            >
              Obriši proizvode
            </button>
          </div>
        </div>
      </div>

      {/* Delete Orders Modal */}
      {showDeleteOrdersModal && (
        <div className="modal-overlay">
          <div className="modal-content danger-modal">
            <div className="modal-header">
              <h3><FiAlertTriangle /> Potvrda brisanja</h3>
            </div>
            <div className="modal-body">
              <p>Da li ste sigurni da želite da obrišete <strong>SVE PORUDŽBINE</strong>?</p>
              <p className="warning-text">Ova akcija je nepovratna!</p>
              <div className="confirm-input">
                <label>Ukucajte <strong>OBRIŠI SVE</strong> za potvrdu:</label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="OBRIŠI SVE"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={() => {
                  setShowDeleteOrdersModal(false);
                  setConfirmText('');
                }}
              >
                Otkaži
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteAllOrders}
                disabled={deletingOrders || confirmText !== 'OBRIŠI SVE'}
              >
                {deletingOrders ? 'Brisanje...' : 'Obriši sve porudžbine'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Products Modal */}
      {showDeleteProductsModal && (
        <div className="modal-overlay">
          <div className="modal-content danger-modal">
            <div className="modal-header">
              <h3><FiAlertTriangle /> Potvrda brisanja</h3>
            </div>
            <div className="modal-body">
              <p>Da li ste sigurni da želite da obrišete <strong>SVE PROIZVODE</strong>?</p>
              <p className="warning-text">Ova akcija je nepovratna!</p>
              <div className="confirm-input">
                <label>Ukucajte <strong>OBRIŠI SVE</strong> za potvrdu:</label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="OBRIŠI SVE"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-cancel" 
                onClick={() => {
                  setShowDeleteProductsModal(false);
                  setConfirmText('');
                }}
              >
                Otkaži
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteAllProducts}
                disabled={deletingProducts || confirmText !== 'OBRIŠI SVE'}
              >
                {deletingProducts ? 'Brisanje...' : 'Obriši sve proizvode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;