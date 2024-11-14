import {
  Item,
  useAddItemMutation,
  useDeleteItemMutation,
  useEditItemMutation,
  useFetchItems,
} from "@/composables/fetcher";
import { defineStore } from "pinia";

export const useAppStore = defineStore("todoApp", () => {
  const items = ref<Item[]>([]);

  const initalize = async () => {
    const response = await useFetchItems();
    items.value = response;
  };

  const searchTerm = ref("");
  const filteredItems = computed(() => {
    if (searchTerm.value.length < 3) return items.value ?? [];
    return items.value?.filter((i) => i.title.includes(searchTerm.value)) ?? [];
  });

  const addItem = async (item: Omit<Item, "id">): Promise<Item> => {
    const res = await useAddItemMutation({ title: item.title });
    return res;
  };
  const editItem = async (item: Item): Promise<Item> => {
    const res = await useEditItemMutation(item);
    return res;
  };
  const deleteItem = async (item: Item) => {
    const isSuccess = await useDeleteItemMutation(item);
    return isSuccess;
  };

  return { initalize, filteredItems, addItem, editItem, deleteItem };
});
