import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { getCategoryTree, groupCategories } from "../../features/categories";
import LazyImage from "../../shared/ui/LazyImage";
import styles from "./CatalogMenu.module.css";

function CatalogMenu({ onClose }) {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  /**
   * Загрузка дерева категорий
   */
  const loadCategories = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCategoryTree({
        f5: force,
      });

      if (result.success) {
        const items = result.data?.items || [];
        setCategories(items);
        
        // Открываем первую категорию с детьми по умолчанию
        const firstWithChildren = items.find(cat => cat.children && cat.children.length > 0);
        if (firstWithChildren) {
          setSelectedCategory(firstWithChildren.id);
          setHoveredCategory(firstWithChildren.id);
        }
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }, []);

  /**
   * Загрузка при монтировании
   */
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  /**
   * Переход к категории
   */
  const handleCategoryClick = (categoryId) => {
    navigate(`/catalog?category=${categoryId}`);
    if (onClose) onClose();
  };

  /**
   * Переход к каталогу с родительской категорией
   */
  const handleShowAll = (categoryId) => {
    navigate(`/catalog?category=${categoryId}`);
    if (onClose) onClose();
  };

  /**
   * Hover для категории
   */
  const handleMouseEnter = (categoryId) => {
    setHoveredCategory(categoryId);
  };

  const handleMouseLeave = () => {
    // При уходе мыши остаётся selectedCategory
    setHoveredCategory(selectedCategory);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setHoveredCategory(categoryId);
  };

  /**
   * Loading
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <nav className={styles.menu}>
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className={styles.skeleton}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonText}></div>
              </div>
            </div>
          ))}
        </nav>
      </div>
    );
  }

  /**
   * Error
   */
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.catalogGrid}>
      {/* Левая панель - список родительских категорий */}
      <div className={styles.leftSidebar}>
        <nav className={styles.menu}>
          {categories.map((category) => {
            const hasChildren = category.children && category.children.length > 0;
            const isSelected = selectedCategory === category.id;
            const isHovered = hoveredCategory === category.id;
            const imageUrl = category.image?.image_url || null;

            return (
              <div
                key={category.id}
                className={`${styles.menuItem} ${isSelected ? styles.menuItemSelected : ''} ${isHovered ? styles.menuItemHovered : ''}`}
                onMouseEnter={() => hasChildren && handleMouseEnter(category.id)}
                onMouseLeave={handleMouseLeave}
                onClick={() => hasChildren && handleCategorySelect(category.id)}
              >
                <div className={styles.menuItemContent}>
                  {/* Изображение категории */}
                  <div className={styles.categoryImage}>
                    <LazyImage
                      src={imageUrl}
                      alt={category.name}
                      observerOptions={{ rootMargin: '200px' }}
                    />
                  </div>

                  {/* Название */}
                  <div className={styles.categoryInfo}>
                    <span className={styles.categoryName}>{category.name}</span>
                    {category.manufacturer && (
                      <span className={styles.manufacturer}>
                        {category.manufacturer.name}
                      </span>
                    )}
                  </div>

                  {/* Стрелочка справа */}
                  {hasChildren && (
                    <span className={styles.arrowIcon}>
                      <FiChevronRight size={16} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Правая панель - контент выбранной категории */}
      {selectedCategory && (
        <div className={styles.rightContent}>
          {(() => {
            const category = categories.find((cat) => cat.id === selectedCategory);
            if (!category || !category.children?.length) {
              return (
                <div className={styles.noChildren}>
                  <p>Выберите категорию слева</p>
                </div>
              );
            }
            return (
              <div className={styles.categoryContent}>
                <div className={styles.categoryHeader}>
                  <h3 className={styles.categoryTitle}>{category.name}</h3>
                  <button
                    className={styles.showAllBtn}
                    onClick={() => handleShowAll(category.id)}
                  >
                    Показать все
                  </button>
                </div>
                <div className={styles.groupedContent}>
                  {groupCategories(category.children).map((group) => (
                    <div key={group.groupKey} className={styles.group}>
                      <h4 className={styles.groupTitle}>{group.groupName}</h4>
                      <div className={styles.groupItems}>
                        {group.items.map((item) => (
                          <div
                            key={item.id}
                            className={styles.groupItem}
                            onClick={() => handleCategoryClick(item.id)}
                          >
                            <span className={styles.groupItemName}>{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default CatalogMenu;
