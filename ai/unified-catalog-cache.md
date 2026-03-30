# Единый кэш для каталога товаров

## Проблема (было)

**До изменений:**
- `marketplace_cache_*` создавал **отдельный ключ для каждого offset**:
  ```
  marketplace_cache_v1_{"endpoint":"/product","params":{"offset":0,...}}
  marketplace_cache_v1_{"endpoint":"/product","params":{"offset":12,...}}
  marketplace_cache_v1_{"endpoint":"/product","params":{"offset":24,...}}
  marketplace_cache_v1_{"endpoint":"/product","params":{"offset":36,...}}
  marketplace_cache_v1_{"endpoint":"/product","params":{"offset":48,...}}
  ```
- При достижении offset=48 товары исчезали
- Конфликт между старым и новым кэшем

## Решение (стало)

**Теперь:**
- **ЕДИНЫЙ ключ кэша** на категорию/фильтры:
  ```
  catalogCache_v1_all_1_f_{"RAM":["8 GB"]}  // один ключ, который дополняется
  ```
- Кэш **не зависит от offset**
- Товары **дополняются** при листании
- Старый `marketplace_cache_*` автоматически очищается

## Архитектура

### Структура кэша

```javascript
{
  products: [...],      // ВСЕ загруженные товары (дополняется)
  total: 150,           // Общее количество товаров
  sort_type: 'default', // Тип сортировки
  timestamp: 1234567890 // Время последнего обновления
}
```

**Важно:** `offset` НЕ сохраняется в кэше!

### Логика работы

#### 1. Первая загрузка (offset=0)
```javascript
// Запрос: /product?limit=12&offset=0
// Ответ: { items: [1-12], total: 150 }

// Кэш:
{
  products: [1-12],
  total: 150,
  timestamp: ...
}
```

#### 2. Вторая загрузка (offset=12)
```javascript
// Запрос: /product?limit=12&offset=12
// Ответ: { items: [13-24], total: 150 }

// Кэш ДОПОЛНЯЕТСЯ:
{
  products: [1-24],  // 1-12 + 13-24
  total: 150,
  timestamp: ...
}
```

#### 3. Третья загрузка (offset=24)
```javascript
// Запрос: /product?limit=12&offset=24
// Ответ: { items: [25-36], total: 150 }

// Кэш ДОПОЛНЯЕТСЯ:
{
  products: [1-36],  // 1-24 + 25-36
  total: 150,
  timestamp: ...
}
```

### Ключ кэша

**Формат:**
```
catalogCache_v1_{category_id}_{product_type_id}_f_{filters}
```

**Примеры:**
```
catalogCache_v1_all_1                      // без фильтров
catalogCache_v1_all_1_f_{"RAM":["8 GB"]}   // с фильтрами
catalogCache_v1_101_1                      // категория 101
```

## Реализация

### useCatalog.js

#### loadMore (дополнение кэша)
```javascript
const loadMore = useCallback(async () => {
  if (loadingRef.current || !hasMore) return;

  loadingRef.current = true;
  setLoadingMore(true);

  const newOffset = offsetRef.current + limit;

  const result = await productApi.getProducts({
    offset: newOffset,
    // ... параметры
  });

  if (result.success) {
    const { items, total: totalItems } = result.data;

    // ДОПОЛНЯЕМ единый кэш
    setProducts((prev) => {
      const newProducts = [...prev, ...items];
      productsLengthRef.current = newProducts.length;
      setHasMore(newProducts.length < totalItems);
      return newProducts;
    });

    setTotal(totalItems);
  }
}, [/* зависимости */]);
```

#### Сохранение в кэш
```javascript
useEffect(() => {
  if (!enableCache || loading || products.length === 0) return;

  const cacheKey = `catalogCache_v1_${categoryKey}${filtersKey}`;

  const state = {
    products,      // ВСЕ товары
    total,
    sort_type,
    timestamp: Date.now(),
    // offset НЕ сохраняем!
  };

  localStorage.setItem(cacheKey, JSON.stringify(state));
}, [products, total, /* ... */]);
```

#### Восстановление из кэша
```javascript
useEffect(() => {
  if (enableCache && categoryChanged) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const cache = JSON.parse(cached);
      // Проверяем актуальность (5 минут)
      if (Date.now() - cache.timestamp < 5 * 60 * 1000) {
        setProducts(cache.products);  // Восстанавливаем ВСЕ товары
        setTotal(cache.total);
        setHasMore(cache.products.length < cache.total);
        return;
      }
    }
  }
  // Загрузка с API
}, [category_id, product_type_id, /* ... */]);
```

### apiClient.js

Отключено кэширование для `/product`:
```javascript
const shouldUseCache = useCache && endpoint !== '/product';

if (shouldUseCache) {
  // Используем кэш apiClient
} else {
  // Прямой запрос (кэш управляется в useCatalog)
}
```

### catalogApi.js

Явно отключено кэширование:
```javascript
return crmApi.request('/product', {
  params,
  f5,
  useCache: false,  // Кэш управляется в useCatalog
});
```

### CatalogPage.jsx

Автоматическая очистка старого кэша:
```javascript
useEffect(() => {
  clearLegacyCache();  // Удаляет marketplace_cache_*
}, []);
```

## Тестирование

### 1. Очистка старого кэша
```javascript
// В консоли браузера
localStorage.clear();
```

### 2. Загрузка каталога
1. Откройте каталог товаров
2. Откройте DevTools → Application → Local Storage

### 3. Проверка кэша
**Должно быть:**
```
catalogCache_v1_all_1  // ОДИН ключ
```

**НЕ должно быть:**
```
marketplace_cache_v1_{"endpoint":"/product",...}  // Множество ключей
```

### 4. Листание
1. Скролльте вниз
2. Следите за `catalogCache_v1_all_1`
3. **products должен дополняться:**
   - Было: `products.length: 12`
   - Стало: `products.length: 24`
   - Стало: `products.length: 36`

### 5. Проверка работы
- Товары **НЕ исчезают** при достижении offset=48
- Товары **НЕ исчезают** при быстром скролле
- Кэш **один** и **дополняется**

## Преимущества

| Было | Стало |
|------|-------|
| Множество ключей (на каждый offset) | Один ключ на категорию |
| Конфликт кэшей | Нет конфликтов |
| Товары исчезали | Товары стабильны |
| Сложная логика | Простая логика |
| Зависимость от offset | Независим от offset |

## Миграция

При первом запуске:
1. `clearLegacyCache()` автоматически удалит `marketplace_cache_*`
2. Создастся новый `catalogCache_v1_*`
3. Кэш будет дополняться при листании

## Примечания

- **TTL кэша:** 5 минут
- **Очистка:** При изменении категории/фильтров
- **Восстановление:** Автоматическое при возврате на страницу
