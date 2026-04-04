import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import DOMPurify from "dompurify";

import { useWishlist } from '../../app/store/wishlistStore';
import { useCart } from '../../app/store/cartStore';
import useProduct from '../../shared/hooks/useProduct';
import { getProductById } from '../../shared/api/catalogApi';

import { ProductSlider } from '../../shared/ui/ProductSlider';
import { ProductVariants } from '../../widgets/ProductVariants';
import { ProductShortSpecs } from '../../widgets/ProductShortSpecs';
import { ProductFullSpecs } from '../../widgets/ProductFullSpecs';
import { MobileCartButton } from '../../widgets/MobileCartButton';
import { StickyProductBar } from '../../widgets/StickyProductBar';

import { AddToCart } from '../../features/add-to-cart';

import RecommendationsBlock, {
  RELATION_TYPES,
} from '../../widgets/RecommendationsBlock/RecommendationsBlock';

import RelatedProducts from '../../widgets/RelatedProducts/RelatedProducts';

import paths from '../../app/router/paths';

import desktop from './ProductPage.desktop.module.css';
import mobile from './ProductPage.mobile.module.css';



/* =====================================================
   Helper: объединение классов desktop + mobile
===================================================== */

function cx(className) {
  return `${desktop[className] || ''} ${mobile[className] || ''}`.trim();
}



/* =====================================================
   Formatter
===================================================== */

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});



/* =====================================================
   Description parser
===================================================== */

function parseDescription(desc) {

  if (!desc) return '';

  if (typeof desc !== 'string') {
    return desc?.__html || String(desc);
  }

  if (desc.startsWith('{') || desc.startsWith('[')) {
    try {
      const parsed = JSON.parse(desc);
      return parsed.html || parsed.description || desc;
    } catch {
      return desc;
    }
  }

  if (desc.includes('&lt;') || desc.includes('&gt;')) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = desc;
    return textarea.value;
  }

  return desc;
}



/* =====================================================
   Component
===================================================== */

const ProductPage = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [categoryId, setCategoryId] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [previousProduct, setPreviousProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const [variantExpanded, setVariantExpanded] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  const requestRef = useRef(0);
  const cacheRef = useRef({});
  const baseProductNameRef = useRef(null);



  const urlParams = new URLSearchParams(window.location.search);
  const urlCategoryId = urlParams.get('category');
  const urlVariantsExpanded = urlParams.get('variants') === 'expanded';



  useEffect(() => {

    if (urlCategoryId) {
      setCategoryId(parseInt(urlCategoryId, 10));
    }

    setVariantExpanded(urlVariantsExpanded);

  }, [urlCategoryId, urlVariantsExpanded]);



  const {
    product,
    variants,
    loading,
    error,
  } = useProduct({
    product_id: id ? parseInt(id, 10) : null,
    category_id: categoryId,
  });



  useEffect(() => {

    if (product && !currentProduct) {
      setCurrentProduct(product);
      setSelectedVariantId(product.id);
      // Фиксируем базовое имя товара для сортировки вариантов
      baseProductNameRef.current = product.name;
    }

  }, [product, currentProduct]);



  useEffect(() => {
    setDescriptionExpanded(false);
  }, [currentProduct?.id]);



  const activeProduct = currentProduct || previousProduct || product;



  const inWishlist = activeProduct?.id
      ? isInWishlist(activeProduct.id)
      : false;



  const handleWishlistToggle = useCallback(() => {

    if (!activeProduct?.id) return;

    toggleWishlist(activeProduct.id);

  }, [activeProduct?.id, toggleWishlist]);



  const formatPrice = useCallback((price) => {

    if (!price) return '0 ₽';

    return priceFormatter.format(price);

  }, []);



  /* =====================================================
     Variant select
  ===================================================== */

  const handleVariantSelect = useCallback(async (variant) => {

    if (!variant?.id || variant.id === activeProduct?.id) return;

    setSelectedVariantId(variant.id);

    setPreviousProduct(currentProduct);
    setProductLoading(true);

    const requestId = ++requestRef.current;

    try {

      let newProduct = cacheRef.current[variant.id];

      if (!newProduct) {

        const result = await getProductById({
          product_id: variant.id,
          category_id: activeProduct?.category?.id || categoryId,
        });

        if (requestId !== requestRef.current) return;

        if (!result.success || !result.data?.item) {
          throw new Error('Variant load failed');
        }

        newProduct = result.data.item;

        cacheRef.current[variant.id] = newProduct;
      }

      setCurrentProduct(newProduct);

      const params = new URLSearchParams();

      if (urlCategoryId) params.set('category', urlCategoryId);
      if (variantExpanded) params.set('variants', 'expanded');

      window.history.replaceState(
          {},
          '',
          `/product/${variant.id}?${params.toString()}`
      );

    } catch (err) {

      console.error('Variant load error', err);

    } finally {

      if (requestId === requestRef.current) {
        setProductLoading(false);
        setPreviousProduct(null);
      }

    }

  }, [
    activeProduct?.id,
    activeProduct?.category?.id,
    categoryId,
    currentProduct,
    urlCategoryId,
    variantExpanded
  ]);



  /* =====================================================
     Prefetch variants
  ===================================================== */

  const prefetchVariant = useCallback(async (variantId) => {

    if (cacheRef.current[variantId]) return;

    try {

      const result = await getProductById({
        product_id: variantId,
        category_id: activeProduct?.category?.id || categoryId,
      });

      if (result.success && result.data?.item) {
        cacheRef.current[variantId] = result.data.item;
      }

    } catch {}

  }, [activeProduct?.category?.id, categoryId]);



  useEffect(() => {

    if (!variants?.length) return;

    variants.forEach(v => prefetchVariant(v.id));

  }, [variants, prefetchVariant]);



  if (loading && !product && !currentProduct) {
    return <div className={cx('loading')}>Загрузка...</div>;
  }



  if (error || !activeProduct) {

    return (
        <div className={cx('notFound')}>

          <div className={cx('emptyState')}>

            <div className={cx('emptyIcon')}>
              <span className={cx('errorCode')}>404</span>
            </div>

            <h1 className={cx('title')}>Товар не найден</h1>

            <p className={cx('description')}>
              К сожалению, товар не существует или был удалён.
            </p>

            <div className={cx('actions')}>

              <button
                  onClick={() => navigate(-1)}
                  className={cx('actionButtonSecondary')}
              >
                Назад
              </button>

              <Link
                  to={paths.CATALOG}
                  className={cx('actionButton')}
              >
                В каталог
              </Link>

            </div>

          </div>

        </div>
    );
  }



  const safeDescription = DOMPurify.sanitize(
      parseDescription(activeProduct.description)
  );



  return (

      <div className={cx('productPage')}>

        <div className={cx('container')}>

          <div className={cx('productContent')}>

            <div className={cx('gallery')}>
              <ProductSlider images={activeProduct.images || []} />
            </div>



            <div className={cx('mainInfo')}>

              <div className={cx('price_mobile')}>
                {formatPrice(activeProduct.price)}
              </div>

              <h1 className={cx('title')}>
                {activeProduct.name}
              </h1>

              <div className={cx('rating')}>
                ⭐ 4.8 (120 отзывов)
              </div>



              <button
                  className={`${cx('wishlistButton')} ${
                      inWishlist ? desktop.wishlistActive : ''
                  }`}
                  onClick={handleWishlistToggle}
                  type="button"
              >
                <FiHeart size={20} />
                <span>
                {inWishlist ? 'В избранном' : 'В избранное'}
              </span>
              </button>



              <ProductVariants
                  variants={variants}
                  mainProductName={baseProductNameRef.current || activeProduct.name}
                  currentProductId={selectedVariantId || activeProduct.id}
                  onVariantSelect={handleVariantSelect}
                  expanded={variantExpanded}
                  setExpanded={setVariantExpanded}
                  isLoading={productLoading}
              />



              <ProductShortSpecs attributes={activeProduct.attributes} />

            </div>



            <div className={cx('buyBlock')}>
              {/* Общий wrapper для buyBox и платёжного блока */}
              <div className={cx('purchaseWrapper')}>

                {/* =========================
                    BUY BOX: цена, наличие, кнопки
                ========================= */}
                <div className={cx('buyBox')}>

                  {/* Цена и наличие — в самом верху */}
                  <div className={cx('priceStock')}>
                    <div className={cx('price')}>
                      {formatPrice(activeProduct.price)}
                    </div>
                    <div className={cx('stock')}>В наличии</div>
                  </div>

                  {/* Основные кнопки */}
                  <div className={cx('mainButtons')}>
                    <AddToCart
                        productId={activeProduct.id}
                        className={cx('addToCartButton')}
                    />

                    <button className={cx('installmentButton')} disabled>
                      Рассрочка
                    </button>

                    <button
                        className={cx('buyNowButton')}
                        onClick={() => {
                          addToCart(activeProduct.id, 1);
                          navigate(paths.CART);
                        }}
                    >
                      Купить в 1 клик
                    </button>
                  </div>

                </div>

                {/* =========================
                    Платёжный блок Plyte — отдельным блоком под buyBox
                ========================= */}
                <div className={cx('plyteWidget')}>
                  <div className={cx('plyteHeader')}>
                    <span className={cx('plyteLogo')}>Plyte</span>
                    <span className={cx('plyteHelp')}>?</span>
                  </div>
                  <div className={cx('plyteText')}>
                    Разбить на части без переплат
                  </div>
                  <div className={cx('plyteLine')}></div>
                  <div className={cx('plyteFooter')}>
                    <div className={cx('plyteToday')}>Сегодня</div>
                    <div className={cx('plyteAmount')}>35 000 ₽</div>
                    <div className={cx('plyteInstallments')}>5 платежей</div>
                  </div>
                </div>

              </div>
            </div>

          </div>



          <RecommendationsBlock
              productId={activeProduct.id}
              relationType={RELATION_TYPES.ACCESSORY}
          />



          {activeProduct.description && (

              <div className={cx('descriptionSection')}>

                <h2 className={cx('sectionTitle')}>
                  Описание
                </h2>

                <div
                    className={`${cx('descriptionWrapper')} ${
                        !descriptionExpanded ? desktop.descriptionCollapsed : ''
                    }`}
                >

                  <div
                      className={cx('description')}
                      dangerouslySetInnerHTML={{
                        __html: safeDescription,
                      }}
                  />

                  {!descriptionExpanded && (

                      <div className={cx('descriptionGradientOverlay')}>
                        <button
                            className={cx('descriptionExpandButton')}
                            onClick={() => setDescriptionExpanded(true)}
                            type="button"
                        >
                          Развернуть все
                        </button>
                      </div>

                  )}

                </div>
              </div>
          )}



          <ProductFullSpecs attributes={activeProduct.attributes} />

          <RelatedProducts />

        </div>



        <MobileCartButton
            productId={activeProduct.id}
            price={parseFloat(activeProduct.price) || 0}
        />



        <StickyProductBar product={activeProduct} />

      </div>

  );
};



export default ProductPage;