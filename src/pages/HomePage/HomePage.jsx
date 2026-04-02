import HeroBanner from '../../widgets/HeroBanner/HeroBanner';
import CategoriesGrid from '../../widgets/CategoriesGrid/CategoriesGrid';
import PromoBlocks from '../../widgets/PromoBlocks/PromoBlocks';
import InfiniteCatalog from '../../widgets/InfiniteCatalog/InfiniteCatalog';
import styles from './HomePage.module.css';

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      {/* Баннер-карусель */}
      <HeroBanner />

      {/* Сетка категорий */}
      <CategoriesGrid />

      {/* Рекламные блоки */}
      <PromoBlocks />

      {/* Бесконечный каталог */}
      <InfiniteCatalog />
    </div>
  );
};

export default HomePage;
