import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Хук для виртуализации списка элементов
 * Рендерит только видимые элементы в области просмотра для улучшения производительности
 *
 * @param itemCount Общее количество элементов
 * @param itemHeight Примерная высота каждого элемента (в пикселях)
 * @param overscan Количество дополнительных элементов для рендеринга выше и ниже видимой области
 * @param scrollingDelay Задержка в мс перед обновлением видимых элементов при прокрутке
 */
export function useVirtualization(
  itemCount: number,
  itemHeight: number,
  overscan: number,
  scrollingDelay: number,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Расчет видимых элементов на основе текущей прокрутки
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, clientHeight } = containerRef.current;

    // Вычисляем индексы первого и последнего видимых элементов
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor((scrollTop + clientHeight) / itemHeight) + overscan,
    );

    setVisibleRange({ start: startIndex, end: endIndex });
  }, [itemCount, itemHeight, overscan]);

  // Обработчик события прокрутки
  const handleScroll = useCallback(() => {
    setIsScrolling(true);

    // Сбрасываем предыдущий таймер
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Устанавливаем таймер для задержки обновления при быстрой прокрутке
    scrollTimeoutRef.current = setTimeout(() => {
      calculateVisibleRange();
      setIsScrolling(false);
      scrollTimeoutRef.current = null;
    }, scrollingDelay);

    // При медленной прокрутке обновляем сразу
    calculateVisibleRange();
  }, [calculateVisibleRange, scrollingDelay]);

  // Вычисляем общую высоту содержимого
  const totalHeight = itemCount * itemHeight;

  // Эффект для установки начальных видимых элементов
  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange, itemCount]);

  // Функция для виртуализации массива элементов
  const virtualizeItems = useCallback(
    <T>(items: T[]): T[] => {
      return items.slice(visibleRange.start, visibleRange.end + 1);
    },
    [visibleRange],
  );

  // Вспомогательные значения для рендеринга
  const containerStyle = {
    position: 'relative' as const,
    height: '100%',
    overflowY: 'auto' as const,
  };

  const contentStyle = {
    height: `${totalHeight}px`,
    position: 'relative' as const,
  };

  const itemContainerStyle = (index: number) => ({
    position: 'absolute' as const,
    top: `${index * itemHeight}px`,
    left: 0,
    right: 0,
  });

  return {
    containerRef,
    visibleRange,
    isScrolling,
    handleScroll,
    virtualizeItems,
    containerStyle,
    contentStyle,
    itemContainerStyle,
    totalHeight,
  };
}
