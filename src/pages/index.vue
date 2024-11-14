<template>
  <div class="pa-8 d-flex flex-column w-full align-center">
    <TodoTable
      v-model="filteredItems"
      :callbacks="{
        add: store.addItem,
        edit: store.editItem,
        delete: store.deleteItem,
      }"
    />
  </div>
</template>

<script lang="ts" setup>
import TodoTable from "@/components/TodoTable.vue";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";

const store = useAppStore();
const { filteredItems } = storeToRefs(store);
onMounted(() => {
  store.initalize();
});
</script>
