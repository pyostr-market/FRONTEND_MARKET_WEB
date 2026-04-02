import LazyImage from '../../shared/ui/LazyImage';
import styles from './PromoBlocks.module.css';

const promoBlocks = [
  {
    id: 1,
    image: 'https://via.placeholder.com/700x300/ff3b30/ffffff?text=Распродажа',
    link: '/catalog?sale=true',
    title: 'Распродажа',
  },
  {
    id: 2,
    image: 'https://via.placeholder.com/700x300/00c853/ffffff?text=Новая+коллекция',
    link: '/catalog?new=true',
    title: 'Новая коллекция',
  },
];

const PromoBlocks = () => {
  return (
    <div className={styles.promoBlocks}>
      <div className={styles.grid}>
        {promoBlocks.map((block) => (
          <a
            key={block.id}
            href={block.link}
            className={styles.promoCard}
          >
            <LazyImage
              src={block.image}
              alt={block.title}
              className={styles.promoImage}
            />
            <div className={styles.promoOverlay}>
              <h3 className={styles.promoTitle}>{block.title}</h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PromoBlocks;
