import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { getProductTypes } from "../../features/productTypes";
import styles from "./ProductTypeMenu.module.css";

function ProductTypeMenu() {
  const navigate = useNavigate();

  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
  });

  const [isMobile, setIsMobile] = useState(false);

  const itemRefs = useRef({});

  /**
   * Определяем mobile
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  /**
   * Загрузка типов товаров
   */
  const loadProductTypes = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getProductTypes({
        f5: force,
      });

      if (result.success) {
        setProductTypes(result.data?.items || []);
      } else {
        setError("Ошибка загрузки типов товаров");
        console.error(result.error);
      }
    } catch (err) {
      console.error(err);
      setError("Ошибка загрузки типов товаров");
    }

    setLoading(false);
  }, []);

  /**
   * Загрузка при монтировании
   */
  useEffect(() => {
    loadProductTypes();
  }, [loadProductTypes]);

  /**
   * Переход в каталог
   */
  const handleTypeClick = (typeId) => {
    navigate(`/catalog?product_type=${typeId}`);
  };

  /**
   * Hover desktop
   */
  const handleMouseEnter = (typeId, event) => {
    if (isMobile) return;

    setHoveredItem(typeId);

    const rect = event.currentTarget.getBoundingClientRect();

    setDropdownPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
    });
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setHoveredItem(null);
    }
  };

  /**
   * Mobile раскрытие
   */
  const handleItemClick = (typeId, hasChildren) => {
    if (isMobile && hasChildren) {
      setExpandedItem((prev) => (prev === typeId ? null : typeId));
      return;
    }

    handleTypeClick(typeId);
  };

  /**
   * Loading
   */
  if (loading) {
    return (
        <div className={styles.container}>
          <div className={styles.loading}>Загрузка...</div>
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
      <div className={styles.container}>
        <nav className={styles.menu}>
          {productTypes.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isHovered = hoveredItem === item.id;
            const isExpanded = expandedItem === item.id;

            return (
                <div
                    key={item.id}
                    ref={(el) => {
                      itemRefs.current[item.id] = el;
                    }}
                    className={styles.menuItem}
                    onMouseEnter={(e) => handleMouseEnter(item.id, e)}
                    onMouseLeave={handleMouseLeave}
                >
                  <div
                      className={`${styles.menuItemContent} ${
                          hasChildren ? styles.hasChildren : ""
                      }`}
                      onClick={() => handleItemClick(item.id, hasChildren)}
                  >
                    <span className={styles.itemName}>{item.name}</span>

                    {hasChildren && (
                        <span className={styles.icon}>
                    <FiChevronDown size={12} />
                  </span>
                    )}
                  </div>

                  {/* Desktop dropdown */}
                  {hasChildren && !isMobile && isHovered && (
                      <div
                          className={styles.dropdown}
                          style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                          }}
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={handleMouseLeave}
                      >
                        {item.children.map((child) => (
                            <div
                                key={child.id}
                                className={styles.dropdownItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTypeClick(child.id);
                                }}
                            >
                              {child.name}
                            </div>
                        ))}
                      </div>
                  )}

                  {/* Mobile children */}
                  {hasChildren && isMobile && isExpanded && (
                      <div className={styles.childrenList}>
                        {item.children.map((child) => (
                            <div
                                key={child.id}
                                className={styles.childItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTypeClick(child.id);
                                }}
                            >
                              {child.name}
                            </div>
                        ))}
                      </div>
                  )}
                </div>
            );
          })}
        </nav>
      </div>
  );
}

export default ProductTypeMenu;