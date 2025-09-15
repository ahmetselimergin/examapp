import { ref, computed } from "vue";
import type { DataTableColumn, TableFilter } from "../types";

export function useTable<T = any>(
  columns: DataTableColumn[],
  initialData: T[] = []
) {
  const data = ref<T[]>(initialData);
  const selectedItems = ref<string[]>([]);
  const searchQuery = ref("");
  const sortBy = ref("");
  const sortOrder = ref<"asc" | "desc">("asc");
  const filters = ref<TableFilter[]>([]);

  const filteredData = computed(() => {
    let filtered = [...data.value];

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter((item) => {
        return Object.values(item as any).some((value) =>
          String(value).toLowerCase().includes(query)
        );
      });
    }

    // Custom filters
    filters.value.forEach((filter) => {
      if (filter.value) {
        filtered = filtered.filter((item) => {
          const itemValue = (item as any)[filter.key];
          const filterValue = String(filter.value).toLowerCase();
          const itemValueStr = String(itemValue).toLowerCase();
          const condition = (filter as any).condition || "contains";

          if (filter.type === "text") {
            switch (condition) {
              case "contains":
                return itemValueStr.includes(filterValue);
              case "not_contains":
                return !itemValueStr.includes(filterValue);
              case "equals":
                return itemValueStr === filterValue;
              case "not_equals":
                return itemValueStr !== filterValue;
              case "starts_with":
                return itemValueStr.startsWith(filterValue);
              case "ends_with":
                return itemValueStr.endsWith(filterValue);
              default:
                return itemValueStr.includes(filterValue);
            }
          }
          return itemValue === filter.value;
        });
      }
    });

    // Sorting
    if (sortBy.value) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortBy.value];
        const bValue = (b as any)[sortBy.value];

        if (aValue < bValue) return sortOrder.value === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder.value === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  });

  const allSelected = computed(
    () =>
      selectedItems.value.length === filteredData.value.length &&
      filteredData.value.length > 0
  );

  const toggleAll = () => {
    if (allSelected.value) {
      selectedItems.value = [];
    } else {
      selectedItems.value = filteredData.value.map((item: any) => item._id);
    }
  };

  const toggleItem = (id: string) => {
    const index = selectedItems.value.indexOf(id);
    if (index > -1) {
      selectedItems.value.splice(index, 1);
    } else {
      selectedItems.value.push(id);
    }
  };

  const isItemSelected = (id: string) => {
    return selectedItems.value.includes(id);
  };

  const sort = (column: string) => {
    if (sortBy.value === column) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = column;
      sortOrder.value = "asc";
    }
  };

  const setFilter = (
    key: string,
    value: any,
    type: "text" | "select" | "date" = "text",
    condition?: string
  ) => {
    const existingFilter = filters.value.find((f) => f.key === key);
    if (existingFilter) {
      existingFilter.value = value;
      if (condition) {
        (existingFilter as any).condition = condition;
      }
    } else {
      const filter: any = { key, value, type };
      if (condition) {
        filter.condition = condition;
      }
      filters.value.push(filter);
    }
  };

  const clearFilters = () => {
    filters.value = [];
    searchQuery.value = "";
  };

  const clearSelection = () => {
    selectedItems.value = [];
  };

  const updateData = (newData: T[]) => {
    data.value = newData;
  };

  return {
    data,
    selectedItems,
    searchQuery,
    sortBy,
    sortOrder,
    filters,
    filteredData,
    allSelected,
    toggleAll,
    toggleItem,
    isItemSelected,
    sort,
    setFilter,
    clearFilters,
    clearSelection,
    updateData,
  };
}
