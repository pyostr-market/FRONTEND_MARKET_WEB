import axios from "axios";
import { API_URLS } from "../config/appConfig";

// -------------------- Кэш и версия --------------------

// Версия кэша по умолчанию
let CACHE_VERSION = localStorage.getItem("marketplace_cache_version") || "v1";
const CACHE_PREFIX_BASE = "marketplace_cache_";
const DEFAULT_TTL = 60000; // 60 секунд

// Быстрый memory cache для текущей сессии
const memoryCache = {};

// Префикс для всех ключей кэша
const CACHE_PREFIX = `${CACHE_PREFIX_BASE}${CACHE_VERSION}_`;

// -------------------- Сброс кэша через Ctrl+F5 --------------------
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "F5") {
        console.log("Ctrl+F5 detected → кэш будет сброшен");

        // Увеличиваем версию кэша
        const savedVersion = localStorage.getItem("marketplace_cache_version");
        const newVersion = savedVersion
            ? `v${parseInt(savedVersion.slice(1)) + 1}`
            : CACHE_VERSION;

        CACHE_VERSION = newVersion;
        localStorage.setItem("marketplace_cache_version", CACHE_VERSION);

        // Очищаем весь кэш по старой версии
        Object.keys(localStorage)
            .filter((key) => key.startsWith(CACHE_PREFIX_BASE))
            .forEach((key) => localStorage.removeItem(key));

        console.log(`Cache version updated to ${CACHE_VERSION} → old localStorage cleared`);
    }
});

// Активные запросы (для deduplication)
const pendingRequests = {};

// -------------------- Вспомогательные функции --------------------

/**
 * Проверка TTL
 * @param {number} timestamp - время сохранения
 * @param {number} ttl - время жизни
 * @returns {boolean}
 */
const isExpired = (timestamp, ttl) => Date.now() - timestamp > ttl;

/**
 * Генерация ключа для кэша
 * @param {string} endpoint
 * @param {object|URLSearchParams} params
 * @returns {string}
 */
const getCacheKey = (endpoint, params) => {
  // Преобразуем URLSearchParams в объект для кэширования
  let paramsObj = params;
  if (params instanceof URLSearchParams) {
    paramsObj = params.toString();
  }
  return `${CACHE_PREFIX}${JSON.stringify({ endpoint, params: paramsObj })}`;
};

/**
 * Получение из memory cache
 * @param {string} key
 */
const getFromMemory = (key) => {
    const cached = memoryCache[key];
    if (!cached) return null;
    if (isExpired(cached.timestamp, cached.ttl)) {
        delete memoryCache[key];
        return null;
    }
    return cached.data;
};

/**
 * Получение из localStorage
 * @param {string} key
 */
const getFromStorage = (key) => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;

        const cached = JSON.parse(raw);
        if (isExpired(cached.timestamp, cached.ttl)) {
            localStorage.removeItem(key);
            return null;
        }

        return cached.data;
    } catch (e) {
        console.warn("Ошибка чтения кэша из localStorage:", e);
        return null;
    }
};

/**
 * Сохранение в memory cache
 * @param {string} key
 * @param {any} data
 * @param {number} ttl
 */
const saveToMemory = (key, data, ttl) => {
    memoryCache[key] = { data, timestamp: Date.now(), ttl };
};

/**
 * Сохранение в localStorage
 * @param {string} key
 * @param {any} data
 * @param {number} ttl
 */
const saveToStorage = (key, data, ttl) => {
    try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now(), ttl }));
    } catch (e) {
        console.warn("Ошибка записи кэша в localStorage:", e);
    }
};

/**
 * Очистка устаревшего localStorage
 */
export const clearExpiredCache = () => {
    const now = Date.now();
    Object.keys(localStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => {
            try {
                const cached = JSON.parse(localStorage.getItem(key));
                if (!cached || now - cached.timestamp > cached.ttl) {
                    localStorage.removeItem(key);
                }
            } catch {
                localStorage.removeItem(key);
            }
        });
};

/**
 * Полная очистка кэша (memory + localStorage)
 * @param {string|null} endpoint - если указано, очищает только по endpoint
 */
export const clearCache = (endpoint = null) => {
    // memory cache
    Object.keys(memoryCache).forEach((key) => {
        if (!endpoint || key.includes(endpoint)) {
            delete memoryCache[key];
        }
    });

    // localStorage
    Object.keys(localStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => {
            if (!endpoint || key.includes(endpoint)) {
                localStorage.removeItem(key);
            }
        });
};

// -------------------- Основной метод запроса --------------------

/**
 * Основной метод запроса
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<{success: boolean, data: any, error: any}>}
 */
export async function request(
    endpoint,
    {
        method = "GET",
        params,
        data,
        ttl = DEFAULT_TTL,
        f5 = false, // ручной сброс кэша через API
        baseService = "crm",
        useCache = true, // можно отключить кэш для конкретных запросов
    } = {}
) {
    // Маппинг имен сервисов
    const serviceUrlMap = {
        user: API_URLS.USER,
        crm: API_URLS.CRM,
        pricing: API_URLS.PRICING,
    };

    const baseUrl = serviceUrlMap[baseService] || API_URLS.CRM;
    
    // Отключаем кэш для /product, так как там есть свой кэш в useCatalog
    const shouldUseCache = useCache && endpoint !== '/product';
    
    const cacheKey = getCacheKey(endpoint, params);

    // Принудительный сброс кэша через функцию
    if (f5) {
        delete memoryCache[cacheKey];
        localStorage.removeItem(cacheKey);
    }

    // 1️⃣ memory cache (только если кэш включён)
    if (shouldUseCache) {
        const memoryData = getFromMemory(cacheKey);
        if (memoryData) return memoryData;

        // 2️⃣ localStorage
        const storageData = getFromStorage(cacheKey);
        if (storageData) {
            saveToMemory(cacheKey, storageData, ttl);
            return storageData;
        }
    }

    // 3️⃣ pending requests (deduplication) - только если кэш включён
    if (shouldUseCache && pendingRequests[cacheKey]) {
        return pendingRequests[cacheKey];
    }

    // 4️⃣ Выполнение запроса через axios
    // Получаем токен авторизации из localStorage
    const token = localStorage.getItem('access_token');
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    // Для FormData не задаём Content-Type — axios сам выставит multipart/form-data с boundary
    const isFormData = data instanceof FormData;

    const requestPromise = axios({
        url: `${baseUrl}${endpoint}`,
        method,
        params,
        data,
        headers: isFormData
            ? { ...authHeaders }
            : { "Content-Type": "application/json", ...authHeaders },
    })
        .then((response) => {
            const result = {
                success: response.data?.success ?? true,
                data: response.data?.data ?? response.data,
                error: null,
            };

            // сохраняем успешные ответы ТОЛЬКО если кэш включён
            if (result.success && shouldUseCache) {
                saveToMemory(cacheKey, result, ttl);
                saveToStorage(cacheKey, result, ttl);
            }

            delete pendingRequests[cacheKey];
            return result;
        })
        .catch((error) => {
            console.error(`API Error: ${method} ${endpoint}`, error);
            delete pendingRequests[cacheKey];
            return {
                success: false,
                data: null,
                error: error.response?.data || error.message,
            };
        });

    pendingRequests[cacheKey] = requestPromise;
    return requestPromise;
}

// -------------------- API для сервисов --------------------

export const userApi = {
    request: (endpoint, options) => request(endpoint, { ...options, baseService: "user" }),
};

export const crmApi = {
    request: (endpoint, options) => request(endpoint, { ...options, baseService: "crm" }),
};

export default request;