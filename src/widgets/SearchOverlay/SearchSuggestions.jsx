import { useCallback, useMemo } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import styles from './SearchSuggestions.module.css';

/**
 * Компонент отображения подсказок и результатов поиска
 * @param {Object} props
 * @param {Array} props.suggestions - Массив подсказок [{word, count}]
 * @param {Array} props.items - Массив товаров
 * @param {string} props.query - Текущий запрос
 * @param {Function} props.onSuggestionClick - Клик по подсказке
 * @param {Function} props.onProductClick - Клик по товару (закрытие поиска)
 * @param {Function} props.onClose - Закрытие поиска
 */
const SearchSuggestions = ({
  suggestions = [],
  items = [],
  query,
  onSuggestionClick,
  onProductClick,
  onClose,
}) => {
  const navigate = useNavigate();

  const handleSuggestionClick = useCallback(
    (word) => {
      onSuggestionClick(word);
    },
    [onSuggestionClick]
  );

  const handleProductClick = useCallback(
    (productId) => {
      onProductClick();
    },
    [onProductClick]
  );

  // Уникальные категории из товаров
  const categories = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (item.category && !map.has(item.category.id)) {
        map.set(item.category.id, item.category);
      }
    });
    return Array.from(map.values());
  }, [items]);

  const handleCategoryClick = useCallback(
    (categoryId) => {
      navigate(`/catalog?category=${categoryId}`);
      if (onClose) onClose();
    },
    [navigate, onClose]
  );

  if (!query || (!suggestions.length && !items.length)) {
    return null;
  }

  return (
    <div className={styles.searchSuggestions}>
      {/* Блок подсказок */}
      {suggestions.length > 0 && (
        <div className={styles.suggestionsBlock}>
          {/*<div className={styles.suggestionsHeader}>*/}
          {/*  <FiSearch className={styles.suggestionsIcon} />*/}
          {/*  <span className={styles.suggestionsTitle}>Подсказки</span>*/}
          {/*</div>*/}
          <div className={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.word}-${index}`}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(suggestion.word)}
                type="button"
              >
                <span className={styles.suggestionWord}>{suggestion.word}</span>
                <span className={styles.suggestionCount}>{suggestion.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Блок категорий */}
      {categories.length > 0 && (
        <div className={styles.categoriesBlock}>
          <h3 className={styles.categoriesTitle}>Категории</h3>
          <div className={styles.categoriesList}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={styles.categoryItem}
                onClick={() => handleCategoryClick(category.id)}
                type="button"
              >
                <span className={styles.categoryName}>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Блок товаров */}
      {items.length > 0 && (
        <div className={styles.productsBlock}>
          <h3 className={styles.productsTitle}>Товары</h3>
          <div className={styles.productsGrid}>
            {items.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
              >
                <ProductCard
                  product={product}
                  hideWishlistButton={false}
                  onImageChange={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
