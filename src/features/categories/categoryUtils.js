/**
 * Извлечь ключ группировки из названия категории
 * 
 * Алгоритм определяет общую группу на основе:
 * - Числовых префиксов (iPhone 16, iPhone 16 Plus, iPhone 16 Pro → группа "16")
 * - Текстовых префиксов (iPhone SE, iPhone XR → группа "SE/XR")
 * 
 * @param {string} name - Название категории
 * @returns {string} Ключ группировки
 */
export function extractGroupKey(name) {
  if (!name) return 'other';
  
  const normalized = name.trim();
  
  // Паттерн 1: Бренд + число + возможные суффиксы (iPhone 16 Pro Max)
  const matchWithNumber = normalized.match(/^(.*?\s*)(\d+)(?:\s*(Pro|Plus|Max|FE|Ultra|Lite))?/i);
  if (matchWithNumber) {
    const brand = matchWithNumber[1].trim();
    const number = matchWithNumber[2];
    return `${brand}_${number}`;
  }
  
  // Паттерн 2: Бренд + буквенный суффикс (iPhone SE, iPhone XR)
  const matchWithLetter = normalized.match(/^(.*?\s*)([A-Z]{2,})(?:\s*\d*)?/i);
  if (matchWithLetter) {
    const brand = matchWithLetter[1].trim();
    const suffix = matchWithLetter[2].toUpperCase();
    return `${brand}_${suffix}`;
  }
  
  // Паттерн 3: Просто бренд (без чисел)
  const words = normalized.split(/\s+/);
  if (words.length >= 1) {
    return words[0].toLowerCase();
  }
  
  return 'other';
}

/**
 * Сгруппировать дочерние категории по ключу
 * 
 * @param {Array} children - Массив дочерних категорий
 * @param {Function} [groupKeyFn] - Функция для извлечения ключа группировки (по умолчанию extractGroupKey)
 * @returns {Array<{groupKey: string, groupName: string, items: Array}>}
 */
export function groupCategories(children, groupKeyFn = extractGroupKey) {
  if (!children || children.length === 0) return [];
  
  const groupsMap = new Map();
  
  children.forEach((category) => {
    const groupKey = groupKeyFn(category.name);
    
    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        groupKey,
        groupName: formatGroupName(groupKey),
        items: [],
      });
    }
    
    groupsMap.get(groupKey).items.push(category);
  });
  
  // Сортировка групп: сначала с числами (по убыванию), потом остальные
  const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
    const aNum = extractNumberFromKey(a.groupKey);
    const bNum = extractNumberFromKey(b.groupKey);
    
    if (aNum !== null && bNum !== null) {
      return bNum - aNum; // Больше число → раньше
    }
    
    if (aNum !== null) return -1;
    if (bNum !== null) return 1;
    
    return a.groupName.localeCompare(b.groupName);
  });
  
  return sortedGroups;
}

/**
 * Извлечь число из ключа группировки
 * @param {string} groupKey 
 * @returns {number|null}
 */
function extractNumberFromKey(groupKey) {
  const match = groupKey.match(/_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Форматировать название группы из ключа
 * @param {string} groupKey 
 * @returns {string}
 */
function formatGroupName(groupKey) {
  // iPhone_16 → "16"
  // iPhone_SE → "SE"
  // samsung → "Samsung"
  const parts = groupKey.split('_');
  if (parts.length === 2) {
    return parts[1];
  }
  return groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
}

/**
 * Фильтровать категории по производителю (ID или name)
 * 
 * @param {Array} categories - Массив категорий
 * @param {number|string} manufacturerFilter - ID или name производителя
 * @returns {Array}
 */
export function filterByManufacturer(categories, manufacturerFilter) {
  if (!categories) return [];
  
  return categories.filter((category) => {
    if (!category.manufacturer) return false;
    
    if (typeof manufacturerFilter === 'number') {
      return category.manufacturer.id === manufacturerFilter;
    }
    
    if (typeof manufacturerFilter === 'string') {
      return category.manufacturer.name.toLowerCase() === manufacturerFilter.toLowerCase();
    }
    
    return false;
  });
}

/**
 * Фильтровать категории по parent_id
 * 
 * @param {Array} categories - Массив категорий
 * @param {number} parentId 
 * @returns {Array}
 */
export function filterByParentId(categories, parentId) {
  if (!categories) return [];
  return categories.filter((category) => category.parent_id === parentId);
}

/**
 * Найти категорию по ID (рекурсивно)
 * 
 * @param {Array} categories - Массив категорий
 * @param {number} categoryId 
 * @returns {Category|null}
 */
export function findCategoryById(categories, categoryId) {
  if (!categories) return null;
  
  for (const category of categories) {
    if (category.id === categoryId) {
      return category;
    }
    
    if (category.children && category.children.length > 0) {
      const found = findCategoryById(category.children, categoryId);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * Получить все категории производителя (плоский список)
 * 
 * @param {Array} categories - Массив категорий
 * @param {number|string} manufacturerFilter - ID или name производителя
 * @returns {Array}
 */
export function getAllCategoriesByManufacturer(categories, manufacturerFilter) {
  const filtered = filterByManufacturer(categories, manufacturerFilter);
  const result = [];
  
  filtered.forEach((category) => {
    result.push(category);
    if (category.children && category.children.length > 0) {
      result.push(...category.children);
    }
  });
  
  return result;
}

/**
 * Получить все дочерние категории рекурсивно
 * 
 * @param {Category} category 
 * @returns {Array}
 */
export function getAllDescendants(category) {
  if (!category || !category.children) return [];
  
  const result = [...category.children];
  
  category.children.forEach((child) => {
    result.push(...getAllDescendants(child));
  });
  
  return result;
}
