import { ref, computed, watch, nextTick } from "vue";

// Debounce function for search inputs
export function useDebounce<T>(value: T, delay: number = 300) {
  const debouncedValue = ref(value);
  let timeoutId: NodeJS.Timeout;

  watch(value, (newValue) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}

// Throttle function for scroll events
export function useThrottle<T>(value: T, delay: number = 100) {
  const throttledValue = ref(value);
  let lastExecuted = 0;

  watch(value, (newValue) => {
    const now = Date.now();
    if (now - lastExecuted >= delay) {
      throttledValue.value = newValue;
      lastExecuted = now;
    }
  });

  return throttledValue;
}

// Virtual scrolling for large lists
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number = 50,
  containerHeight: number = 400
) {
  const scrollTop = ref(0);
  const visibleItems = computed(() => {
    const startIndex = Math.floor(scrollTop.value / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  });

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  return {
    visibleItems,
    handleScroll,
  };
}

// Lazy loading for images
export function useLazyLoad() {
  const observer = ref<IntersectionObserver | null>(null);
  const isIntersecting = ref(false);

  const observe = (element: HTMLElement) => {
    if (observer.value) {
      observer.value.disconnect();
    }

    observer.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting.value = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );

    observer.value.observe(element);
  };

  const disconnect = () => {
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
  };

  return {
    isIntersecting,
    observe,
    disconnect,
  };
}

// Memoization for expensive computations
export function useMemo<T>(fn: () => T, deps: any[]) {
  const cache = ref<Map<string, T>>(new Map());
  const lastDeps = ref<any[]>([]);

  return computed(() => {
    const depsKey = JSON.stringify(deps);

    if (JSON.stringify(lastDeps.value) !== depsKey) {
      const result = fn();
      cache.value.set(depsKey, result);
      lastDeps.value = [...deps];
      return result;
    }

    return cache.value.get(depsKey) || fn();
  });
}

// Batch updates for multiple state changes
export function useBatchUpdate() {
  const pendingUpdates = ref<(() => void)[]>([]);
  const isUpdating = ref(false);

  const addUpdate = (update: () => void) => {
    pendingUpdates.value.push(update);
  };

  const flushUpdates = async () => {
    if (isUpdating.value || pendingUpdates.value.length === 0) return;

    isUpdating.value = true;

    try {
      await nextTick();
      pendingUpdates.value.forEach((update) => update());
      pendingUpdates.value = [];
    } finally {
      isUpdating.value = false;
    }
  };

  return {
    addUpdate,
    flushUpdates,
    isUpdating: computed(() => isUpdating.value),
  };
}

// Performance monitoring
export function usePerformanceMonitor() {
  const metrics = ref({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
  });

  const startTime = ref(0);

  const startRender = () => {
    startTime.value = performance.now();
  };

  const endRender = () => {
    if (startTime.value > 0) {
      metrics.value.renderTime = performance.now() - startTime.value;
    }
  };

  const updateMemoryUsage = () => {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      metrics.value.memoryUsage =
        memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
  };

  return {
    metrics: computed(() => metrics.value),
    startRender,
    endRender,
    updateMemoryUsage,
  };
}
