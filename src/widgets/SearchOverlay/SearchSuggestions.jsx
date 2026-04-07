import { useCallback } from 'react';
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
 */
const SearchSuggestions = ({
  suggestions = [],
  items = [],
  query,
  onSuggestionClick,
  onProductClick,
}) => {
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

  if (!query || (!suggestions.length && !items.length)) {
    return null;
  }

  return (
    <div className={styles.searchSuggestions}>
      {/* Блок подсказок */}
      {suggestions.length > 0 && (
        <div className={styles.suggestionsBlock}>
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
