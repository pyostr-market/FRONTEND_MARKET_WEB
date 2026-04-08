import { useCallback, useEffect, useRef, useState } from 'react';
import { FiThumbsUp, FiThumbsDown, FiUser } from 'react-icons/fi';
import StarRating from '../../shared/ui/StarRating/StarRating';
import Button from '../../shared/ui/Button/Button';
import { getProductReviews } from '../../shared/api/reviewApi';
import ReviewFormModal from '../ReviewFormModal/ReviewFormModal';
import ProfileModal from '../ProfileModal/ProfileModal';
import styles from './ReviewsBlock.module.css';

const REVIEWS_PER_PAGE = 5;

const SORT_OPTIONS = [
  { key: 'useful', label: 'Сначала полезные' },
  { key: 'newest', label: 'Сначала новые' },
  { key: 'highest', label: 'Сначала с высокой оценкой' },
  { key: 'lowest', label: 'Сначала с низкой оценкой' },
];

/**
 * Проверка авторизации
 */
function isAuthorized() {
  return !!localStorage.getItem('access_token');
}

/**
 * Форматирование даты
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Распределение рейтинга
 */
function getRatingDistribution(items) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  items.forEach((review) => {
    const rounded = Math.round(parseFloat(review.rating));
    if (dist[rounded] !== undefined) {
      dist[rounded]++;
    }
  });
  return dist;
}

/**
 * Skeleton загрузки отзывов
 */
function ReviewSkeleton() {
  return (
    <div className={styles.reviewSkeleton}>
      <div className={styles.reviewSkeletonHeader}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.skeletonLine}>
          <div className={`${styles.skeletonText} ${styles.skeletonTextShort}`} />
        </div>
        <div className={styles.skeletonLine}>
          <div className={`${styles.skeletonText} ${styles.skeletonTextMedium}`} />
        </div>
      </div>
      <div className={styles.skeletonBody}>
        <div className={`${styles.skeletonText} ${styles.skeletonTextLong}`} />
        <div className={`${styles.skeletonText} ${styles.skeletonTextLong}`} />
        <div className={`${styles.skeletonText} ${styles.skeletonTextMedium}`} />
      </div>
    </div>
  );
}

/**
 * Карточка отзыва
 */
function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const rating = parseFloat(review.rating);
  const text = review.text || '';
  // Показываем "полностью" если текст длиннее 300 символов
  const isLong = text.length > 300;
  const displayText = isLong && !expanded ? text.slice(0, 300) + '...' : text;

  return (
    <div className={styles.reviewCard}>
      {/* Верхняя строка */}
      <div className={styles.reviewHeader}>
        <div className={styles.reviewUser}>
          <div className={styles.reviewAvatar}>
            <FiUser size={18} />
          </div>
          <span className={styles.reviewUsername}>{review.username}</span>
        </div>
        <div className={styles.reviewMeta}>
          <span className={styles.reviewDate}>{formatDate(review.created_at)}</span>
          <StarRating value={rating} readOnly size={16} />
        </div>
      </div>

      {/* Текст отзыва */}
      {text && (
        <div className={styles.reviewBody}>
          <div className={styles.reviewText}>{displayText}</div>
          {isLong && (
            <button
              className={styles.reviewExpand}
              onClick={() => setExpanded(!expanded)}
              type="button"
            >
              {expanded ? 'Свернуть' : 'Показать полностью'}
            </button>
          )}
        </div>
      )}

      {/* Полезность (заглушка — можно доработать) */}
      <div className={styles.reviewFooter}>
        <div className={styles.reviewHelpful}>
          <span className={styles.reviewHelpfulText}>Был ли отзыв полезен?</span>
          <button className={styles.reviewHelpfulBtn}>
            <FiThumbsUp size={14} /> <span>0</span>
          </button>
          <button className={styles.reviewHelpfulBtn}>
            <FiThumbsDown size={14} /> <span>0</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ReviewsBlock — блок отзывов на странице товара
 * @param {Object} props
 * @param {number} props.productId - ID товара
 * @param {Object} [props.productRating] - Рейтинг товара из API { value, count }
 */
const ReviewsBlock = ({ productId, productRating }) => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('useful');
  const [offset, setOffset] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const loadedRef = useRef(false);

  const loadReviews = useCallback(async (reset = false) => {
    if (!productId) return;
    const currentOffset = reset ? 0 : offset;

    if (reset) {
      setLoading(true);
      setOffset(0);
    }

    const result = await getProductReviews({
      product_id: productId,
      limit: REVIEWS_PER_PAGE,
      offset: currentOffset,
    });

    if (result.success && result.data) {
      setTotal(result.data.total);
      setAverageRating(result.data.average_rating);
      if (reset) {
        setReviews(result.data.items || []);
      } else {
        setReviews((prev) => [...prev, ...(result.data.items || [])]);
      }
    }
    setLoading(false);
    loadedRef.current = true;
  }, [productId, offset]);

  useEffect(() => {
    if (productId && !loadedRef.current) {
      loadReviews(true);
    }
  }, [productId, loadReviews]);

  const handleLoadMore = useCallback(() => {
    setOffset((prev) => prev + REVIEWS_PER_PAGE);
    loadReviews(false);
  }, [loadReviews]);

  const handleWriteReview = useCallback(() => {
    if (!isAuthorized()) {
      setShowAuthModal(true);
      return;
    }
    setShowReviewForm(true);
  }, []);

  const handleReviewSubmitted = useCallback(() => {
    // Перезагружаем отзывы после отправки
    loadedRef.current = false;
    loadReviews(true);
  }, [loadReviews]);

  const hasMore = offset + REVIEWS_PER_PAGE < total;

  // Распределение рейтинга
  const distribution = getRatingDistribution(reviews);
  const maxDistCount = Math.max(...Object.values(distribution), 1);

  const avgDisplay = averageRating !== null ? averageRating : (productRating?.value || 0);
  const countDisplay = total > 0 ? total : (productRating?.count || 0);

  return (
    <div className={styles.reviewsBlock}>
      {/* Сводка рейтинга */}
      <div className={styles.ratingSummary}>
        <div className={styles.ratingSummaryLeft}>
          <div className={styles.ratingBigNumber}>
            {avgDisplay ? avgDisplay.toFixed(1) : '—'}
          </div>
          <div className={styles.ratingBigStars}>
            <StarRating value={avgDisplay} readOnly size={22} />
          </div>
          <div className={styles.ratingCount}>
            На основе {countDisplay} {getReviewWord(countDisplay)}
          </div>
        </div>

        {/* Распределение */}
        <div className={styles.ratingDist}>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className={styles.ratingDistRow}>
              <span className={styles.ratingDistStar}>{star} ★</span>
              <div className={styles.ratingDistBar}>
                <div
                  className={styles.ratingDistBarFill}
                  style={{ width: `${(distribution[star] / maxDistCount) * 100}%` }}
                />
              </div>
              <span className={styles.ratingDistCount}>{distribution[star]}</span>
            </div>
          ))}
        </div>

        {/* Кнопка "Написать отзыв" */}
        <Button variant="primary" size="medium" onClick={handleWriteReview}>
          Написать отзыв
        </Button>
      </div>

      {/* Сортировка */}
      {total > 0 && (
        <div className={styles.sortBar}>
          <span className={styles.sortLabel}>Сортировать:</span>
          <div className={styles.sortOptions}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`${styles.sortBtn} ${sort === opt.key ? styles.sortBtnActive : ''}`}
                onClick={() => setSort(opt.key)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Скелетоны или список отзывов */}
      {loading && offset === 0 ? (
        <div className={styles.reviewsList}>
          {[1, 2, 3].map((i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      ) : total === 0 ? (
        /* Пустое состояние */
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭐</div>
          <h3 className={styles.emptyTitle}>Отзывов пока нет</h3>
          <p className={styles.emptyText}>
            Будьте первым, кто поделится впечатлением о товаре.
          </p>
          <Button variant="primary" size="medium" onClick={handleWriteReview}>
            Написать отзыв
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.reviewsList}>
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {hasMore && (
            <div className={styles.loadMoreWrapper}>
              <Button
                variant="secondary"
                size="medium"
                onClick={handleLoadMore}
                loading={loading}
              >
                Показать ещё {REVIEWS_PER_PAGE} отзывов
              </Button>
            </div>
          )}
        </>
      )}

      {/* Модалка авторизации */}
      <ProfileModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Модалка формы отзыва */}
      <ReviewFormModal
        isOpen={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        productId={productId}
        onSuccess={handleReviewSubmitted}
      />
    </div>
  );
};

/**
 * Склонение слова "отзыв"
 */
function getReviewWord(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 19) return 'отзывов';
  if (mod10 === 1) return 'отзыва';
  if (mod10 >= 2 && mod10 <= 4) return 'отзывов';
  return 'отзывов';
}

export default ReviewsBlock;
