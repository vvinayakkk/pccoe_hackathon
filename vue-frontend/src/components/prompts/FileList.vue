<template>
  <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <ul class="file-list space-y-2">
      <li
        @click="itemClick"
        @touchstart="touchstart"
        @dblclick="next"
        role="button"
        tabindex="0"
        :aria-label="item.name"
        :aria-selected="selected == item.url"
        :key="item.name"
        :data-url="item.url"
        class="flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
      >
        <i class="material-icons mr-2 text-gray-500 dark:text-gray-300">
          folder
        </i>
        <span class="text-gray-700 dark:text-gray-300">{{ item.name }}</span>
      </li>
    </ul>

    <p class="mt-4 text-gray-600 dark:text-gray-400">
      {{ $t("prompts.currentlyNavigating") }}
      <code class="text-gray-800 dark:text-gray-200">{{ nav }}</code>
    </p>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useFileStore } from "@/stores/file";

import url from "@/utils/url";
import { files } from "@/api";

export default {
  name: "file-list",
  data: function () {
    return {
      items: [],
      touches: {
        id: "",
        count: 0,
      },
      selected: null,
      current: window.location.pathname,
    };
  },
  inject: ["$showError"],
  computed: {
    ...mapState(useAuthStore, ["user"]),
    ...mapState(useFileStore, ["req"]),
    nav() {
      return decodeURIComponent(this.current);
    },
  },
  mounted() {
    this.fillOptions(this.req);
  },
  methods: {
    fillOptions(req) {
      // Sets the current path and resets
      // the current items.
      this.current = req.url;
      this.items = [];

      this.$emit("update:selected", this.current);

      // If the path isn't the root path,
      // show a button to navigate to the previous
      // directory.
      if (req.url !== "/files/") {
        this.items.push({
          name: "..",
          url: url.removeLastDir(req.url) + "/",
        });
      }

      // If this folder is empty, finish here.
      if (req.items === null) return;

      // Otherwise we add every directory to the
      // move options.
      for (let item of req.items) {
        if (!item.isDir) continue;

        this.items.push({
          name: item.name,
          url: item.url,
        });
      }
    },
    next: function (event) {
      // Retrieves the URL of the directory the user
      // just clicked in and fill the options with its
      // content.
      let uri = event.currentTarget.dataset.url;

      files.fetch(uri).then(this.fillOptions).catch(this.$showError);
    },
    touchstart(event) {
      let url = event.currentTarget.dataset.url;

      // In 300 milliseconds, we shall reset the count.
      setTimeout(() => {
        this.touches.count = 0;
      }, 300);

      // If the element the user is touching
      // is different from the last one he touched,
      // reset the count.
      if (this.touches.id !== url) {
        this.touches.id = url;
        this.touches.count = 1;
        return;
      }

      this.touches.count++;

      // If there is more than one touch already,
      // open the next screen.
      if (this.touches.count > 1) {
        this.next(event);
      }
    },
    itemClick: function (event) {
      if (this.user.singleClick) this.next(event);
      else this.select(event);
    },
    select: function (event) {
      // If the element is already selected, unselect it.
      if (this.selected === event.currentTarget.dataset.url) {
        this.selected = null;
        this.$emit("update:selected", this.current);
        return;
      }

      // Otherwise select the element.
      this.selected = event.currentTarget.dataset.url;
      this.$emit("update:selected", this.selected);
    },
    createDir: async function () {
      this.$store.commit("showHover", {
        prompt: "newDir",
        action: null,
        confirm: null,
        props: {
          redirect: false,
          base: this.current === this.$route.path ? null : this.current,
        },
      });
    },
  },
};
</script>

<style scoped>
.file-list li {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
