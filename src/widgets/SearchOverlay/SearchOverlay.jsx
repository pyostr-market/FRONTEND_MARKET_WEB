import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { searchProducts } from '../../features/search/searchProducts';
import useProductTypes from '../../shared/hooks/useProductTypes';
import LazyImage from '../../shared/ui/LazyImage';
import SearchSuggestions from './SearchSuggestions';
import styles from './SearchOverlay.module.css';

const SearchOverlay = ({ variant = 'desktop' }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ items: [], suggestions: [], total: 0 });
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

  const showMobile = variant === 'mobile';
  const showDesktop = variant === 'desktop';

  // Debounced поиск с задержкой 300мс
  useEffect(() => {
    if (!query || !query.trim()) {
      setSearchResults({ items: [], suggestions: [], total: 0 });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await searchProducts(query, 10, 0);
        if (response.success && response.data) {
          setSearchResults({
            items: response.data.items || [],
            suggestions: response.data.suggestions || [],
            total: response.data.total || 0,
          });
        } else {
          setSearchResults({ items: [], suggestions: [], total: 0 });
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ items: [], suggestions: [], total: 0 });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (showDesktop) {
          // На десктопе закрываем и очищаем запрос
          setIsOpen(false);
          setQuery('');
          setSearchResults({ items: [], suggestions: [], total: 0 });
        } else {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, showDesktop]);

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
    setSearchResults({ items: [], suggestions: [], total: 0 });
  };

  const handleSuggestionClick = useCallback((word) => {
    const newQuery = query.trim() ? query.trim() + ' ' + word : word;
    setQuery(newQuery);
    inputRef.current?.focus();
  }, [query]);

  const handleProductClick = useCallback(() => {
    handleClose();
  }, []);

  const handleCategoryClose = useCallback(() => {
    handleClose();
  }, []);

  // Алгоритм релевантности: выбираем категорию, максимально подходящую запросу
  const findMostRelevantCategory = useCallback((items, queryText) => {
    if (!items || items.length === 0) return null;
    if (!queryText || !queryText.trim()) return null;

    const normalizedQuery = queryText.trim().toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

    // Собираем уникальные категории
    const categoryMap = new Map();
    items.forEach((item) => {
      if (item.category && !categoryMap.has(item.category.id)) {
        categoryMap.set(item.category.id, item.category);
      }
    });

    if (categoryMap.size === 0) return null;

    let bestCategory = null;
    let bestScore = -Infinity;

    categoryMap.forEach((category) => {
      const normalizedName = category.name.toLowerCase().trim();

      // 1. Точное совпадение — максимальный приоритет
      if (normalizedName === normalizedQuery) {
        bestScore = Infinity;
        bestCategory = category;
        return;
      }

      // 2. Считаем сколько слов запроса найдено в категории
      let wordsMatched = 0;
      for (const word of queryWords) {
        if (normalizedName.includes(word)) {
          wordsMatched++;
        }
      }

      // Не все слова найдены — пропускаем
      if (wordsMatched < queryWords.length) return;

      // 3. Все слова найдены — считаем score
      // Чем короче лишняя часть категории, тем лучше
      const lengthDiff = normalizedName.length - normalizedQuery.length;
      // Бонус если категория начинается с запроса
      const startsWithBonus = normalizedName.startsWith(normalizedQuery) ? 100 : 0;
      // Бонус за полное совпадение отдельных слов
      const exactWordBonus = queryWords.filter((w) => {
        // Слово целиком присутствует в названии (по границам)
        const regex = new RegExp(`\\b${w}\\b`, 'i');
        return regex.test(category.name);
      }).length * 50;

      const score = 1000 - lengthDiff + startsWithBonus + exactWordBonus;

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    });

    return bestCategory;
  }, []);

  // Обработчик Enter — открывает страницу каталога
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      const relevantCategory = findMostRelevantCategory(searchResults.items, query);
      if (relevantCategory) {
        navigate(`/catalog?category=${relevantCategory.id}`);
      } else {
        navigate(`/catalog?q=${encodeURIComponent(query.trim())}`);
      }
      // Закрываем с небольшой задержкой, чтобы navigate успел
      setTimeout(() => {
        handleClose();
      }, 50);
    }
  }, [query, searchResults.items, navigate, findMostRelevantCategory]);

  /**
   * Кнопка "Отмена" — закрывает меню и сбрасывает query
   */
  const handleCancel = () => {
    handleClose();
  };

  // Для десктопа показываем dropdown когда есть запрос или открыт вручную
  const showDropdown = showDesktop ? (isOpen || (query && query.trim())) : isOpen;

  return (
    <div className={styles.searchContainer} ref={containerRef}>
      {/* Затемнённый фон для десктопа */}
      {showDropdown && showDesktop && (
        <div className={styles.overlay} onClick={handleClose} />
      )}

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
            // Поле ввода с крестиком внутри (для десктопа или для мобильной версии после открытия)
            <div className={styles.inputWithClear}>
              <input
                ref={inputRef}
                type="text"
                placeholder={showDesktop ? "Поиск товаров" : "Поиск"}
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClick={handleInputClick}
                onFocus={() => showDesktop && setIsOpen(true)}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button className={styles.clearBtn} onClick={handleClear}>
                  <FiX size={18} />
                </button>
              )}
            </div>
          )}

          {/* Кнопка "Отмена" для мобильной версии */}
          {showMobile && isOpen && (
            <button className={styles.mobileCancelBtn} onClick={handleCancel} type="button">
              Отмена
            </button>
          )}
        </div>
      </div>

      {showDropdown && showDesktop && (
        <div className={styles.desktopDropdown}>
          {isSearching ? (
            <div className={styles.searchLoading}>
              <div className={styles.spinner} />
              <span>Поиск...</span>
            </div>
          ) : searchResults.items.length > 0 || searchResults.suggestions.length > 0 ? (
            <div className={styles.searchResults}>
              <SearchSuggestions
                suggestions={searchResults.suggestions}
                items={searchResults.items}
                query={query}
                onSuggestionClick={handleSuggestionClick}
                onProductClick={handleProductClick}
                onClose={handleCategoryClose}
              />
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

      {showDropdown && showMobile && (
        <div className={styles.mobileDropdown}>
          <div className={styles.dropdownBody}>
            {isSearching ? (
              <div className={styles.searchLoading}>
                <div className={styles.spinner} />
                <span>Поиск...</span>
              </div>
            ) : searchResults.items.length > 0 || searchResults.suggestions.length > 0 ? (
              <SearchSuggestions
                suggestions={searchResults.suggestions}
                items={searchResults.items}
                query={query}
                onSuggestionClick={handleSuggestionClick}
                onProductClick={handleProductClick}
                onClose={handleCategoryClose}
              />
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
    </div>
  );
};

export default SearchOverlay;
