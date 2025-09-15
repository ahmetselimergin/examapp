import { ref, computed } from "vue";

export function useModal() {
  const isOpen = ref(false);
  const loading = ref(false);

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const withLoading = async (callback: () => Promise<void>) => {
    loading.value = true;
    try {
      await callback();
    } finally {
      loading.value = false;
    }
  };

  return {
    isOpen,
    loading: computed(() => loading.value),
    open,
    close,
    toggle,
    withLoading,
  };
}
