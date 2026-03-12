import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchProducts } from '../../features/search/searchProducts';
import styles from './SearchOverlay.module.css';

const SearchOverlay = ({ variant = 'desktop' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const popularProducts = [
    'iPhone 15',
    'Samsung Galaxy S24',
    'MacBook Pro',
    'Apple Watch',
    'AirPods Pro',
    'Sony PlayStation 5',
    'Xiaomi Redmi Note 13',
    'Tesla Model Y',
  ];

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        const filtered = await searchProducts(query);
        setResults(filtered);
        setIsSearching(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handlePopularClick = (product) => {
    setQuery(product);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const showMobile = variant === 'mobile';
  const showDesktop = variant === 'desktop';

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <FiSearch size={18} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder={showDesktop ? "Поиск товаров" : "Поиск"}
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
          />
          {query && (
            <button className={styles.clearBtn} onClick={handleClear}>
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <>
          {showDesktop && (
            <div className={styles.desktopDropdown}>
              {isSearching ? (
                <div className={styles.searchLoading}>Поиск...</div>
              ) : results.length > 0 ? (
                <div className={styles.searchResults}>
                  <h3 className={styles.resultsTitle}>Результаты поиска</h3>
                  {results.map((product, index) => (
                    <button
                      key={index}
                      className={styles.searchResultItem}
                      onClick={() => {
                        setQuery(product);
                        setIsOpen(false);
                      }}
                    >
                      {product}
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className={styles.searchEmpty}>
                  <p>Ничего не найдено по запросу "{query}"</p>
                </div>
              ) : (
                <div className={styles.popularProducts}>
                  <h3 className={styles.popularTitle}>Популярные товары</h3>
                  <div className={styles.popularList}>
                    {popularProducts.map((product, index) => (
                      <button
                        key={index}
                        className={styles.popularItem}
                        onClick={() => handlePopularClick(product)}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showMobile && (
            <div className={styles.mobileDropdown}>
              <div className={styles.mobileHeader}>
                <span className={styles.mobileTitle}>Поиск</span>
                <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                  Готово
                </button>
              </div>

              <div className={styles.dropdownBody}>
                {isSearching ? (
                  <div className={styles.searchLoading}>Поиск...</div>
                ) : results.length > 0 ? (
                  <div className={styles.searchResults}>
                    {results.map((product, index) => (
                      <button
                        key={index}
                        className={styles.searchResultItem}
                        onClick={() => {
                          setQuery(product);
                          setIsOpen(false);
                        }}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                ) : query.trim() ? (
                  <div className={styles.searchEmpty}>
                    <p>Ничего не найдено по запросу "{query}"</p>
                  </div>
                ) : (
                  <div className={styles.popularProducts}>
                    <h3 className={styles.popularTitle}>Популярные товары</h3>
                    <div className={styles.popularList}>
                      {popularProducts.map((product, index) => (
                        <button
                          key={index}
                          className={styles.popularItem}
                          onClick={() => handlePopularClick(product)}
                        >
                          {product}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchOverlay;
