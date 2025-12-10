import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apartmentsApi } from '../services/api';
import { CreateApartmentDto } from '../types';
import './ApartmentFormPage.css';

const AddApartmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CreateApartmentDto>({
    title: '',
    description: '',
    address: '',
    city: '',
    pricePerNight: 0,
    numberOfBeds: 1,
    numberOfRooms: 1,
    imageUrl: '',
    contactPhone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apartmentsApi.create(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בהוספת הדירה');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="apartment-form-page">
      <div className="form-container">
        <h2>הוספת דירה חדשה</h2>
        <p className="form-note">לאחר הוספת הדירה, יש לשלם ₪10 כדי שתופיע בחיפוש</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="apartment-form">
          <div className="form-group">
            <label htmlFor="title">שם הדירה *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={200}
              placeholder="לדוגמה: דירת נופש מפנקת בתל אביב"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">תיאור *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="תארו את הדירה, המתקנים והאווירה..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">עיר *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="תל אביב"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">כתובת *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="רחוב הירקון 100"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pricePerNight">מחיר ללילה (₪) *</label>
              <input
                type="number"
                id="pricePerNight"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleChange}
                required
                min={0}
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfBeds">מספר מיטות *</label>
              <input
                type="number"
                id="numberOfBeds"
                name="numberOfBeds"
                value={formData.numberOfBeds}
                onChange={handleChange}
                required
                min={1}
                max={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberOfRooms">מספר חדרים *</label>
              <input
                type="number"
                id="numberOfRooms"
                name="numberOfRooms"
                value={formData.numberOfRooms}
                onChange={handleChange}
                required
                min={1}
                max={20}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">קישור לתמונה</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone">טלפון ליצירת קשר</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="050-1234567"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
              ביטול
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'שומר...' : 'הוסף דירה'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApartmentPage;
