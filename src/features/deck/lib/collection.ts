import type { CardInstance } from "@/shared/domain";
import { uid } from "@/shared/random";
export function starter(): CardInstance[] {
  return [
    "strike",
    "strike",
    "strike",
    "guard",
    "guard",
    "venom",
    "focus",
    "shelter",
  ].map((key) => ({ id: uid("card"), key, upgraded: false }));
}
export interface DeckTalentMods {
  add: string[];
  upgradeKeys: string[];
}
export function starterWith(mods?: DeckTalentMods): CardInstance[] {
  const cards = starter();
  for (const key of mods?.add ?? []) cards.push(createCard(key));
  if (mods?.upgradeKeys?.length)
    for (const c of cards)
      if (mods.upgradeKeys.includes(c.key)) c.upgraded = true;
  return cards;
}
export function createCard(key: string): CardInstance {
  return { id: uid("card"), key, upgraded: false };
}
export function canRemove(size: number) {
  return size > 5;
}
