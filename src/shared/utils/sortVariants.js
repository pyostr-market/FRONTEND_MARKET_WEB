const EXCLUDED_ATTRIBUTES = ['Серия', 'Производитель'];

/**
 * Сортирует варианты и возвращает спецификации для отображения в карточках.
 *
 * Логика сортировки:
 * - Собираем "ключевые" атрибуты — те, чьи значения встречаются в названии основного товара
 * - Считаем у каждого варианта количество ключевых атрибутов
 * - Сортируем: варианты с бОльшим количеством ключевых — выше
 * - При равенстве — сохраняем исходный порядок API
 *
 * Логика спецификаций:
 * - Для ВСЕХ вариантов используем ЕДИНЫЙ порядок атрибутов (не перемешиваем)
 * - Определяем глобальный список из 3 атрибутов: сначала ключевые, потом по частоте
 * - У каждого варианта берём значения только этих атрибутов (в этом фиксированном порядке)
 *
 * @param {Array} variants — массив вариантов товара
 * @param {string} mainProductName — название основного товара
 * @returns {{ sortedVariants: Array, specsMap: Object, specLabels: Array }}
 *   sortedVariants — отсортированные варианты (стабильный порядок)
 *   specsMap — { variantId: [specValue1, specValue2, specValue3] }
 *   specLabels — [attrName1, attrName2, attrName3] — единые заголовки для всех карточек
 */
export function sortVariantsAndGetSpecs(variants, mainProductName) {
  if (!variants || variants.length <= 1) {
    return { sortedVariants: variants, specsMap: {}, specLabels: [] };
  }

  const normalizedName = mainProductName?.toLowerCase() || '';

  // === Шаг 1: Собираем все фильтруемые атрибуты и их частоту ===
  const attrFrequency = {};
  const allAttrValues = {}; // { attrName: [value1, value2, ...] }

  variants.forEach((v) => {
    v.attributes?.forEach((attr) => {
      if (!attr.is_filterable || EXCLUDED_ATTRIBUTES.includes(attr.name)) return;

      attrFrequency[attr.name] = (attrFrequency[attr.name] || 0) + 1;

      if (!allAttrValues[attr.name]) {
        allAttrValues[attr.name] = new Set();
      }
      if (attr.value) {
        allAttrValues[attr.name].add(attr.value);
      }
    });
  });

  // === Шаг 2: Определяем ключевые атрибуты (значение встречается в name) ===
  const keyAttrNames = [];
  const nonKeyAttrNames = [];

  Object.keys(attrFrequency).forEach((attrName) => {
    const hasMatch = Array.from(allAttrValues[attrName] || []).some((val) => {
      const v = val.toLowerCase();
      return normalizedName.includes(v) || v.includes(normalizedName);
    });

    if (hasMatch) {
      keyAttrNames.push(attrName);
    } else {
      nonKeyAttrNames.push(attrName);
    }
  });

  // === Шаг 3: Формируем единый список из 3 атрибутов для ВСЕХ карточек ===
  // Сначала ключевые, потом остальные (по частоте)
  nonKeyAttrNames.sort((a, b) => attrFrequency[b] - attrFrequency[a]);

  const globalSpecAttrs = [...keyAttrNames, ...nonKeyAttrNames].slice(0, 3);

  // === Шаг 4: Сортируем варианты (стабильно — используем оригинальный индекс) ===
  const variantsWithScore = variants.map((v, index) => {
    const keyCount = v.attributes?.filter(
      (attr) => attr.is_filterable && !EXCLUDED_ATTRIBUTES.includes(attr.name) && keyAttrNames.includes(attr.name)
    ).length || 0;

    return { variant: v, keyCount, index };
  });

  variantsWithScore.sort((a, b) => {
    if (b.keyCount !== a.keyCount) return b.keyCount - a.keyCount;
    return a.index - b.index; // stable sort: сохраняем порядок API при равенстве
  });

  const sortedVariants = variantsWithScore.map((item) => item.variant);

  // === Шаг 5: Строим карту спецификаций и заголовки ===
  const specLabels = globalSpecAttrs;

  const specsMap = {};
  sortedVariants.forEach((v) => {
    const attrMap = {};
    v.attributes?.forEach((attr) => {
      attrMap[attr.name] = attr.value;
    });

    specsMap[v.id] = globalSpecAttrs
      .map((name) => attrMap[name])
      .filter(Boolean); // убираем undefined если у варианта нет такого атрибута
  });

  return { sortedVariants, specsMap, specLabels };
}
