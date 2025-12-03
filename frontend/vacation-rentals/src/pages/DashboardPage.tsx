import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apartmentsApi, paymentsApi } from '../services/api';
import { Apartment } from '../types';
import ApartmentCard from '../components/ApartmentCard';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<number | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMyApartments = async () => {
    try {
      setIsLoading(true);
      const data = await apartmentsApi.getMyApartments();
      setApartments(data);
    } catch (err) {
      setError('שגיאה בטעינת הדירות שלך');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApartments();
  }, []);

  const handleEdit = (apartment: Apartment) => {
    navigate(`/edit-apartment/${apartment.id}`);
  };

  const handleDelete = async (apartment: Apartment) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק דירה זו?')) {
      return;
    }

    try {
      await apartmentsApi.delete(apartment.id);
      setApartments(apartments.filter(a => a.id !== apartment.id));
    } catch (err) {
      alert('שגיאה במחיקת הדירה');
      console.error(err);
    }
  };

  const handlePay = async (apartment: Apartment) => {
    try {
      setPaymentLoading(apartment.id);
      
      // For development - simulate payment
      const response = await paymentsApi.simulatePayment(apartment.id);
      
      if (response.success) {
        alert('התשלום בוצע בהצלחה! הדירה פעילה כעת.');
        fetchMyApartments();
      } else {
        // If simulation is disabled, try real payment
        const paymentResponse = await paymentsApi.createPayment(apartment.id);
        if (paymentResponse.success && paymentResponse.paymentUrl) {
          window.location.href = paymentResponse.paymentUrl;
        } else {
          alert(paymentResponse.errorMessage || 'שגיאה ביצירת התשלום');
        }
      }
    } catch (err: any) {
      // If 404, try real payment
      if (err.response?.status === 404) {
        try {
          const paymentResponse = await paymentsApi.createPayment(apartment.id);
          if (paymentResponse.success && paymentResponse.paymentUrl) {
            window.location.href = paymentResponse.paymentUrl;
          } else {
            alert(paymentResponse.errorMessage || 'שגיאה ביצירת התשלום');
          }
        } catch (payErr) {
          alert('שגיאה בתהליך התשלום');
          console.error(payErr);
        }
      } else {
        alert('שגיאה בתהליך התשלום');
        console.error(err);
      }
    } finally {
      setPaymentLoading(null);
    }
  };

  const paidApartments = apartments.filter(a => a.isActive);
  const unpaidApartments = apartments.filter(a => !a.isActive);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>האזור האישי שלי</h1>
        <p>שלום, {user?.name}</p>
      </div>

      <div className="dashboard-content">
        <div className="section-header">
          <h2>הדירות שלי</h2>
          <button onClick={() => navigate('/add-apartment')} className="add-btn">
            + הוסף דירה חדשה
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>טוען...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchMyApartments} className="retry-btn">נסה שוב</button>
          </div>
        ) : apartments.length === 0 ? (
          <div className="no-apartments">
            <h3>אין לך דירות עדיין</h3>
            <p>הוסף דירה חדשה כדי להתחיל לפרסם</p>
            <button onClick={() => navigate('/add-apartment')} className="add-btn">
              + הוסף דירה ראשונה
            </button>
          </div>
        ) : (
          <>
            {unpaidApartments.length > 0 && (
              <div className="apartments-section">
                <h3>ממתינות לתשלום</h3>
                <p className="section-note">לאחר תשלום של ₪10, הדירה תופיע בחיפוש</p>
                <div className="apartments-grid">
                  {unpaidApartments.map((apartment) => (
                    <ApartmentCard
                      key={apartment.id}
                      apartment={apartment}
                      showActions
                      isPaid={false}
                      isPaymentLoading={paymentLoading === apartment.id}
                      onEdit={() => handleEdit(apartment)}
                      onDelete={() => handleDelete(apartment)}
                      onPay={() => handlePay(apartment)}
                    />
                  ))}
                </div>
              </div>
            )}

            {paidApartments.length > 0 && (
              <div className="apartments-section">
                <h3>דירות פעילות</h3>
                <div className="apartments-grid">
                  {paidApartments.map((apartment) => (
                    <ApartmentCard
                      key={apartment.id}
                      apartment={apartment}
                      showActions
                      isPaid={true}
                      onEdit={() => handleEdit(apartment)}
                      onDelete={() => handleDelete(apartment)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
