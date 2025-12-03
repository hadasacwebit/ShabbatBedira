import React from 'react';
import { ApartmentSearchParams } from '../types';
import './SearchFilters.css';

interface SearchFiltersProps {
  filters: ApartmentSearchParams;
  cities: string[];
  onFilterChange: (filters: ApartmentSearchParams) => void;
  onSearch: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  cities,
  onFilterChange,
  onSearch,
}) => {
  const handleInputChange = (field: keyof ApartmentSearchParams, value: string | number | undefined) => {
    onFilterChange({ ...filters, [field]: value, page: 1 });
  };

  const handleReset = () => {
    onFilterChange({ page: 1, pageSize: 10 });
  };

  return (
    <div className="search-filters">
      <div className="search-row">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="חיפוש לפי כתובת, עיר או שם..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            className="search-input"
          />
        </div>
        
        <select
          value={filters.city || ''}
          onChange={(e) => handleInputChange('city', e.target.value || undefined)}
          className="filter-select"
        >
          <option value="">כל הערים</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <button onClick={onSearch} className="search-btn">
          🔍 חיפוש
        </button>
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label>מחיר ללילה (₪)</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="מינימום"
              value={filters.minPrice || ''}
              onChange={(e) => handleInputChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="filter-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="מקסימום"
              value={filters.maxPrice || ''}
              onChange={(e) => handleInputChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>מספר מיטות</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="מינימום"
              value={filters.minBeds || ''}
              onChange={(e) => handleInputChange('minBeds', e.target.value ? Number(e.target.value) : undefined)}
              className="filter-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="מקסימום"
              value={filters.maxBeds || ''}
              onChange={(e) => handleInputChange('maxBeds', e.target.value ? Number(e.target.value) : undefined)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>מספר חדרים</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="מינימום"
              value={filters.minRooms || ''}
              onChange={(e) => handleInputChange('minRooms', e.target.value ? Number(e.target.value) : undefined)}
              className="filter-input"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="מקסימום"
              value={filters.maxRooms || ''}
              onChange={(e) => handleInputChange('maxRooms', e.target.value ? Number(e.target.value) : undefined)}
              className="filter-input"
            />
          </div>
        </div>

        <button onClick={handleReset} className="reset-btn">
          איפוס
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;
