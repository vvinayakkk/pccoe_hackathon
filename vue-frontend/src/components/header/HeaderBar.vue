<template>
  <header>
    <img v-if="showLogo" :src="logoURL" />
    <h1 class="heading">DataRakshak</h1>
    <Action
      v-if="showMenu"
      class="menu-button"
      :icon="'pi pi-bars'"
      :aria-label="t('buttons.toggleSidebar')"
      @click="layoutStore.showHover('sidebar')"
    />

    <slot />

    <div
      id="dropdown"
      :class="{ active: layoutStore.currentPromptName === 'more' }"
    >
      <slot name="actions" />
    </div>

    <PrimeButton
      v-if="ifActionsSlot"
      id="more"
      :icon="'pi pi-ellipsis-v'"
      :aria-label="t('buttons.more')"
      @click="layoutStore.showHover('more')"
    />
    <div
      class="overlay"
      v-show="layoutStore.currentPromptName == 'more'"
      @click="layoutStore.closeHovers"
    />
  </header>
</template>

<script setup lang="ts">
import { useLayoutStore } from "@/stores/layout";
import { logoURL } from "@/utils/constants";
import PrimeButton from "primevue/button";
import { computed, useSlots } from "vue";
import { useI18n } from "vue-i18n";

defineProps<{
  showLogo?: boolean;
  showMenu?: boolean;
}>();

const layoutStore = useLayoutStore();
const slots = useSlots();

const { t } = useI18n();

const ifActionsSlot = computed(() => (slots.actions ? true : false));
</script>

<style></style>
