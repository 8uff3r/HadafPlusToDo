<script setup lang="ts">
import { Item } from "@/composables/fetcher";
import { klona } from "klona";
import { computed, ref } from "vue";

const props = defineProps<{
  callbacks: {
    edit: (item: Item) => Promise<Item>;
    delete: (item: Item) => Promise<boolean>;
    add: (item: Omit<Item, "id">) => Promise<Item>;
  };
}>();
const items = defineModel<Item[]>({ required: true });

enum DialogType {
  CLOSED,
  EDIT,
  ADD,
}
const dialogType = ref(DialogType.CLOSED);
const dialogState = computed({
  get() {
    return Boolean(dialogType.value);
  },
  set(nv) {
    if (!nv) closeMainDialog();
  },
});
const dialogDeleteState = ref(false);
const headers = ref([
  {
    title: "عنوان",
    align: "start",
    key: "title",
  } as const,
  { title: "تاریخ ثبت", key: "createdDate" },
  { title: "", key: "actions", sortable: false },
]);
const editedID = ref(-1);
const editedItem = ref<Item>({
  id: 0,
  title: "",
  createdDate: "",
});
const defaultItem: Item = {
  id: 0,
  title: "",
  createdDate: "",
};
const formTitle = computed(() => {
  return dialogType.value === DialogType.ADD ? "آیتم جدید" : "ویرایش آیتم";
});

const addItem = () => {
  editedItem.value = klona(defaultItem);
  dialogType.value = DialogType.ADD;
};
const editItem = (item: Item) => {
  editedID.value = item.id;
  editedItem.value = klona(item);
  dialogType.value = DialogType.EDIT;
};
const closeMainDialog = () => {
  dialogType.value = DialogType.CLOSED;
  editedID.value = -1;
  editedItem.value = klona(defaultItem);
};
const save = async () => {
  let result: Item | undefined = undefined;
  const item = editedItem.value;
  if (dialogType.value === DialogType.ADD) {
    result = await props.callbacks.add(item);
  } else if (dialogType.value === DialogType.EDIT) {
    result = await props.callbacks.edit(item);
  }
  if (result) {
    if (editedID.value !== -1)
      items.value[items.value.findIndex((i) => i.id === editedID.value)] =
        result;
    else items.value.unshift(result);
    closeMainDialog();
  }
};

const deletingIndex = ref(-1);
const deleteItem = (index: number) => {
  deletingIndex.value = index;
  dialogDeleteState.value = true;
};
const closeDelete = () => {
  dialogDeleteState.value = false;
};
const deleteItemConfirm = async () => {
  const res = await props.callbacks.delete(items.value[deletingIndex.value]);
  if (res) {
    closeDelete();
    items.value.splice(deletingIndex.value, 1);
  }
};

const getFormattedDate = (date: string) => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
};
const selectedItems = ref<string[]>([]);
enum FilterTypes {
  COMPLETED = "completed",
  ACTIVE = "active",
  ALL = "all",
}
const filter = ref(FilterTypes.ALL);

const filterItems = (_value: string, query: string, item: any) => {
  if (query === FilterTypes.ALL) return true;
  const isItemSelected = Boolean(
    selectedItems.value.find((i) => i === item.key),
  );
  if (query === FilterTypes.COMPLETED) return isItemSelected;
  if (query === FilterTypes.ACTIVE) return !isItemSelected;
  return true;
};
</script>
<template>
  <v-radio-group v-model="filter" inline>
    <v-radio label="انجام شده" :value="FilterTypes.COMPLETED"></v-radio>
    <v-radio label="انجام نشده" :value="FilterTypes.ACTIVE"></v-radio>
    <v-radio label="همه آیتم‌ها" :value="FilterTypes.ALL"></v-radio>
  </v-radio-group>
  <v-col xs="12" sm="12" md="8" lg="6">
    <v-data-table
      :items-per-page="-1"
      :headers="headers"
      :items
      :custom-filter="filterItems"
      :search="filter"
      v-model="selectedItems"
      show-select
      :sort-by="[{ key: 'createdDate', order: 'asc' }]"
      itemsPerPageText="تعداد آیتم در هر صفحه"
      noDataText="آیتمی موجود نیست."
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>HadafPlus ToDo App</v-toolbar-title>
          <v-dialog v-model="dialogState" max-width="500px">
            <template v-slot:activator>
              <v-btn class="mb-2" color="primary" dark @click="addItem">
                افزودن آیتم
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field v-model="editedItem.title" label="عنوان">
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="closeMainDialog"
                >
                  انصراف
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="save()">
                  ذخیره
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDeleteState" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">
                آیا از حذف این آیتم مطمئنید؟
              </v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="closeDelete"
                >
                  انصراف
                </v-btn>
                <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="deleteItemConfirm()"
                >
                  تایید
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ index, item }">
        <v-icon class="me-2" size="small" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon size="small" @click="deleteItem(index)"> mdi-delete </v-icon>
      </template>
      <template v-slot:item.createdDate="{ value }: { value: string }">
        {{ getFormattedDate(value) }}
      </template>
      <template v-slot:bottom> </template>
    </v-data-table>
  </v-col>
</template>
