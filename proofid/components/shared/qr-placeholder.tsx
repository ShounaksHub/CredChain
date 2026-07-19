import { cn } from "@/lib/utils";

// Deterministic pseudo-random pattern so the placeholder looks like a real QR
// code without any actual encoding logic.
function useCells(seed: number, size: number) {
  const cells: boolean[] = [];
  let x = seed;
  for (let i = 0; i < size * size; i++) {
    x = (x * 9301 + 49297) % 233280;
    cells.push(x / 233280 > 0.52);
  }
  return cells;
}

export function QRPlaceholder({ className, size = 7 }: { className?: string; size?: number }) {
  const cells = useCells(42, size);

  return (
    <div
      className={cn(
        "grid aspect-square gap-[3px] rounded-lg bg-white p-2.5",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((filled, i) => {
        const row = Math.floor(i / size);
        const col = i % size;
        const isFinder =
          (row < 2 && col < 2) ||
          (row < 2 && col > size - 3) ||
          (row > size - 3 && col < 2);
        return (
          <div
            key={i}
            className={cn(
              "rounded-[1.5px]",
              isFinder || filled ? "bg-[#0a0d14]" : "bg-transparent"
            )}
          />
        );
      })}
    </div>
  );
}
