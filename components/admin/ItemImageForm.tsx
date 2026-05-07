"use client";

import { useState } from "react";
import { uploadItemImage } from "@/app/admin/actions";

export function ItemImageForm({
  itemId,
  currentImageUrl,
}: {
  itemId: string;
  currentImageUrl: string | null;
}) {
  const [preview, setPreview] = useState(currentImageUrl || "");

  return (
    <form action={uploadItemImage} className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
      <input type="hidden" name="id" value={itemId} />
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-white">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Product preview" className="h-full w-full object-cover" />
          ) : (
            <span className="px-3 text-center text-xs font-semibold text-stone-400">No image</span>
          )}
        </div>
        <div className="space-y-3">
          <label className="block text-sm font-semibold">
            Upload image from computer
            <input
              className="field mt-1"
              type="file"
              name="image_file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>
          <label className="block text-sm font-semibold">
            Or use image URL
            <input
              className="field mt-1"
              type="text"
              name="image_url"
              defaultValue={currentImageUrl || ""}
              placeholder="https://... or /uploads/image.jpg"
              onChange={(event) => setPreview(event.target.value)}
            />
          </label>
          <button className="btn-primary" type="submit">
            Save image
          </button>
        </div>
      </div>
    </form>
  );
}
