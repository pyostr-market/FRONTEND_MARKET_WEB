import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useProductTypes from '../../shared/hooks/useProductTypes';
import LazyImage from '../../shared/ui/LazyImage';
import styles from './CategoriesGrid.module.css';

const CategoriesGrid = () => {
  const navigate = useNavigate();
  const { productTypes, loading } = useProductTypes();

  /**
   * Клик по категории
   */
  const handleCategoryClick = useCallback((typeId) => {
    navigate(`/catalog?product_type=${typeId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.categoriesGrid}>
        <h2 className={styles.sectionTitle}>Категории</h2>
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonName} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.categoriesGrid}>
      <h2 className={styles.sectionTitle}>Категории</h2>
      <div className={styles.grid}>
        {productTypes.map((type) => (
          <button
            key={type.id}
            className={styles.categoryCard}
            onClick={() => handleCategoryClick(type.id)}
            type="button"
          >
            <div className={styles.imageWrapper}>
              <LazyImage
                src={type.image?.image_url || null}
                alt={type.name}
                className={styles.categoryImage}
              />
            </div>
            <span className={styles.categoryName}>{type.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoriesGrid;
