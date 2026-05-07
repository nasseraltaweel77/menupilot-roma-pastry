"use client";

import { deleteItem } from "@/app/admin/actions";

export function DeleteItemButton() {
  return (
    <button
      className="btn-secondary text-clay"
      formAction={deleteItem}
      type="submit"
      onClick={(event) => {
        if (!window.confirm("Are you sure you want to delete this item?")) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
