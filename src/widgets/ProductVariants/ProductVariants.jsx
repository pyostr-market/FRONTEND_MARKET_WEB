import LazyImage from '../../shared/ui/LazyImage';
import styles from './ProductVariants.module.css';

/**
 * Миниатюры вариантов товара с горизонтальным скроллом (моб.)
 * или сеткой с градиентом и кнопкой «Показать все» (десктоп)
 */
const ProductVariants = ({ variants = [], currentProductId, onVariantSelect, expanded, setExpanded }) => {

    const getMainImage = (variant) => {
        if (!variant.images?.length) return null;
        const main = variant.images.find(img => img.is_main);
        return main || variant.images[0];
    };

    const getShortSpecs = (variant) => {
        if (!variant.attributes) return [];
        return variant.attributes
            .filter(attr => attr.is_filterable && !['Серия', 'Производитель'].includes(attr.name))
            .slice(0, 2)
            .map(attr => attr.value);
    };

    if (variants.length <= 1) return null;

    return (
        <div className={styles.variantsContainer}>
            <h3 className={styles.variantsTitle}>Доступные варианты</h3>

            <div className={`${styles.variantList} ${expanded ? styles.expanded : styles.collapsed}`}>
                {variants.map(variant => {
                    const isCurrent = variant.id === currentProductId;
                    const mainImage = getMainImage(variant);
                    const shortSpecs = getShortSpecs(variant);

                    return (
                        <button
                            key={variant.id}
                            className={`${styles.variantCard} ${isCurrent ? styles.variantCardActive : ''}`}
                            onClick={() => onVariantSelect(variant)}
                            disabled={isCurrent}
                        >
                            <div className={styles.variantImage}>
                                {mainImage ? (
                                    <LazyImage src={mainImage.image_url} alt={variant.name} className={styles.variantImage} />
                                ) : (
                                    <div className={styles.noImage}>Нет фото</div>
                                )}
                                {isCurrent && <div className={styles.activeMarker}>✓</div>}
                            </div>

                            {shortSpecs.length > 0 && (
                                <div className={styles.variantSpecs}>
                                    {shortSpecs.map((spec, i) => (
                                        <span key={i} className={styles.specItem}>{spec}</span>
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}

                {!expanded && variants.length > 4 && (
                    <>
                        <div
                            className={styles.gradientOverlay}
                            onClick={() => setExpanded(true)}
                        />
                        <button
                            className={styles.expandButton}
                            onClick={() => setExpanded(true)}
                        >
                            Показать все
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductVariants;