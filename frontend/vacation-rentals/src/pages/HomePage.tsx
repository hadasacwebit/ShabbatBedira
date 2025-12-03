import React, { useState, useEffect, useCallback } from 'react';
import { Apartment, ApartmentSearchParams, PagedResult } from '../types';
import { apartmentsApi } from '../services/api';
import SearchFilters from '../components/SearchFilters';
import ApartmentCard from '../components/ApartmentCard';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [filters, setFilters] = useState<ApartmentSearchParams>({ page: 1, pageSize: 12 });
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApartments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result: PagedResult<Apartment> = await apartmentsApi.search(filters);
      setApartments(result.items);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    } catch (err) {
      setError('שגיאה בטעינת הדירות. אנא נסה שוב.');
      console.error('Error fetching apartments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchCities = useCallback(async () => {
    try {
      const citiesList = await apartmentsApi.getCities();
      setCities(citiesList);
    } catch (err) {
      console.error('Error fetching cities:', err);
    }
  }, []);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleFilterChange = (newFilters: ApartmentSearchParams) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    fetchApartments();
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <h1>מצא את דירת הנופש המושלמת</h1>
        <p>חפש מבין מאות דירות נופש ברחבי הארץ</p>
      </header>

      <main className="main-content">
        <SearchFilters
          filters={filters}
          cities={cities}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>טוען דירות...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={fetchApartments} className="retry-btn">נסה שוב</button>
          </div>
        ) : apartments.length === 0 ? (
          <div className="no-results">
            <h3>לא נמצאו דירות</h3>
            <p>נסה לשנות את הסינון או לחפש מונח אחר</p>
          </div>
        ) : (
          <>
            <div className="results-header">
              <span>נמצאו {totalCount} דירות</span>
            </div>

            <div className="apartments-grid">
              {apartments.map((apartment) => (
                <ApartmentCard key={apartment.id} apartment={apartment} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                  className="page-btn"
                >
                  הקודם
                </button>
                <span className="page-info">
                  עמוד {filters.page} מתוך {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page === totalPages}
                  className="page-btn"
                >
                  הבא
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;
