import { useState, useCallback, useEffect } from 'react';
import { FiHeart, FiRotateCcw } from 'react-icons/fi';
import { useWishlist } from '../../app/store/wishlistStore';
import useCartProducts from '../../shared/hooks/useCartProducts';
import ProductCard from '../../widgets/ProductCard/ProductCard';
import WishlistItemSkeleton from './WishlistItemSkeleton';
import styles from './WishlistItem.module.css';

/**
 * Карточка товара в избранном с логикой undo при удалении
 * При клике на сердечко:
 *   1. Карточка затемняется, появляется кнопка "Восстановить"
 *   2. Через 3 секунды товар реально удаляется
 *   3. Если нажато "Восстановить" — удаление отменяется
 */
const WishlistItem = ({ productId }) => {
  const { products, loading, error } = useCartProducts([productId]);
  const { removeFromWishlist, addToWishlist } = useWishlist();

  const product = products[0];

  // Состояние: null = обычное, { productId, timerId } = ожидание удаления
  const [pendingDelete, setPendingDelete] = useState(null);

  /**
   * Начать процесс удаления (при клике на сердечко)
   */
  const handleStartDelete = useCallback(() => {
    const timerId = setTimeout(() => {
      // Через 3 секунды реально удаляем
      removeFromWishlist(productId);
      setPendingDelete(null);
    }, 3000);

    setPendingDelete({ productId, timerId });
  }, [productId, removeFromWishlist]);

  /**
   * Восстановить товар
   */
  const handleRestore = useCallback(() => {
    if (pendingDelete?.timerId) {
      clearTimeout(pendingDelete.timerId);
    }
    setPendingDelete(null);
  }, [pendingDelete]);

  /**
   * Очистка таймера при размонтировании
   */
  useEffect(() => {
    return () => {
      if (pendingDelete?.timerId) {
        clearTimeout(pendingDelete.timerId);
      }
    };
  }, [pendingDelete]);

  if (loading) {
    return <WishlistItemSkeleton />;
  }

  if (error || !product) {
    return (
      <div className={styles.wishlistItem}>
        <div className={styles.productNotFound}>
          {error ? 'Ошибка' : 'Товар не найден'}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.wishlistItem} ${pendingDelete ? styles.wishlistItemPending : ''}`}>
      {/* Затемнённый оверлей с кнопкой восстановления */}
      {pendingDelete && (
        <div className={styles.undoOverlay}>
          <div className={styles.undoContent}>
            <FiHeart size={32} className={styles.undoIcon} />
            <p className={styles.undoText}>Товар удалён</p>
            <button className={styles.undoButton} onClick={handleRestore}>
              <FiRotateCcw size={16} />
              <span>Восстановить</span>
            </button>
          </div>
        </div>
      )}

      {/* Кнопка сердечка поверх карточки */}
      <button
        className={`${styles.heartButton} ${pendingDelete ? styles.heartButtonPending : ''}`}
        onClick={handleStartDelete}
        aria-label="Удалить из избранного"
        type="button"
      >
        <FiHeart size={20} />
      </button>

      {/* Сама карточка товара */}
      <ProductCard product={product} hideWishlistButton />
    </div>
  );
};

export default WishlistItem;
