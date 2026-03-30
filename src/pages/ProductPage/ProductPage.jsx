import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../app/store/wishlistStore';
import useProduct from '../../shared/hooks/useProduct';
import { ProductSlider } from '../../shared/ui/ProductSlider';
import { ProductVariants } from '../../widgets/ProductVariants';
import { ProductShortSpecs } from '../../widgets/ProductShortSpecs';
import { MobileCartButton } from '../../widgets/MobileCartButton';
import { StickyProductBar } from '../../widgets/StickyProductBar';
import { AddToCart } from '../../features/add-to-cart';
import styles from './ProductPage.module.css';
import DOMPurify from "dompurify";

const ProductPage = () => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoryId, setCategoryId] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const urlCategoryId = urlParams.get('category');
  const urlVariantsExpanded = urlParams.get('variants') === 'expanded';

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

  const [variantExpanded, setVariantExpanded] = useState(urlVariantsExpanded);
  
  const inWishlist = product?.id ? isInWishlist(product.id) : false;

  const handleWishlistToggle = useCallback(() => {
    if (product?.id) {
      toggleWishlist(product.id);
    }
  }, [product?.id, toggleWishlist]);

  const handleVariantSelect = useCallback((variant) => {
    if (variant.id !== product?.id) {
      const params = new URLSearchParams();
      if (urlCategoryId) params.set('category', urlCategoryId);
      if (variantExpanded) params.set('variants', 'expanded'); // сохраняем состояние
      navigate(`/product/${variant.id}?${params.toString()}`, { replace: true });
    }
  }, [product?.id, urlCategoryId, navigate, variantExpanded]);

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

          <div className={`${styles.productContent} productContent`}>

            {/* Галерея */}
            <div className={styles.gallery}>
              <ProductSlider images={product.images || []} />
            </div>

            {/* Основная инфа */}
            <div className={styles.mainInfo}>
              <div className={styles.price_mobile}>{formatPrice(product.price)}</div>

              <h1 className={styles.title}>{product.name}</h1>

              <div className={styles.rating}>⭐ 4.8 (120 отзывов)</div>

              {/* Кнопка избранного */}
              <button
                className={`${styles.wishlistButton} ${inWishlist ? styles.wishlistActive : ''}`}
                onClick={handleWishlistToggle}
                aria-label={inWishlist ? 'Удалить из избранного' : 'Добавить в избранное'}
                type="button"
              >
                <FiHeart size={20} />
                <span>{inWishlist ? 'В избранном' : 'В избранное'}</span>
              </button>

              {/* Миниатюры вариантов */}
              <ProductVariants
                  variants={variants}
                  currentProductId={product.id}
                  onVariantSelect={handleVariantSelect}
                  expanded={variantExpanded}
                  setExpanded={setVariantExpanded}
              />

              {/* Краткие характеристики */}
              <ProductShortSpecs attributes={product.attributes} />
            </div>

            {/* Блок покупки */}
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
              <div className="descriptionSection">
                <h2 className={styles.sectionTitle}>Описание</h2>
                <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                />
                <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                />
                <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                />
                <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                />
                <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                />
                <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.description),
                    }}
                />

              </div>
          )}

        </div>

        {/* Мобильная кнопка корзины */}
        {product && (
            <MobileCartButton productId={product.id} price={parseFloat(product.price) || 0} />
        )}

        {/* Плавающая менюшка */}
        {product && (
            <StickyProductBar product={product} />
        )}
      </div>
  );
};

export default ProductPage;