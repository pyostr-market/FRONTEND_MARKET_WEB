import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useProduct from '../../shared/hooks/useProduct';
import { ProductSlider } from '../../shared/ui/ProductSlider';
import { ProductAttributes } from '../../widgets/ProductAttributes';
import { BuyBox } from '../../widgets/BuyBox';
import paths from '../../app/router/paths';
import styles from './ProductPage.module.css';

/**
 * Страница товара
 */
const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryId, setCategoryId] = useState(null);

  // Категория из URL
  const urlCategoryId = searchParams.get('category');

  // Обновляем category_id при загрузке товара
  useEffect(() => {
    if (urlCategoryId) {
      setCategoryId(parseInt(urlCategoryId, 10));
    }
  }, [urlCategoryId]);

  // Загрузка товара
  const {
    product,
    variants,
    filters,
    availableAttributeValues,
    findVariantByAttributes,
    loading,
    error,
  } = useProduct({
    product_id: id ? parseInt(id, 10) : null,
    category_id: categoryId,
  });

  // Текущие выбранные атрибуты из URL
  const selectedAttributes = useMemo(() => {
    const attrs = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        const attrName = key.replace('attr_', '');
        attrs[attrName] = value;
      }
    });
    return attrs;
  }, [searchParams]);

  /**
   * Обработчик изменения атрибута
   */
  const handleAttributeChange = useCallback((attrName, attrValue) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`attr_${attrName}`, attrValue);
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  /**
   * Найти и переключиться на вариант с выбранными атрибутами
   */
  useEffect(() => {
    if (Object.keys(selectedAttributes).length === 0 || variants.length === 0) return;

    const variant = findVariantByAttributes(selectedAttributes);
    if (variant && variant.id !== product?.id) {
      // Переходим на страницу варианта
      navigate(`/product/${variant.id}?${searchParams.toString()}`, { replace: true });
    }
  }, [selectedAttributes, variants, findVariantByAttributes, product?.id, navigate, searchParams]);

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className={styles.productPage}>
        <div className={styles.loading}>Загрузка товара...</div>
      </div>
    );
  }

  /**
   * Error
   */
  if (error || !product) {
    return (
      <div className={styles.productPage}>
        <div className={styles.error}>
          <h1>Товар не найден</h1>
          <button onClick={() => navigate(paths.CATALOG)}>
            Вернуться в каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productPage}>
      <div className={styles.productContainer}>
        {/* Хлебные крошки */}
        <nav className={styles.breadcrumbs}>
          <button
            className={styles.crumb}
            onClick={() => navigate(paths.CATALOG)}
          >
            Каталог
          </button>
          {product.category && (
            <>
              <span className={styles.crumbSeparator}>/</span>
              <button
                className={styles.crumb}
                onClick={() => navigate(`${paths.CATALOG}?category=${product.category.id}`)}
              >
                {product.category.name}
              </button>
            </>
          )}
        </nav>

        <div className={styles.productContent}>
          {/* Левая часть - слайдер и атрибуты */}
          <div className={styles.productMain}>
            {/* Слайдер */}
            <div className={styles.sliderSection}>
              <ProductSlider
                images={product.images || []}
                alt={product.name}
              />
            </div>

            {/* Атрибуты/фильтры */}
            <div className={styles.attributesSection}>
              <ProductAttributes
                filters={filters}
                selectedAttributes={selectedAttributes}
                availableAttributeValues={availableAttributeValues}
                onAttributeChange={handleAttributeChange}
              />
            </div>
          </div>

          {/* Правая часть - BuyBox */}
          <div className={styles.productSidebar}>
            <BuyBox product={product} />
          </div>
        </div>

        {/* Описание товара */}
        {product.description && (
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <div className={styles.description}>{product.description}</div>
          </div>
        )}

        {/* Характеристики */}
        {product.attributes && product.attributes.length > 0 && (
          <div className={styles.specsSection}>
            <h2 className={styles.sectionTitle}>Характеристики</h2>
            <table className={styles.specsTable}>
              <tbody>
                {product.attributes.map((attr) => (
                  <tr key={attr.id || attr.name}>
                    <td className={styles.specName}>{attr.name}</td>
                    <td className={styles.specValue}>{attr.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
