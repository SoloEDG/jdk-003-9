import { reactive, readonly } from "vue";
import {
  TALENTS,
  talentById,
  spentOn,
  modsFor,
  notesFor,
  type LegacyMods,
  type TalentCategory,
} from "../lib/talents";
import {
  evaluateMilestones,
  type Milestone,
  type RunStats,
} from "../lib/milestones";
const KEY = "ember-path-legacy-v1";
export interface GrantRecord {
  runId: string;
  points: number;
  milestones: Milestone[];
}
interface LegacyState {
  points: number;
  earned: number;
  allocated: Record<string, number>;
  draft: Record<string, number> | null;
  frozen: boolean;
  grantedRuns: string[];
  lastGrant: GrantRecord | null;
}
const state = reactive<LegacyState>({
  points: 0,
  earned: 0,
  allocated: {},
  draft: null,
  frozen: false,
  grantedRuns: [],
  lastGrant: null,
});
export const legacyState = readonly(state);
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 传承写入失败时保留内存状态 */
  }
}
function sanitizeAlloc(input: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (input && typeof input === "object")
    for (const [id, v] of Object.entries(input)) {
      const t = talentById(id);
      const rank = Math.floor(Number(v));
      if (t && Number.isFinite(rank) && rank > 0)
        out[id] = Math.min(rank, t.maxRank);
    }
  return out;
}
export function loadLegacy(runActive: boolean) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      state.points = Math.max(0, Math.floor(Number(d?.points)) || 0);
      state.earned = Math.max(0, Math.floor(Number(d?.earned)) || 0);
      state.allocated = sanitizeAlloc(d?.allocated);
      state.draft = null;
      state.frozen = !!d?.frozen;
      state.grantedRuns = Array.isArray(d?.grantedRuns)
        ? d.grantedRuns.filter((x: unknown) => typeof x === "string")
        : [];
      state.lastGrant =
        d?.lastGrant &&
        typeof d.lastGrant === "object" &&
        typeof d.lastGrant.runId === "string" &&
        Array.isArray(d.lastGrant.milestones)
          ? {
              runId: d.lastGrant.runId,
              points: Math.max(0, Math.floor(Number(d.lastGrant.points)) || 0),
              milestones: d.lastGrant.milestones.filter(
                (m: unknown) =>
                  m &&
                  typeof m === "object" &&
                  typeof (m as Milestone).id === "string" &&
                  typeof (m as Milestone).label === "string" &&
                  Number.isFinite((m as Milestone).points),
              ),
            }
          : null;
      return;
    }
  } catch {
    /* 损坏的传承数据按全新处理 */
  }
  // 没有传承数据（含旧存档）：从零开始，不默认解锁任何内容；
  // 若旅途正在进行，视为已冻结，避免中途重分配拿开局收益。
  state.frozen = runActive;
}
export function committedMods(): LegacyMods {
  return modsFor(state.allocated);
}
export function committedNotes(category: TalentCategory): string[] {
  return notesFor(state.allocated, category);
}
export function allocatedSpent() {
  return spentOn(state.allocated);
}
export function allocatedCount() {
  return TALENTS.filter((t) => (state.allocated[t.id] ?? 0) > 0).length;
}
export function freezeLegacy() {
  state.frozen = true;
  state.draft = null;
  persist();
}
export function unfreezeLegacy() {
  if (!state.frozen) return;
  state.frozen = false;
  persist();
}
export function grantForRun(
  runId: string,
  stats: RunStats,
): GrantRecord | null {
  if (!runId || state.grantedRuns.includes(runId)) return null;
  const milestones = evaluateMilestones(stats);
  const points = milestones.reduce((s, m) => s + m.points, 0);
  state.grantedRuns.push(runId);
  state.points += points;
  state.earned += points;
  state.lastGrant = { runId, points, milestones };
  persist();
  return state.lastGrant;
}
export function beginDraft() {
  if (state.frozen || state.draft) return false;
  state.draft = { ...state.allocated };
  return true;
}
export function draftSpent() {
  return state.draft ? spentOn(state.draft) : 0;
}
export function adjustDraft(id: string, delta: number) {
  const t = talentById(id);
  if (state.frozen || !state.draft || !t) return false;
  const current = state.draft[id] ?? 0;
  const next = Math.min(t.maxRank, Math.max(0, current + delta));
  if (next === current) return false;
  const trial = { ...state.draft, [id]: next };
  if (spentOn(trial) > spentOn(state.allocated) + state.points) return false;
  state.draft = trial;
  return true;
}
export function commitDraft() {
  if (state.frozen || !state.draft) return false;
  const cost = spentOn(state.draft) - spentOn(state.allocated);
  if (cost > state.points) return false;
  state.points -= cost;
  state.allocated = { ...state.draft };
  state.draft = null;
  persist();
  return true;
}
export function cancelDraft() {
  state.draft = null;
}
