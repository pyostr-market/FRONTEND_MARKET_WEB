// ProductPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useProduct from '../../shared/hooks/useProduct';
import { ProductSlider } from '../../shared/ui/ProductSlider';
import { ProductAttributes } from '../../widgets/ProductAttributes';
import { AddToCart } from '../../features/add-to-cart';
import paths from '../../app/router/paths';
import styles from './ProductPage.module.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categoryId, setCategoryId] = useState(null);

  const urlCategoryId = searchParams.get('category');

  useEffect(() => {
    if (urlCategoryId) {
      setCategoryId(parseInt(urlCategoryId, 10));
    }
  }, [urlCategoryId]);

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

  const handleAttributeChange = useCallback((attrName, attrValue) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set(`attr_${attrName}`, attrValue);

    const newAttrs = { ...selectedAttributes, [attrName]: attrValue };
    const variant = findVariantByAttributes(newAttrs);

    if (variant) {
      navigate(`/product/${variant.id}?${newParams.toString()}`, { replace: true });
    } else {
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, selectedAttributes, findVariantByAttributes, navigate, setSearchParams]);

  const formatPrice = useCallback((price) => {
    if (!price) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error || !product) return <div className={styles.error}>Товар не найден</div>;

  return (
      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.productContent}>

            {/* Галерея */}
            <div className={styles.gallery}>
              <ProductSlider images={product.images || []} />
            </div>

            {/* Основная инфа */}
            <div className={styles.mainInfo}>
              <h1 className={styles.title}>{product.name}</h1>

              <div className={styles.rating}>⭐ 4.8 (120 отзывов)</div>

              <ProductAttributes
                  filters={filters}
                  selectedAttributes={selectedAttributes}
                  availableAttributeValues={availableAttributeValues}
                  variants={variants}
                  onAttributeChange={handleAttributeChange}
              />
            </div>

            {/* Покупка */}
            <div className={styles.buyBlock}>
              <div className={styles.buyBox}>
                <div className={styles.price}>{formatPrice(product.price)}</div>

                <div className={styles.stock}>В наличии</div>

                <button className={styles.buyNow}>Купить сейчас</button>

                <AddToCart productId={product.id} />

                <div className={styles.delivery}>Доставка: завтра</div>

                <ul className={styles.features}>
                  <li>Оригинальный товар</li>
                  <li>Гарантия 1 год</li>
                  <li>Возврат 7 дней</li>
                </ul>
              </div>
            </div>

          </div>

          {product.description && (
              <div className={styles.section}>
                <h2>Описание</h2>
                <p>{product.description}</p>
              </div>
          )}

        </div>
      </div>
  );
};

export default ProductPage;

