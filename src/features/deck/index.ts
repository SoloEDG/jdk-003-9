export { default as DeckPanel } from "./ui/DeckPanel.vue";
export { starterWith } from "./lib/collection";
export type { DeckTalentMods } from "./lib/collection";
export {
  deckState,
  deckCards,
  addCard,
  spendGold,
  earnGold,
  setHp,
  heal,
  upgradeCard,
  removeCard,
  openCamp,
  useCamp,
  exportDeck,
  restoreDeck,
  resetDeck,
} from "./model/state";
