const EXCLUDED_ATTRIBUTES = ['Серия', 'Производитель'];

/**
 * Сортирует варианты и возвращает ключевые атрибуты (3 шт.) для отображения
 *
 * Логика:
 * 1. Собираем все фильтруемые атрибуты из всех вариантов
 * 2. Определяем "ключевые" — те, чьи значения встречаются в названии основного товара
 * 3. Сортируем варианты: сначала те, у которых больше ключевых атрибутов совпадает
 * 4. Для каждого варианта возвращаем 3 атрибута: сначала ключевые (совпадающие с name), потом остальные
 *
 * @param {Array} variants — массив вариантов товара
 * @param {string} mainProductName — название основного товара
 * @returns {{ sortedVariants: Array, specsMap: Object }}
 *   sortedVariants — отсортированные варианты
 *   specsMap — { variantId: [specValue1, specValue2, specValue3] }
 */
export function sortVariantsAndGetSpecs(variants, mainProductName) {
  if (!variants || variants.length <= 1) {
    return { sortedVariants: variants, specsMap: {} };
  }

  const normalizedName = mainProductName?.toLowerCase() || '';

  // Собираем все уникальные имена атрибутов из всех вариантов
  const allAttrNames = new Set();
  variants.forEach((v) => {
    v.attributes?.forEach((attr) => {
      if (attr.is_filterable && !EXCLUDED_ATTRIBUTES.includes(attr.name)) {
        allAttrNames.add(attr.name);
      }
    });
  });

  // Определяем "ключевые" атрибуты — те, чьё значение встречается в названии основного товара
  // Сравниваем по маске: значение атрибута должно быть подстрокой name (или наоборот)
  const keyAttrNames = new Set();
  allAttrNames.forEach((attrName) => {
    // Проверяем все значения этого атрибута среди всех вариантов
    const hasMatch = variants.some((v) =>
      v.attributes?.some((attr) => {
        if (attr.name !== attrName) return false;
        const val = (attr.value || '').toLowerCase();
        if (!val) return false;
        // Значение атрибута содержится в названии или название содержит значение
        return normalizedName.includes(val) || val.includes(normalizedName);
      })
    );
    if (hasMatch) {
      keyAttrNames.add(attrName);
    }
  });

  // Если ключевых атрибутов нет — пробуем по частоте встречаемости
  if (keyAttrNames.size === 0) {
    const attrFrequency = {};
    variants.forEach((v) => {
      v.attributes?.forEach((attr) => {
        if (attr.is_filterable && !EXCLUDED_ATTRIBUTES.includes(attr.name)) {
          attrFrequency[attr.name] = (attrFrequency[attr.name] || 0) + 1;
        }
      });
    });
    // Берём топ-3 по частоте
    const sorted = Object.entries(attrFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);
    sorted.forEach((name) => keyAttrNames.add(name));
  }

  // Получаем спецификации для конкретного варианта (3 атрибута, ключевые впереди)
  const getSpecs = (variant) => {
    if (!variant.attributes) return [];

    const keyAttrs = [];
    const otherAttrs = [];

    variant.attributes.forEach((attr) => {
      if (!attr.is_filterable || EXCLUDED_ATTRIBUTES.includes(attr.name)) return;
      if (keyAttrNames.has(attr.name)) {
        keyAttrs.push(attr.value);
      } else {
        otherAttrs.push(attr.value);
      }
    });

    // Ключевые впереди, потом остальные, всего до 3
    return [...keyAttrs, ...otherAttrs].slice(0, 3);
  };

  // Сортируем варианты: чем больше ключевых атрибутов — тем выше
  const sortedVariants = [...variants].sort((a, b) => {
    const getKeyCount = (v) =>
      v.attributes?.filter(
        (attr) => attr.is_filterable && !EXCLUDED_ATTRIBUTES.includes(attr.name) && keyAttrNames.has(attr.name)
      ).length || 0;

    return getKeyCount(b) - getKeyCount(a);
  });

  // Строим карту спецификаций
  const specsMap = {};
  sortedVariants.forEach((v) => {
    specsMap[v.id] = getSpecs(v);
  });

  return { sortedVariants, specsMap };
}
