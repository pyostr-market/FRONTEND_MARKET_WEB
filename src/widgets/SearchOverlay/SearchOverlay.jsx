import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '../../features/search/searchProducts';
import useProductTypes from '../../shared/hooks/useProductTypes';
import LazyImage from '../../shared/ui/LazyImage';
import styles from './SearchOverlay.module.css';

const SearchOverlay = ({ variant = 'desktop' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Загрузка типов товаров
  const { productTypes, loading: typesLoading } = useProductTypes();

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
    if (query && query.trim()) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        const filtered = await searchProducts(query);
        setResults(filtered);
        setIsSearching(false);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
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

  /**
   * Первое нажатие — открывает меню
   */
  const handleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  /**
   * Клик по полю ввода — ставит фокус
   */
  const handleInputClick = () => {
    inputRef.current?.focus();
  };

  const handlePopularClick = (product) => {
    setQuery(product);
    // Ставим фокус на поле ввода, чтобы пользователь мог продолжить поиск
    inputRef.current?.focus();
  };

  /**
   * Клик по типу товара
   */
  const handleProductTypeClick = useCallback((typeId) => {
    navigate(`/catalog?product_type=${typeId}`);
    setIsOpen(false);
  }, [navigate]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
  };

  /**
   * Кнопка "Отмена" — закрывает меню и сбрасывает query
   */
  const handleCancel = () => {
    handleClose();
  };

  const showMobile = variant === 'mobile';
  const showDesktop = variant === 'desktop';

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <FiSearch className={styles.searchIcon} strokeWidth={3} />
          
          {showMobile && !isOpen ? (
            // Кнопка для мобильной версии (пока не открыта)
            <button
              className={styles.searchButton}
              onClick={handleOpen}
              type="button"
            >
              Поиск
            </button>
          ) : (
            // Поле ввода (для десктопа или для мобильной версии после открытия)
            <input
              ref={inputRef}
              type="text"
              placeholder={showDesktop ? "Поиск товаров" : "Поиск"}
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={handleInputClick}
            />
          )}
          
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
              ) : query && query.trim() ? (
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
                <button className={styles.cancelBtn} onClick={handleCancel}>
                  Отмена
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
                ) : query && query.trim() ? (
                  <div className={styles.searchEmpty}>
                    <p>Ничего не найдено по запросу "{query}"</p>
                  </div>
                ) : (
                  <>
                    {/* Популярные товары */}
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

                    {/* Типы товаров */}
                    <div className={styles.productTypesSection}>
                      <h3 className={styles.productTypesTitle}>Категории</h3>
                      {typesLoading ? (
                        <div className={styles.typesLoading}>Загрузка...</div>
                      ) : (
                        <div className={styles.productTypesGrid}>
                          {productTypes.map((type) => (
                            <button
                              key={type.id}
                              className={styles.productTypeCard}
                              onClick={() => handleProductTypeClick(type.id)}
                            >
                              <div className={styles.typeImage}>
                                <LazyImage
                                  src={type.image?.image_url || null}
                                  alt={type.name}
                                  className={styles.typeImage}
                                />
                              </div>
                              <span className={styles.typeName}>{type.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
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
