/**
 * Конфигурация приложения
 * Все URL берутся из переменных окружения (.env)
 */

// Базовые URL для API из переменных окружения
export const API_URLS = {
  CRM: process.env.REACT_APP_PRODUCT_SERVICE_BASE_URL || 'https://market-product.open-gpt.ru',
  USER: process.env.REACT_APP_USER_SERVICE_BASE_URL || 'https://market-user.open-gpt.ru',
  PRICING: process.env.REACT_APP_PRICING_ENGINE_BASE_URL || 'https://pricing-engine.demo-market.ru',
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
