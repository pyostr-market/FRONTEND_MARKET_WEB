import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingCart, FiArrowRight, FiTruck, FiShield, FiCheck, FiHeart } from 'react-icons/fi';
import { useCart } from '../../app/store/cartStore';
import { useWishlist } from '../../app/store/wishlistStore';
import useCartProducts from '../../shared/hooks/useCartProducts';
import { ProductCardSlider } from '../../shared/ui/ProductCardSlider';
import paths from '../../app/router/paths';
import styles from './CartPage.module.css';
import {AddToCart} from "../../features/add-to-cart";
import CartPageSkeleton from './CartPageSkeleton/CartPageSkeleton';

/**
 * Страница корзины
 */
const CartPage = () => {
  const {
    cartItems,
    setItemQuantity,
    removeFromCart,
    clearCart,
    getTotalQuantity,
    MAX_ITEM_QUANTITY,
  } = useCart();

  const { isInWishlist, toggleWishlist } = useWishlist();

  // Состояние для выбранных товаров
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Состояние для товаров в процессе удаления
  const [removingItems, setRemovingItems] = useState({});

  // Получаем ID товаров из корзины
  const productIds = useMemo(() => {
    return Object.keys(cartItems).map((id) => parseInt(id, 10));
  }, [cartItems]);

  // Загружаем реальные товары по ID
  const {
    products,
    loading,
    error,
  } = useCartProducts(productIds);

  const totalItems = getTotalQuantity();

  // Состояние "выбрать все"
  const allSelected = useMemo(() => {
    return products.length > 0 && products.every(p => selectedIds.has(p.id));
  }, [products, selectedIds]);

  // Сумма выбранных товаров
  const selectedTotal = useMemo(() => {
    return products
      .filter(p => selectedIds.has(p.id))
      .reduce((sum, item) => sum + parseFloat(item.price) * (cartItems[item.id] || 1), 0);
  }, [products, selectedIds, cartItems]);

  // Количество выбранных товаров
  const selectedCount = selectedIds.size;

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
   * Запуск процесса удаления товара
   */
  const startRemoval = useCallback((productId) => {
    // Если уже удаляется, не запускаем повторно
    if (removingItems[productId]) return;
    
    const timeout = setTimeout(() => {
      removeFromCart(productId);
      setRemovingItems(prev => {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      });
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 3000);
    
    setRemovingItems(prev => ({
      ...prev,
      [productId]: { timeout },
    }));
  }, [removeFromCart, removingItems]);

  /**
   * Отмена удаления товара
   */
  const cancelRemoval = useCallback((productId) => {
    setRemovingItems(prev => {
      const item = prev[productId];
      if (item?.timeout) {
        clearTimeout(item.timeout);
      }
      const { [productId]: removed, ...rest } = prev;
      return rest;
    });
    // Восстанавливаем количество в 1
    setItemQuantity(productId, 1);
  }, [setItemQuantity]);

  /**
   * Переключение выбора товара
   */
  const toggleSelectItem = useCallback((productId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  /**
   * Переключение выбора всех товаров
   */
  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  }, [allSelected, products]);

  /**
   * Удаление выбранных товаров
   */
  const removeSelected = useCallback(() => {
    selectedIds.forEach(id => startRemoval(id));
  }, [selectedIds, startRemoval]);

  /**
   * Очистка корзины (с задержкой для всех товаров)
   */
  const handleClearCart = useCallback(() => {
    products.forEach(product => {
      startRemoval(product.id);
    });
  }, [products, startRemoval]);

  /**
   * Обработчик для AddToCart - при уменьшении до 0 запускаем удаление
   */
  const handleAddToCartQuantityChange = useCallback((productId, newQuantity) => {
    if (newQuantity === 0) {
      startRemoval(productId);
    }
  }, [startRemoval]);

  /**
   * Товары в корзине с количествами
   */
  const cartProducts = useMemo(() => {
    return products.map((product) => ({
      ...product,
      quantity: cartItems[product.id] || 1,
      maxQuantity: MAX_ITEM_QUANTITY,
      isRemoving: !!removingItems[product.id],
    }));
  }, [products, cartItems, MAX_ITEM_QUANTITY, removingItems]);

  /**
   * Общая сумма
   */
  const totalPrice = useMemo(() => {
    return cartProducts.reduce((total, item) => {
      return total + parseFloat(item.price) * item.quantity;
    }, 0);
  }, [cartProducts]);

  /**
   * Пустая корзина - проверяем по cartItems, а не по products
   */
  const hasItemsInCart = Object.keys(cartItems).length > 0;
  
  if (!hasItemsInCart) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <FiShoppingCart size={80} />
          </div>
          <h1 className={styles.emptyCartTitle}>Корзина пуста</h1>
          <p className={styles.emptyCartText}>
            Выберите товары в каталоге и добавьте их в корзину
          </p>
          <Link to={paths.CATALOG} className={styles.emptyCartButton}>
            Перейти в каталог
            <FiArrowRight size={20} />
          </Link>
        </div>
      </div>
    );
  }

  /**
   * Загрузка товаров
   */
  if (loading) {
    return <CartPageSkeleton />;
  }

  /**
   * Ошибка загрузки
   */
  if (error) {
    return (
      <div className={styles.cartPage}>
        <div className={styles.cartContainer}>
          <h1 className={styles.cartTitle}>Корзина</h1>
          <div className={styles.error}>Ошибка: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartContainer}>
        <h1 className={styles.cartTitle}>Корзина</h1>

        {/* Панель с чекбоксом "выбрать все" и кнопками */}
        {/*<div className={styles.cartToolbar}>*/}
        {/*  <label className={styles.selectAllLabel}>*/}
        {/*    <input*/}
        {/*        type="checkbox"*/}
        {/*        className={styles.selectAllCheckbox}*/}
        {/*        checked={allSelected}*/}
        {/*        onChange={toggleSelectAll}*/}
        {/*    />*/}
        {/*    <span className={styles.selectAllText}>Выбрать все</span>*/}
        {/*  </label>*/}

        {/*  {selectedCount > 0 && (*/}
        {/*      <button*/}
        {/*          className={styles.removeSelectedButton}*/}
        {/*          onClick={removeSelected}*/}
        {/*      >*/}
        {/*        <FiTrash2 size={18} />*/}
        {/*        <span>Удалить выбранное ({selectedCount})</span>*/}
        {/*      </button>*/}
        {/*  )}*/}
        {/*</div>*/}

        <div className={styles.cartContent}>
          {/* Список товаров */}
          <div className={styles.cartItems}>
            {cartProducts.map((item) => {
              const isRemoving = !!removingItems[item.id];

              return (
                <div
                  key={item.id}
                  className={`${styles.cartItem} ${isRemoving ? styles.cartItemRemoving : ''}`}
                >
                  {/* Изображение со слайдером */}
                  <div className={styles.itemImage}>
                    <ProductCardSlider
                      images={item.images || []}
                      alt={item.name}
                    />
                  </div>

                  {/* Информация о товаре */}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                    <Link to={`/product/${item.id}`} className={styles.itemName}>
                      {item.name}
                    </Link>
                    <div className={styles.itemArticle}>Арт. {item.id}</div>
                    <div className={styles.itemBadges}>
                      <span className={styles.badge}>
                        <FiTruck size={14} /> Быстрая доставка
                      </span>
                      <span className={styles.badge}>
                        <FiShield size={14} /> Гарантия качества
                      </span>
                    </div>
                  </div>

                  {/* Количество и удаление */}
                  <div className={styles.itemActions}>
                    <div className={styles.itemBottomActions}>
                      <button
                        className={`${styles.wishlistActionBtn} ${isInWishlist(item.id) ? styles.wishlistActionBtnActive : ''}`}
                        onClick={() => toggleWishlist(item.id)}
                        aria-label={isInWishlist(item.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                        type="button"
                      >
                        <FiHeart size={18} />
                        <span>{isInWishlist(item.id) ? 'В избранном' : 'В избранное'}</span>
                      </button>
                      <button
                          className={styles.removeActionBtn}
                          onClick={() => startRemoval(item.id)}
                          aria-label="Удалить товар"
                          type="button"
                      >
                        <FiTrash2 size={18} />
                        <span>Удалить</span>
                      </button>
                      <div className={styles.addToCartWrapper}>
                        <AddToCart
                          productId={item.id}
                          onQuantityChange={handleAddToCartQuantityChange}
                          delayedRemoval={true}
                        />
                      </div>


                    </div>
                  </div>

                  {/* Оверлей удаления - поверх всей карточки */}
                  {isRemoving && (
                    <div className={styles.removingOverlayWrapper}>
                      <div className={styles.removingOverlay}>
                        <div className={styles.removingText}>
                          Товар будет удалён через 3 сек
                        </div>
                        <button
                          className={styles.restoreButton}
                          onClick={() => cancelRemoval(item.id)}
                          type="button"
                        >
                          <FiCheck size={18} />
                          <span>Восстановить</span>
                        </button>
                        <div className={styles.removingProgress}></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Итоговая панель */}
          <div className={styles.cartSummary}>
            <h2 className={styles.summaryTitle}>Итого</h2>

            {selectedCount > 0 ? (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Выбрано товаров ({selectedCount} шт.)</span>
                <span className={styles.summaryValue}>
                  {formatPrice(selectedTotal.toString())}
                </span>
              </div>
            ) : null}

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Товары ({totalItems} шт.)</span>
              <span className={styles.summaryValue}>
                {formatPrice(totalPrice.toString())}
              </span>
            </div>

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Доставка</span>
              <span className={styles.summaryValueFree}>Бесплатно</span>
            </div>

            <div className={styles.summaryTotal}>
              <span className={styles.totalLabel}>Общая сумма:</span>
              <span className={styles.totalValue}>
                {formatPrice(totalPrice.toString())}
              </span>
            </div>

            <div className={styles.summaryBenefits}>
              <span className={styles.benefitItem}>
                <FiTruck size={16} /> Бесплатная доставка
              </span>
              <span className={styles.benefitItem}>
                <FiShield size={16} /> Гарантия возврата
              </span>
            </div>

            <Link to={paths.CHECKOUT} className={styles.checkoutButton}>
              Оформить заказ
              <FiArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
