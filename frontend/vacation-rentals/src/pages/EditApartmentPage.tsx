import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apartmentsApi } from '../services/api';
import { UpdateApartmentDto } from '../types';
import './ApartmentFormPage.css';

const EditApartmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<UpdateApartmentDto>({
    title: '',
    description: '',
    address: '',
    city: '',
    pricePerNight: 0,
    numberOfBeds: 1,
    numberOfRooms: 1,
    imageUrl: '',
    contactPhone: '',
    isActive: true,
  });

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const apartment = await apartmentsApi.getById(Number(id));
        setFormData({
          title: apartment.title,
          description: apartment.description,
          address: apartment.address,
          city: apartment.city,
          pricePerNight: apartment.pricePerNight,
          numberOfBeds: apartment.numberOfBeds,
          numberOfRooms: apartment.numberOfRooms,
          imageUrl: apartment.imageUrl || '',
          contactPhone: apartment.contactPhone || '',
          isActive: apartment.isActive,
        });
      } catch (err) {
        setError('שגיאה בטעינת הדירה');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchApartment();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const inputElement = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : 
              type === 'checkbox' ? inputElement.checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await apartmentsApi.update(Number(id), formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'שגיאה בעדכון הדירה');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="apartment-form-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apartment-form-page">
      <div className="form-container">
        <h2>עריכת דירה</h2>

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
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              דירה פעילה (מופיעה בחיפוש)
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/dashboard')} className="cancel-btn">
              ביטול
            </button>
            <button type="submit" className="submit-btn" disabled={isSaving}>
              {isSaving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditApartmentPage;
