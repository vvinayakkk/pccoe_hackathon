<template>
  <nav class="custom-sidebar">
    <div class="sidebar-content">
      <template v-if="isLoggedIn">
        <div class="button-container">
          <PrimeButton
            label="Home"
            icon="pi pi-home"
            class="p-button-text p-button-plain"
            @click="toHome"
            :aria-label="$t('sidebar.home')"
            :title="$t('sidebar.home')"
          />
          <PrimeButton
            label="Dashboard"
            icon="pi pi-chart-line"
            class="p-button-text p-button-plain"
            @click="toDashboard"
            :aria-label="$t('sidebar.dashboard')"
            :title="$t('sidebar.dashboard')"
          />
        </div>
        <div class="button-container">
          <PrimeButton
            label="Redact New"
            icon="pi pi-pencil"
            class="p-button-text p-button-plain"
            @click="showHover('upload')"
            :aria-label="$t('sidebar.upload')"
            :title="$t('sidebar.upload')"
          />
          <PrimeButton
            label="My Files"
            icon="pi pi-folder"
            class="p-button-text p-button-plain"
            @click="toRoot"
            :aria-label="$t('sidebar.myFiles')"
            :title="$t('sidebar.myFiles')"
          />
          <!-- </div> -->
          <!-- <div class="button-container" v-if="user.perm.create">
          <PrimeButton
            label="New Folder"
            icon="pi pi-folder-open"
            class="p-button-text p-button-plain"
            @click="showHover('newDir')"
            :aria-label="$t('sidebar.newFolder')"
            :title="$t('sidebar.newFolder')"
          />
          <PrimeButton
            label="New File"
            icon="pi pi-file"
            class="p-button-text p-button-plain"
            @click="showHover('newFile')"
            :aria-label="$t('sidebar.newFile')"
            :title="$t('sidebar.newFile')"
          />
          <PrimeButton
            label="Redact New"
            icon="pi pi-pencil"
            class="p-button-text p-button-plain"
            @click="showHover('upload')"
            :aria-label="$t('sidebar.upload')"
            :title="$t('sidebar.upload')"
          />
        </div> -->
          <!-- <div class="button-container"> -->
          <PrimeButton
            label="Shared Files"
            icon="pi pi-share-alt"
            class="p-button-text p-button-plain"
            @click="toSharedFiles"
            :aria-label="$t('sidebar.sharedFiles')"
            :title="$t('sidebar.sharedFiles')"
          />
        </div>

        <div class="button-container">
          <PrimeButton
            :label="isDark ? 'Light Mode' : 'Dark Mode'"
            :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
            class="p-button-text p-button-plain"
            @click="toggleTheme"
            :aria-label="
              isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            "
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          />
          <PrimeButton
            label="Settings"
            icon="pi pi-cog"
            class="p-button-text p-button-plain"
            @click="toSettings"
            :aria-label="$t('sidebar.settings')"
            :title="$t('sidebar.settings')"
          />
          <PrimeButton
            v-if="canLogout"
            label="Logout"
            icon="pi pi-sign-out"
            class="p-button-text p-button-plain"
            @click="logout"
            id="logout"
            :aria-label="$t('sidebar.logout')"
            :title="$t('sidebar.logout')"
          />
        </div>
      </template>
      <template v-else>
        <router-link
          class="p-button-text p-button-plain"
          to="/login"
          :aria-label="$t('sidebar.login')"
          :title="$t('sidebar.login')"
        >
          <PrimeButton label="Login" icon="pi pi-sign-in" />
        </router-link>

        <router-link
          v-if="signup"
          class="p-button-text p-button-plain"
          to="/login"
          :aria-label="$t('sidebar.signup')"
          :title="$t('sidebar.signup')"
        >
          <PrimeButton label="Signup" icon="pi pi-user-plus" />
        </router-link>
      </template>

      <div v-if="isFiles && !disableUsedPercentage" class="credits">
        <ProgressBar :value="usage.usedPercentage" class="p-progressbar" />
        <br />
        {{ usage.used }} of {{ usage.total }} used
      </div>

      <p class="credits text-center">
        <span>
          <span v-if="disableExternal">DataRakshak</span>
          <a
            v-else
            rel="noopener noreferrer"
            target="_blank"
            class="hover:underline"
          >
            DataRakshak
          </a>
          <span> {{ " " }} {{ version }}</span>
        </span>
        <span>
          <a @click="help" class="hover:underline">{{ $t("sidebar.help") }}</a>
        </span>
      </p>
    </div>
  </nav>
</template>

<script>
import { reactive } from "vue";
import { mapActions, mapState } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";
import PrimeButton from "primevue/button";
import ProgressBar from "primevue/progressbar";

import * as auth from "@/utils/auth";
import {
  version,
  signup,
  disableExternal,
  disableUsedPercentage,
  noAuth,
  loginPage,
} from "@/utils/constants";
import { files as api } from "@/api";
import prettyBytes from "pretty-bytes";
import { useTheme } from "@/composables/useTheme";

const USAGE_DEFAULT = { used: "0 B", total: "0 B", usedPercentage: 0 };

export default {
  name: "sidebar",
  components: {
    PrimeButton,
    ProgressBar,
  },
  inject: ["$showError"],
  computed: {
    ...mapState(useAuthStore, ["user", "isLoggedIn"]),
    ...mapState(useFileStore, ["isFiles", "reload"]),
    isActive() {
      return this.currentPromptName === "sidebar";
    },
  },
  setup() {
    const { isDark, toggleTheme } = useTheme();
    const usage = reactive(USAGE_DEFAULT);
    return {
      usage,
      signup,
      version,
      disableExternal,
      disableUsedPercentage,
      canLogout: !noAuth && loginPage,
      isDark,
      toggleTheme,
    };
  },
  methods: {
    ...mapActions(useLayoutStore, ["closeHovers", "showHover"]),
    async fetchUsage() {
      let path = this.$route.path.endsWith("/")
        ? this.$route.path
        : this.$route.path + "/";
      let usageStats = USAGE_DEFAULT;
      if (this.disableUsedPercentage) {
        return Object.assign(this.usage, usageStats);
      }
      try {
        let usage = await api.usage(path);
        usageStats = {
          used: prettyBytes(usage.used, { binary: true }),
          total: prettyBytes(usage.total, { binary: true }),
          usedPercentage: Math.round((usage.used / usage.total) * 100),
        };
      } catch (error) {
        this.$showError(error);
      }
      return Object.assign(this.usage, usageStats);
    },
    toHome() {
      this.$router.push({ path: "/home" });
      this.closeHovers();
    },
    toRoot() {
      this.$router.push({ path: "/files" });
      this.closeHovers();
    },
    toSettings() {
      this.$router.push({ path: "/settings" });
      this.closeHovers();
    },
    toDashboard() {
      this.$router.push({ path: "/analytics" });
      this.closeHovers();
    },
    help() {
      this.showHover("help");
    },
    logout: auth.logout,
    toSharedFiles() {
      this.$router.push({ path: '/shared' });
      this.closeHovers();
    },
  },
  watch: {
    isFiles(newValue) {
      newValue && this.fetchUsage();
    },
  },
};
</script>

<style scoped>
.custom-sidebar {
  position: fixed;
  left: 0;
  top: 4em;
  height: calc(100vh - 4em);
  width: 250px;
  background-color: var(--surface-a);
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow-y: auto;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;
  padding: 1rem;
}

.button-container {
  padding: 0;
  margin: 0.5rem 0;
  height: auto;
  margin-top: 0;
  padding-top: 0;
}

.sidebar-content {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
}

.button-container :deep(.p-button) {
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  padding: 0.8rem 1rem;
  border-radius: 8px;
}

.button-container :deep(.p-button-label) {
  flex-grow: 1;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 0.8rem;
}

.button-container :deep(.p-button .pi) {
  font-size: 1.1rem;
}

.credits {
  width: 90%;
  margin: 1.5rem auto;
  text-align: center;
  color: var(--credits-text);
  font-size: 0.8rem;
}

.hover\:underline:hover {
  text-decoration: underline;
}
</style>
