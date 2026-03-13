/**
 * Конфигурация приложения
 */

// Базовые URL для API
export const API_URLS = {
  CRM: 'https://market-product.open-gpt.ru',
  USER: 'https://market-user.open-gpt.ru',
};

// Изображения по умолчанию
export const DEFAULT_IMAGES = {
  NOT_FOUND: 'https://s3.twcstorage.ru/2481cb39-trade/notfound.png',
};

// Настройки кэша
export const CACHE = {
  DEFAULT_TTL: 60000, // 60 секунд
};

// Настройки пагинации
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
};

// Настройки ленивой загрузки
export const LAZY_LOAD = {
  ROOT_MARGIN: '100px',
  THRESHOLD: 0.01,
};

const appConfig = {
  API_URLS,
  DEFAULT_IMAGES,
  CACHE,
  PAGINATION,
  LAZY_LOAD,
};

export default appConfig;
