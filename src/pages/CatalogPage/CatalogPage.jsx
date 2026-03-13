import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Страница каталога товаров
 * Поддерживает фильтрацию по product_type через query параметр
 */
const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const [productTypeId, setProductTypeId] = useState(null);

  useEffect(() => {
    const typeId = searchParams.get('product_type');
    if (typeId) {
      setProductTypeId(typeId);
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '24px' }}>
      <h1>Каталог товаров</h1>
      {productTypeId ? (
        <p>Выбран тип товара: <strong>ID {productTypeId}</strong></p>
      ) : (
        <p>Выберите категорию товара из меню</p>
      )}
    </div>
  );
};

export default CatalogPage;
