// ProductPage.jsx
import { useCallback, useEffect, useState } from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import useProduct from '../../shared/hooks/useProduct';
import { ProductSlider } from '../../shared/ui/ProductSlider';
import { ProductVariants } from '../../widgets/ProductVariants';
import { ProductShortSpecs } from '../../widgets/ProductShortSpecs';
import { MobileCartButton } from '../../widgets/MobileCartButton';
import { AddToCart } from '../../features/add-to-cart';
import styles from './ProductPage.module.css';
import DOMPurify from "dompurify";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(null);

  const urlCategoryId = window.location.search.includes('category=') 
    ? new URLSearchParams(window.location.search).get('category') 
    : null;

  useEffect(() => {
    if (urlCategoryId) {
      setCategoryId(parseInt(urlCategoryId, 10));
    }
  }, [urlCategoryId]);

  const {
    product,
    variants,
    loading,
    error,
  } = useProduct({
    product_id: id ? parseInt(id, 10) : null,
    category_id: categoryId,
  });

  const handleVariantSelect = useCallback((variant) => {
    if (variant.id !== product?.id) {
      navigate(`/product/${variant.id}?category=${urlCategoryId || variant.category?.id}`, { replace: true });
    }
  }, [product?.id, urlCategoryId, navigate]);

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

              {/* Миниатюры вариантов */}
              <ProductVariants
                variants={variants}
                currentProductId={product.id}
                onVariantSelect={handleVariantSelect}
              />

              {/* Краткие характеристики */}
              <ProductShortSpecs attributes={product.attributes} />
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
                <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                />
              </div>
          )}

        </div>

        {/* Мобильная кнопка корзины - вне контейнера */}
        <MobileCartButton productId={product.id} price={parseFloat(product.price) || 0} />
      </div>
  );
};

export default ProductPage;

