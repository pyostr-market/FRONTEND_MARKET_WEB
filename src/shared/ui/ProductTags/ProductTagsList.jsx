import styles from './ProductTagsList.module.css';

/**
 * Компонент отображения тегов товара в потоке (не абсолютно)
 * Используется на странице товара под рейтингом
 * @param {Object} props
 * @param {Array} props.tags - Массив тегов товара
 */
const ProductTagsList = ({ tags = [] }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const parseColor = (color) => {
    if (!color) return null;
    
    // Если цвет в формате RGB (например, "rgb(255, 255, 255)")
    if (color.startsWith('rgb')) {
      return color;
    }
    
    // Если цвет в формате HEX (например, "#ff0000")
    if (color.startsWith('#')) {
      return color;
    }
    
    // Если это название цвета или другое значение
    return color;
  };

  return (
    <div className={styles.tagsList}>
      {tags.map((tag) => {
        const backgroundColor = parseColor(tag.color);
        const tagStyle = backgroundColor 
          ? { backgroundColor }
          : {};

        return (
          <span
            key={tag.tag_id || tag.name}
            className={styles.tag}
            style={tagStyle}
          >
            {tag.name}
          </span>
        );
      })}
    </div>
  );
};

export default ProductTagsList;
