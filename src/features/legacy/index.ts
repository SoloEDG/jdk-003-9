export { default as LegacyPanel } from "./ui/LegacyPanel.vue";
export {
  TALENTS,
  CATEGORY_LABELS,
  talentById,
  talentName,
  spentOn,
  modsFor,
  notesFor,
} from "./lib/talents";
export type { TalentCategory, LegacyMods } from "./lib/talents";
export { MILESTONES, evaluateMilestones } from "./lib/milestones";
export type { RunStats, Milestone } from "./lib/milestones";
export {
  legacyState,
  loadLegacy,
  committedMods,
  committedNotes,
  allocatedSpent,
  allocatedCount,
  freezeLegacy,
  unfreezeLegacy,
  grantForRun,
  beginDraft,
  draftSpent,
  adjustDraft,
  commitDraft,
  cancelDraft,
} from "./model/state";
