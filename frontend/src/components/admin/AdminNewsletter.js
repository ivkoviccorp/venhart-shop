import React, { useEffect, useState } from 'react';
import { newsletterAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { FiMail, FiTrash2 } from 'react-icons/fi';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await newsletterAPI.getAll();
      setSubscribers(response.data.subscribers);
    } catch (error) {
      toast.error('Greška pri učitavanju newsletter prijava');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Da li ste sigurni da želite da obrišete ovaj email?')) {
      return;
    }

    try {
      await newsletterAPI.delete(id);
      toast.success('Email obrisan');
      fetchSubscribers();
    } catch (error) {
      toast.error('Greška pri brisanju emaila');
    }
  };

  if (loading) {
    return <div className="loading">Učitavanje...</div>;
  }

  return (
    <div className="admin-newsletter">
      <h1 className="admin-page-title">Newsletter prijave</h1>

      <div className="settings-section">
        <h2><FiMail /> Ukupno prijavljenih: {subscribers.length}</h2>

        {subscribers.length === 0 ? (
          <p>Nema prijavljenih email adresa.</p>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Datum prijave</th>
                  <th>Akcija</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td>{subscriber.email}</td>
                    <td>
                      {new Date(subscriber.createdAt).toLocaleDateString('sr-RS', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(subscriber._id)}
                        title="Obriši"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;