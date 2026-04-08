import { useCallback, useMemo, useState } from 'react';
import { FiStar } from 'react-icons/fi';
import styles from './StarRating.module.css';

const RATING_LABELS = {
  1: 'Очень плохо',
  2: 'Плохо',
  3: 'Нормально',
  4: 'Хорошо',
  5: 'Отлично',
};

/**
 * StarRating — интерактивный или статичный рейтинг с шагом 0.5
 * @param {Object} props
 * @param {number} props.value - Текущее значение (0-5)
 * @param {function} [props.onChange] - Callback при выборе (если нет — статичный режим)
 * @param {number} [props.size=20] - Размер звёзд в px
 * @param {boolean} [props.readOnly=false] - Режим только для чтения
 * @param {string} [props.className] - Дополнительный CSS класс
 */
const StarRating = ({ value = 0, onChange, size = 20, readOnly = false, className = '' }) => {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const getLabel = useCallback((val) => {
    const rounded = Math.round(val);
    return RATING_LABELS[rounded] || '';
  }, []);

  /**
   * Вычисляем заполненность каждой звезды: 0, 0.5, или 1
   */
  const stars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNum = i + 1;
      let fill = 0;
      if (displayValue >= starNum) {
        fill = 1;
      } else if (displayValue >= starNum - 0.5) {
        fill = 0.5;
      }
      return { index: starNum, fill };
    });
  }, [displayValue]);

  const handleClick = useCallback((index) => {
    if (readOnly || !onChange) return;
    // Клик на левую половину — 0.5, правую — целое
    onChange(index);
  }, [readOnly, onChange]);

  const handleMouseMove = useCallback((e, index) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const half = rect.width / 2;
    const val = x <= half ? index - 0.5 : index;
    setHoverValue(val);
  }, [readOnly]);

  const handleMouseLeave = useCallback(() => {
    setHoverValue(null);
  }, []);

  const interactive = !readOnly && !!onChange;

  return (
    <div className={`${styles.starRating} ${className}`}>
      <div
        className={`${styles.starsWrapper} ${interactive ? styles.interactive : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        {stars.map(({ index, fill }) => (
          <div
            key={index}
            className={styles.starContainer}
            onClick={() => handleClick(index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            style={{ width: size, height: size }}
          >
            {/* Фоновая звезда (контур) */}
            <FiStar
              className={`${styles.starSvg} ${styles.starEmpty}`}
              size={size}
            />
            {/* Заполненная звезда с clip-path */}
            <FiStar
              className={`${styles.starSvg} ${styles.star_Filled}`}
              size={size}
              style={{
                clipPath: fill === 1
                  ? 'none'
                  : fill === 0.5
                    ? 'inset(0 50% 0 0)'
                    : 'inset(0 100% 0 0)',
              }}
            />
            {/* Левая половинка для half-star (клик для 0.5) */}
            {interactive && fill === 0.5 && (
              <FiStar
                className={`${styles.starSvg} ${styles.star_Empty}`}
                size={size}
                style={{
                  clipPath: 'inset(0 0 0 50%)',
                  opacity: 0,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>
      {interactive && (
        <span className={styles.ratingLabel}>
          {getLabel(displayValue || 0)}
        </span>
      )}
      {readOnly && value > 0 && (
        <span className={styles.ratingValue}>{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
