<script setup lang="ts">
import { computed, ref } from "vue";
import {
  TALENTS,
  CATEGORY_LABELS,
  spentOn,
  type TalentCategory,
} from "../lib/talents";
import { MILESTONES } from "../lib/milestones";
import {
  legacyState,
  beginDraft,
  adjustDraft,
  commitDraft,
  cancelDraft,
  draftSpent,
} from "../model/state";
const categories = Object.keys(CATEGORY_LABELS) as TalentCategory[];
const feedback = ref("");
const drafting = computed(() => !!legacyState.draft);
const draftCost = computed(
  () => draftSpent() - spentOn(legacyState.allocated),
);
const achieved = computed(
  () => new Set(legacyState.lastGrant?.milestones.map((m) => m.id) ?? []),
);
function rankOf(id: string) {
  return (legacyState.draft ?? legacyState.allocated)[id] ?? 0;
}
function talentsOf(cat: TalentCategory) {
  return TALENTS.filter((t) => t.category === cat);
}
function start() {
  if (beginDraft()) feedback.value = "试配已开启：调整方案，确认后于下次启程生效。";
}
function adjust(id: string, delta: number) {
  feedback.value = adjustDraft(id, delta)
    ? ""
    : "传承点不足，或已达该天赋上限。";
}
function confirm() {
  feedback.value = commitDraft()
    ? "方案已确认，将在下一次启程时冻结并生效。"
    : "当前无法确认方案。";
}
function cancel() {
  cancelDraft();
  feedback.value = "试配已取消，已分配方案保持不变。";
}
</script>
<template>
  <section class="panel legacy-panel">
    <div class="section-top">
      <span class="eyebrow">06 / THE INHERITANCE</span
      ><span>{{
        legacyState.frozen ? "旅途进行中 · 天赋已冻结" : "两程之间 · 可调整"
      }}</span>
    </div>
    <h2>余烬传递，照亮下一程</h2>
    <p class="muted">
      通关结算的里程碑会化为传承点。分配的天赋在启程时冻结并贯穿整段旅途：开局牌组、战斗被动、隐藏路线、商店权限与奖励池都会实际改变，并在各环节标注来源天赋。
    </p>
    <div class="legacy-stats">
      <div>
        <small>可用传承点</small><b>{{ legacyState.points }}</b>
      </div>
      <div>
        <small>累计获得</small><b>{{ legacyState.earned }}</b>
      </div>
      <div>
        <small>已分配占用</small><b>{{ spentOn(legacyState.allocated) }}</b>
      </div>
    </div>
    <div v-if="legacyState.frozen" class="notice">
      ❖ 旅途进行中，天赋已冻结。开局收益不会通过在战斗间隙重分配而重复生效，旅途结算后可回到这里调整。
    </div>
    <div v-else-if="drafting" class="notice draft-bar">
      <span
        >试配中 · 净消耗 {{ draftCost }} 点 · 确认后剩余
        {{ legacyState.points - draftCost }} 点</span
      >
      <button data-action="commit-draft" @click="confirm">确认方案</button
      ><button data-action="cancel-draft" @click="cancel">取消试配</button>
    </div>
    <div v-else class="toolbar">
      <button
        data-action="begin-draft"
        :disabled="!legacyState.earned && !spentOn(legacyState.allocated)"
        @click="start"
      >
        进入试配 · 调整分配
      </button>
    </div>
    <p v-if="feedback" class="legacy-feedback">{{ feedback }}</p>
    <div v-if="legacyState.lastGrant" class="grant-report">
      <h3>
        上一段旅途结算 · 获得 {{ legacyState.lastGrant.points }} 传承点
      </h3>
      <ul>
        <li
          v-for="m in MILESTONES"
          :key="m.id"
          :class="{ hit: achieved.has(m.id) }"
        >
          {{ achieved.has(m.id) ? "✦" : "·" }} {{ m.label
          }}<em>+{{ m.points }}</em>
        </li>
      </ul>
    </div>
    <div v-for="cat in categories" :key="cat" class="talent-group">
      <h3>{{ CATEGORY_LABELS[cat] }}</h3>
      <div class="talent-list">
        <div
          v-for="t in talentsOf(cat)"
          :key="t.id"
          class="talent"
          :class="{ active: rankOf(t.id) > 0 }"
          :data-talent="t.id"
        >
          <div class="talent-head">
            <b>{{ t.name }}</b
            ><span class="pips"
              ><i
                v-for="i in t.maxRank"
                :key="i"
                :class="{ on: rankOf(t.id) >= i }"
              ></i></span
            ><em>{{ t.cost }} 点 / 级</em>
          </div>
          <p>{{ t.effect(rankOf(t.id) || 1) }}</p>
          <div v-if="drafting" class="talent-ops">
            <button
              :disabled="rankOf(t.id) <= 0"
              :data-adjust="`dec-${t.id}`"
              @click="adjust(t.id, -1)"
            >
              −</button
            ><button
              :disabled="rankOf(t.id) >= t.maxRank"
              :data-adjust="`inc-${t.id}`"
              @click="adjust(t.id, 1)"
            >
              ＋
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
