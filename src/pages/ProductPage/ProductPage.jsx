import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useProduct from '../../shared/hooks/useProduct';
import { ProductSlider } from '../../shared/ui/ProductSlider';
import { ProductAttributes } from '../../widgets/ProductAttributes';
import { AddToCart } from '../../features/add-to-cart';
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

  // Текущие выбранные атрибуты из URL или из товара
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

  // Атрибуты текущего товара
  const currentProductAttributes = useMemo(() => {
    if (!product?.attributes) return {};
    
    const attrs = {};
    product.attributes.forEach((attr) => {
      if (attr.is_filterable) {
        attrs[attr.name] = attr.value;
      }
    });
    return attrs;
  }, [product]);

  /**
   * Обработчик изменения атрибута
   */
  const handleAttributeChange = useCallback((attrName, attrValue) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`attr_${attrName}`, attrValue);
    
    // Проверяем, есть ли товар с такими атрибутами
    const newAttrs = { ...selectedAttributes, [attrName]: attrValue };
    const variant = findVariantByAttributes(newAttrs);
    
    if (variant) {
      // Если товар найден, переходим на него
      navigate(`/product/${variant.id}?${newParams.toString()}`, { replace: true });
    } else {
      // Если товара нет, пробуем найти совместимый вариант
      // Удаляем атрибут, который не совместим
      const compatibleVariant = variants.find((v) => {
        const testAttrs = { ...newAttrs };
        delete testAttrs[attrName];
        
        return Object.entries(testAttrs).every(([name, value]) => {
          return v.attributes?.some((a) => a.name === name && a.value === value);
        });
      });
      
      if (compatibleVariant) {
        // Переходим на совместимый вариант
        navigate(`/product/${compatibleVariant.id}?${newParams.toString()}`, { replace: true });
      } else {
        // Просто обновляем URL
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchParams, selectedAttributes, findVariantByAttributes, variants, navigate, setSearchParams]);

  /**
   * Найти и переключиться на вариант с выбранными атрибутами
   */
  useEffect(() => {
    // Если нет выбранных атрибутов из URL, используем атрибуты текущего товара
    if (Object.keys(selectedAttributes).length === 0 && Object.keys(currentProductAttributes).length > 0) {
      // Атрибуты уже выбраны (текущий товар)
      return;
    }
    
    if (Object.keys(selectedAttributes).length === 0 || variants.length === 0) return;

    const variant = findVariantByAttributes(selectedAttributes);
    if (variant && variant.id !== product?.id) {
      // Переходим на страницу варианта
      navigate(`/product/${variant.id}?${searchParams.toString()}`, { replace: true });
    } else if (!variant) {
      // Если товар не найден с такими атрибутами, пробуем найти совместимый
      const compatibleVariant = variants.find((v) => {
        // Ищем товар, у которого есть хотя бы часть атрибутов
        const matchCount = Object.entries(selectedAttributes).filter(([name, value]) => {
          return v.attributes?.some((a) => a.name === name && a.value === value);
        }).length;
        
        return matchCount > 0;
      });
      
      if (compatibleVariant) {
        navigate(`/product/${compatibleVariant.id}?${searchParams.toString()}`, { replace: true });
      }
    }
  }, [selectedAttributes, variants, findVariantByAttributes, product?.id, navigate, searchParams, currentProductAttributes]);

  /**
   * Форматирование цены
   */
  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  }, []);

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
          {/* Слайдер */}
          <div className={styles.sliderSection}>
            <ProductSlider
              images={product.images || []}
              alt={product.name}
            />
          </div>

          {/* Атрибуты */}
          <div className={styles.attributesSection}>
            <ProductAttributes
              filters={filters}
              selectedAttributes={selectedAttributes}
              availableAttributeValues={availableAttributeValues}
              currentProductAttributes={currentProductAttributes}
              variants={variants}
              onAttributeChange={handleAttributeChange}
            />
          </div>

          {/* Корзина */}
          <div className={styles.productSidebar}>
            <div className={styles.buyBox}>
              <div className={styles.priceSection}>
                <div className={styles.currentPrice}>{formatPrice(product.price)}</div>
              </div>
              
              <div className={styles.addToCartSection}>
                <AddToCart productId={product.id} />
              </div>
            </div>
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
