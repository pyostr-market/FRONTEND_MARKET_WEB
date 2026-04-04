import { useMemo } from 'react';
import LazyImage from '../../shared/ui/LazyImage';
import { sortVariantsAndGetSpecs } from '../../shared/utils/sortVariants';
import styles from './ProductVariants.module.css';

/**
 * Миниатюры вариантов товара с горизонтальным скроллом (моб.)
 * или сеткой с градиентом и кнопкой «Показать все» (десктоп)
 */
const ProductVariants = ({ variants = [], mainProductName, currentProductId, onVariantSelect, expanded, setExpanded, isLoading = false }) => {

    const { sortedVariants, specsMap } = useMemo(
        () => sortVariantsAndGetSpecs(variants, mainProductName),
        [variants, mainProductName]
    );

    if (sortedVariants.length <= 1) return null;

    const getMainImage = (variant) => {
        if (!variant.images?.length) return null;
        const main = variant.images.find(img => img.is_main);
        return main || variant.images[0];
    };

    return (
        <div className={`${styles.variantsContainer} ${isLoading ? styles.variantsLoading : ''}`}>
            <h3 className={styles.variantsTitle}>Доступные варианты</h3>

            <div className={`${styles.variantList} ${expanded ? styles.expanded : styles.collapsed}`}>
                {sortedVariants.map(variant => {
                    const isCurrent = variant.id === currentProductId;
                    const mainImage = getMainImage(variant);
                    const shortSpecs = specsMap[variant.id] || [];

                    return (
                        <button
                            key={variant.id}
                            className={`${styles.variantCard} ${isCurrent ? styles.variantCardActive : ''} ${isLoading ? styles.variantCardDisabled : ''}`}
                            onClick={() => !isLoading && onVariantSelect(variant)}
                            disabled={isCurrent || isLoading}
                        >
                            <div className={styles.variantImage}>
                                {mainImage ? (
                                    <LazyImage src={mainImage.image_url} alt={variant.name} className={styles.variantImage} />
                                ) : (
                                    <div className={styles.noImage}>Нет фото</div>
                                )}
                                {isCurrent && !isLoading && <div className={styles.activeMarker}>✓</div>}
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

                {!expanded && sortedVariants.length > 4 && (
                    <>
                        <div
                            className={styles.gradientOverlay}
                            onClick={() => !isLoading && setExpanded(true)}
                        />
                        <button
                            className={styles.expandButton}
                            onClick={() => !isLoading && setExpanded(true)}
                            disabled={isLoading}
                        >
                            Показать все
                        </button>
                    </>
                )}
            </div>

            {/* Overlay загрузки */}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner} />
                </div>
            )}
        </div>
    );
};

export default ProductVariants;