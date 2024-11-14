export type Item = {
  id: number;
  title: string;
  createdDate: string;
};

export async function useFetchItems() {
  const result = await fetch("/api/todos", {});
  if (result.ok) {
    const resJSON = await result.json();
    return resJSON;
  }
  return [];
}

export async function useAddItemMutation(newItem: { title: string }) {
  const response = await fetch("/api/todos", {
    headers: {
    "Content-Type": "application/json",
  },
    method: "POST",
    body: JSON.stringify(newItem),
  });
  if (response.ok) return await response.json();
}

export async function useEditItemMutation(newItem: Item) {
  const response = await fetch(`/api/todos/${newItem.id}`, {
    headers: {
    "Content-Type": "application/json",
  },
    method: "PUT",
    body: JSON.stringify({ title: newItem.title }),
  });
  if (response.ok) return await response.json();
}

export async function useDeleteItemMutation(newItem: Item) {
  const response = await fetch(`/api/todos/${newItem.id}`, {
    method: "DELETE",
  });
  return response.ok;
}
