import { useCallback, useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import StarRating from '../../shared/ui/StarRating/StarRating';
import Button from '../../shared/ui/Button/Button';
import Toast from '../../shared/ui/Toast/Toast';
import { createReview } from '../../shared/api/reviewApi';
import styles from './ReviewFormModal.module.css';

const MAX_TEXT_LENGTH = 5000;

const ReviewFormModal = ({ isOpen, onClose, productId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  // Сброс формы при открытии
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setPros('');
      setCons('');
      setComment('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    if (!submitting) {
      onClose();
    }
  }, [submitting, onClose]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setError('Поставьте оценку от 1 до 5');
      return;
    }

    // Формируем текст отзыва из трёх полей
    const textParts = [];
    if (pros.trim()) textParts.push(`Достоинства: ${pros.trim()}`);
    if (cons.trim()) textParts.push(`Недостатки: ${cons.trim()}`);
    if (comment.trim()) textParts.push(comment.trim());

    const text = textParts.join('\n\n');

    if (!text.trim()) {
      setError('Заполните хотя бы одно поле');
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      setError(`Текст слишком длинный (максимум ${MAX_TEXT_LENGTH} символов)`);
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await createReview({
      product_id: productId,
      rating,
      text,
    });

    setSubmitting(false);

    if (result.success) {
      setToast({ open: true, type: 'success', message: 'Спасибо! Ваш отзыв опубликован.' });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      if (result.error?.status === 400) {
        setError('Вы уже оставили отзыв на этот товар');
      } else {
        setError(result.error?.message || 'Ошибка при отправке отзыва');
      }
    }
  }, [rating, pros, cons, comment, productId, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Шапка */}
        <div className={styles.header}>
          <h2 className={styles.title}>Написать отзыв</h2>
          <button className={styles.closeBtn} onClick={handleClose} disabled={submitting}>
            <FiX size={20} />
          </button>
        </div>

        {/* Форма */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Рейтинг */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Оценка</label>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>

          {/* Достоинства */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Достоинства</label>
            <textarea
              className={styles.textarea}
              placeholder="Что вам понравилось? Качество, удобство, цена..."
              value={pros}
              onChange={(e) => setPros(e.target.value)}
              rows={3}
              disabled={submitting}
            />
          </div>

          {/* Недостатки */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Недостатки</label>
            <textarea
              className={styles.textarea}
              placeholder="Что можно улучшить?"
              value={cons}
              onChange={(e) => setCons(e.target.value)}
              rows={3}
              disabled={submitting}
            />
          </div>

          {/* Комментарий */}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Комментарий</label>
            <textarea
              className={styles.textarea}
              placeholder="Расскажите подробнее о вашем опыте использования"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={MAX_TEXT_LENGTH}
              disabled={submitting}
            />
            <div className={styles.charCount}>
              {comment.length} / {MAX_TEXT_LENGTH}
            </div>
          </div>

          {/* Ошибка */}
          {error && <div className={styles.errorText}>{error}</div>}

          {/* Кнопка */}
          <div className={styles.submitRow}>
            <Button
              variant="primary"
              size="medium"
              type="submit"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Отправка...' : 'Опубликовать отзыв'}
            </Button>
          </div>
        </form>

        {/* Toast */}
        <Toast
          type={toast.type}
          message={toast.message}
          isOpen={toast.open}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        />
      </div>
    </div>
  );
};

export default ReviewFormModal;
