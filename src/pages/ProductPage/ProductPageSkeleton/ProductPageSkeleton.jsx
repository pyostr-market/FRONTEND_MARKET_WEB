import { Fragment } from 'react';
import desktop from './ProductPageSkeleton.desktop.module.css';
import mobile from './ProductPageSkeleton.mobile.module.css';

function cx(className) {
  return `${desktop[className] || ''} ${mobile[className] || ''}`.trim();
}

const ProductPageSkeleton = () => {
  return (
    <div className={cx('skeletonPage')}>
      <div className={cx('container')}>
        <div className={cx('skeletonContent')}>
          {/* Gallery Skeleton */}
          <div className={cx('gallery')}>
            <div className={cx('skeletonImage')} />
          </div>

          {/* Main Info Skeleton */}
          <div className={cx('mainInfo')}>
            {/* Price on mobile */}
            <div className={cx('price_mobile')}>
              <div className={cx('skeletonPriceMobile')} />
            </div>

            {/* Title */}
            <div className={cx('skeletonTitle')} />

            {/* Rating & Badge */}
            <div className={cx('ratingAndBadge')}>
              <div className={cx('skeletonRating')} />
              <div className={cx('skeletonBadge')} />
            </div>

            {/* Wishlist button */}
            <div className={cx('skeletonWishlist')} />

            {/* Variants Skeleton */}
            <div className={cx('variantsSection')}>
              <div className={cx('skeletonVariantsTitle')} />
              <div className={cx('skeletonVariantsList')}>
                {[...Array(4)].map((_, i) => (
                  <Fragment key={i}>
                    <div className={cx('skeletonVariantCard')}>
                      <div className={cx('skeletonVariantImage')} />
                      <div className={cx('skeletonVariantSpecs')}>
                        <div className={cx('skeletonSpec')} />
                        <div className={cx('skeletonSpec')} />
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>

            {/* Short Specs Skeleton */}
            <div className={cx('skeletonShortSpecs')}>
              <div className={cx('skeletonShortSpecsTitle')} />
              {[...Array(4)].map((_, i) => (
                <div key={i} className={cx('skeletonShortSpecRow')}>
                  <div className={cx('skeletonSpecName')} />
                  <div className={cx('skeletonSpecValue')} />
                </div>
              ))}
            </div>
          </div>

          {/* Buy Block Skeleton */}
          <div className={cx('buyBlock')}>
            <div className={cx('skeletonBuyBox')}>
              <div className={cx('skeletonBuyPrice')} />
              <div className={cx('skeletonBuyStock')} />
              <div className={cx('skeletonBuyButton')} />
              <div className={cx('skeletonBuyButtonSecondary')} />
              <div className={cx('skeletonBuyButtonTertiary')} />
            </div>
            {/* Plyte Widget Skeleton */}
            <div className={cx('skeletonPlyte')}>
              <div className={cx('skeletonPlyteHeader')} />
              <div className={cx('skeletonPlyteText')} />
              <div className={cx('skeletonPlyteLine')} />
              <div className={cx('skeletonPlyteFooter')}>
                <div className={cx('skeletonPlyteItem')} />
                <div className={cx('skeletonPlyteItem')} />
                <div className={cx('skeletonPlyteItem')} />
              </div>
            </div>
          </div>
        </div>

        {/* Description Section Skeleton */}
        <div className={cx('skeletonDescription')}>
          <div className={cx('skeletonSectionTitle')} />
          <div className={cx('skeletonDescriptionLines')}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={cx('skeletonDescriptionLine')}
                style={{ width: `${85 - i * 8}%` }}
              />
            ))}
          </div>
        </div>

        {/* Full Specs Skeleton */}
        <div className={cx('skeletonFullSpecs')}>
          <div className={cx('skeletonSectionTitle')} />
          <div className={cx('skeletonSpecsTable')}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={cx('skeletonSpecRow')}>
                <div className={cx('skeletonSpecLabel')} />
                <div className={cx('skeletonSpecData')} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPageSkeleton;
