import React from 'react';
import { Apartment } from '../types';
import './ApartmentCard.css';

interface ApartmentCardProps {
  apartment: Apartment;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onPay?: () => void;
  isPaid?: boolean;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  onClick,
  showActions,
  onEdit,
  onDelete,
  onPay,
  isPaid = true,
}) => {
  const defaultImage = 'https://via.placeholder.com/300x200?text=דירת+נופש';

  return (
    <div className="apartment-card" onClick={onClick}>
      <div className="apartment-image-container">
        <img
          src={apartment.imageUrl || defaultImage}
          alt={apartment.title}
          className="apartment-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        {!isPaid && <div className="payment-badge">ממתין לתשלום</div>}
        {!apartment.isActive && isPaid && <div className="inactive-badge">לא פעיל</div>}
      </div>
      
      <div className="apartment-content">
        <h3 className="apartment-title">{apartment.title}</h3>
        <p className="apartment-city">{apartment.city}</p>
        <p className="apartment-address">{apartment.address}</p>
        
        <div className="apartment-details">
          <span className="detail">🛏️ {apartment.numberOfBeds} מיטות</span>
          <span className="detail">🚪 {apartment.numberOfRooms} חדרים</span>
        </div>
        
        <div className="apartment-footer">
          <span className="apartment-price">₪{apartment.pricePerNight} / לילה</span>
          {apartment.contactPhone && (
            <span className="apartment-phone">📞 {apartment.contactPhone}</span>
          )}
        </div>

        {showActions && (
          <div className="apartment-actions" onClick={(e) => e.stopPropagation()}>
            {!isPaid && onPay && (
              <button onClick={onPay} className="action-btn pay-btn">
                שלם ₪10
              </button>
            )}
            {onEdit && (
              <button onClick={onEdit} className="action-btn edit-btn">
                עריכה
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="action-btn delete-btn">
                מחיקה
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApartmentCard;
