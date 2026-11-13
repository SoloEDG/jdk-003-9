import type { BattleResult, RewardOffer } from "@/shared/domain";
import { rewardPool } from "./pool";
export interface RewardMods {
  alwaysRare: boolean;
  gold: number;
  heal: number;
  notes: string[];
}
export function offerFrom(result: BattleResult, mods?: RewardMods): RewardOffer {
  return {
    id: `reward-${result.id}`,
    source: result.id,
    cards: rewardPool(result.context, mods?.alwaysRare),
    gold: result.gold + result.context.influence.favor * 2 + (mods?.gold ?? 0),
    heal: (result.context.region === "forest" ? 3 : 0) + (mods?.heal ?? 0),
    claimed: false,
    notes: mods?.notes ?? [],
  };
}
export function validChoice(offer: RewardOffer | null, key: string | null) {
  return (
    !!offer && !offer.claimed && (key === null || offer.cards.includes(key))
  );
}
