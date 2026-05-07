export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone-300 bg-white px-5 py-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-stone-500">{body}</p>
    </div>
  );
}
