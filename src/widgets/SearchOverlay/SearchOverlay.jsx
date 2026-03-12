import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { searchProducts } from '../../features/search/searchProducts';
import styles from './SearchOverlay.module.css';

const SearchOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const popularProducts = [
    'iPhone 15',
    'MacBook Pro',
    'Apple Watch',
    'AirPods Pro',
  ];

  const handleSearchClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      const filtered = await searchProducts(value);
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return (
    <>
      <button className={styles.searchTriggerBtn} onClick={handleSearchClick}>
        <FiSearch size={20} />
        <span>Поиск</span>
      </button>

      {isOpen && (
        <div className={styles.searchOverlay} onClick={handleClose}>
          <div className={styles.searchOverlayContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchOverlayHeader}>
              <div className={styles.searchOverlayInputWrapper}>
                <FiSearch size={20} />
                <input
                  type="text"
                  placeholder="Поиск товаров"
                  className={styles.searchOverlayInput}
                  value={query}
                  onChange={handleSearchChange}
                  autoFocus
                />
              </div>
              <button className={styles.searchOverlayClose} onClick={handleClose}>
                ✕
              </button>
            </div>

            <div className={styles.searchOverlayBody}>
              {results.length > 0 ? (
                <div className={styles.searchResults}>
                  {results.map((product, index) => (
                    <div key={index} className={styles.searchResultItem}>
                      {product}
                    </div>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className={styles.searchEmpty}>Ничего не найдено</div>
              ) : (
                <div className={styles.popularProducts}>
                  <h3 className={styles.popularTitle}>Популярные товары</h3>
                  <div className={styles.popularList}>
                    {popularProducts.map((product, index) => (
                      <button
                        key={index}
                        className={styles.popularItem}
                        onClick={() => {
                          setQuery(product);
                          searchProducts(product).then(setResults);
                        }}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchOverlay;
