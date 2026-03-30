import { useCallback, useRef, useEffect } from 'react';
import { Grid } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductGridVirtual.module.css';

/**
 * Виртуализированная сетка товаров с infinite scroll
 * Использует react-window для рендеринга только видимых элементов
 */
const ProductGridVirtual = ({
  products,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onImageChange,
}) => {
  const gridRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Вычисляем количество колонок на основе ширины (минимум 220px на карточку)
  const getColumnCount = useCallback((containerWidth) => {
    if (!containerWidth) return 4;
    const minColumnWidth = 220;
    const gap = 14;
    const columnCount = Math.floor((containerWidth + gap) / (minColumnWidth + gap));
    return Math.max(2, Math.min(columnCount, 6));
  }, []);

  // Хук для отслеживания загрузки
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  /**
   * Рендер ячейки сетки
   */
  const renderCell = useCallback(
    ({ columnIndex, rowIndex, style, data }) => {
      const { products, columnCount, onImageChange, loadingMore } = data;
      const index = rowIndex * columnCount + columnIndex;
      const product = products[index];

      if (!product) {
        return (
          <div style={style} className={styles.emptyCell}>
            {loadingMore && columnIndex === 0 && rowIndex === Math.floor(products.length / columnCount) && (
              <div className={styles.loadingMore}>
                <div className={styles.spinner}></div>
                <span>Загрузка...</span>
              </div>
            )}
          </div>
        );
      }

      return (
        <div style={style} className={styles.cell}>
          <ProductCard product={product} onImageChange={onImageChange} />
        </div>
      );
    },
    []
  );

  /**
   * Проверка необходимости загрузки следующей порции
   */
  const handleItemsRendered = useCallback(
    ({ overscanStopRowIndex, visibleStopIndex, rowCount }) => {
      // Если уже загружаем или нет больше товаров
      if (loadingMoreRef.current || !hasMore) return;

      // Если доскроллили до конца (с запасом в 1 ряд)
      if (visibleStopIndex >= rowCount - overscanStopRowIndex) {
        // Устанавливаем флаг, чтобы предотвратить повторные вызовы
        loadingMoreRef.current = true;
        onLoadMore();
      }
    },
    [hasMore, onLoadMore]
  );

  /**
   * Skeleton для первой загрузки
   */
  const renderSkeleton = useCallback(() => {
    return Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className={styles.skeletonCard}>
        <div className={styles.skeletonImage}></div>
        <div className={styles.skeletonContent}>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonPrice}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    ));
  }, []);

  /**
   * Пустое состояние
   */
  if (!loading && products && products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📦</div>
        <h3 className={styles.emptyTitle}>Товары не найдены</h3>
        <p className={styles.emptyText}>Попробуйте изменить параметры фильтрации</p>
      </div>
    );
  }

  return (
    <div className={styles.virtualGridWrapper}>
      {loading ? (
        <div className={styles.skeletonGrid}>{renderSkeleton()}</div>
      ) : (
        <AutoSizer>
          {({ height, width }) => {
            const columnCount = getColumnCount(width);
            const columnWidth = Math.floor(width / columnCount);
            const rowHeight = 380; // Высота карточки + отступы
            const rowCount = Math.max(1, Math.ceil(products.length / columnCount));

            const cellData = {
              products,
              columnCount,
              onImageChange,
              loadingMore,
            };

            return (
              <Grid
                key={products.length}  // Принудительный ре-рендер при изменении количества товаров
                ref={gridRef}
                className={styles.grid}
                cellComponent={renderCell}
                cellProps={cellData}
                columnCount={columnCount}
                columnWidth={columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={width}
                overscanRowCount={2}
                onItemsRendered={handleItemsRendered}
              />
            );
          }}
        </AutoSizer>
      )}

      {/* Индикатор конца списка */}
      {!hasMore && products.length > 0 && !loadingMore && (
        <div className={styles.endOfList}>
          <span>Все товары показаны</span>
        </div>
      )}
    </div>
  );
};

export default ProductGridVirtual;
