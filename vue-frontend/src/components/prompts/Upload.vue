<template>
  <div class="card floating">
    <div class="card-title">
      <h2>{{ t("prompts.upload") }}</h2>
    </div>

    <div class="card-content">
      <p>{{ t("prompts.uploadMessage") }}</p>
    </div>

    <div class="card-action full">
      <div
        @click="uploadFile"
        @keypress.enter="uploadFile"
        class="action"
        id="focus-prompt"
        tabindex="1"
      >
        <i class="material-icons">insert_drive_file</i>
        <div class="title">{{ t("buttons.file") }}</div>
      </div>
      <div
        @click="uploadFolder"
        @keypress.enter="uploadFolder"
        class="action"
        tabindex="2"
      >
        <i class="material-icons">folder</i>
        <div class="title">{{ t("buttons.folder") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useFileStore } from "@/stores/file";
import { useLayoutStore } from "@/stores/layout";
import { redactPdfUrl } from "@/constants/flaskApi";

import * as upload from "@/utils/upload";

const { t } = useI18n();
const route = useRoute();
const fileStore = useFileStore();
const layoutStore = useLayoutStore();

const isPdf = (file: File): boolean => {
  return file.type === "application/pdf";
};

const redactPdf = async (file: File): Promise<File> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(redactPdfUrl, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("PDF redaction failed");
  }

  const redactedBlob = await response.blob();
  return new File([redactedBlob], file.name, { type: "application/pdf" });
};

const uploadInput = async (event: Event) => {
  layoutStore.closeHovers();

  let files = (event.currentTarget as HTMLInputElement)?.files;
  if (files === null) return;

  let folder_upload = !!files[0].webkitRelativePath;

  const uploadFiles: UploadList = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let processedFile = file;

    if (isPdf(file)) {
      try {
        processedFile = await redactPdf(file);
      } catch (error) {
        console.error("Failed to redact PDF:", error);
        // Continue with original file if redaction fails
      }
    }

    const fullPath = folder_upload
      ? processedFile.webkitRelativePath
      : undefined;
    uploadFiles.push({
      file: processedFile,
      name: processedFile.name,
      size: processedFile.size,
      isDir: false,
      fullPath,
    });
  }

  let path = route.path.endsWith("/") ? route.path : route.path + "/";
  let conflict = upload.checkConflict(uploadFiles, fileStore.req!.items);

  if (conflict) {
    layoutStore.showHover({
      prompt: "replace",
      action: (event: Event) => {
        event.preventDefault();
        layoutStore.closeHovers();
        upload.handleFiles(uploadFiles, path, false);
      },
      confirm: (event: Event) => {
        event.preventDefault();
        layoutStore.closeHovers();
        upload.handleFiles(uploadFiles, path, true);
      },
    });

    return;
  }

  upload.handleFiles(uploadFiles, path);
};

const openUpload = (isFolder: boolean) => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.webkitdirectory = isFolder;
  // TODO: call the function in FileListing.vue instead
  input.onchange = uploadInput;
  input.click();
};

const uploadFile = () => {
  openUpload(false);
};
const uploadFolder = () => {
  openUpload(true);
};
</script>
