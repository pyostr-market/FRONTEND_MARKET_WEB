import styles from './ProductTags.module.css';

/**
 * Компонент отображения тегов товара в нижнем левом углу
 * @param {Object} props
 * @param {Array} props.tags - Массив тегов товара
 * @param {string} props.position - Позиция: 'bottom-left' | 'bottom-right' (по умолчанию 'bottom-left')
 */
const ProductTags = ({ tags = [], position = 'bottom-left' }) => {
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

  const positionClass = position === 'bottom-right' 
    ? styles.tagsContainerRight 
    : styles.tagsContainer;

  return (
    <div className={positionClass}>
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

export default ProductTags;
