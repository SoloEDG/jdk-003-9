import type { Influence } from "@/shared/domain";
export function priceFor(base: number, influence: Influence, discount = 0) {
  return Math.max(
    12,
    base + influence.scarcity * 5 - influence.favor * 3 - discount,
  );
}
export function quoteMessage(favor: number, scarcity: number) {
  return `好感折扣 −${favor * 3} / 稀缺附加 +${scarcity * 5}`;
}
