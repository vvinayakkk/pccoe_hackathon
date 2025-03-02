<script setup>
import { VuePDF, usePDF } from "@tato30/vue-pdf";
import "@tato30/vue-pdf/style.css";
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { groupBy } from "lodash";

import {
  redactPdfWithStringsUrl,
  encryptPdfUrl,
  redactFaceUrl,
} from "@/constants/flaskApi";

const router = useRouter();
const pdfUrl = ref(null);

const parseAnalysisData = (analysisData) => {
  return analysisData.map((entity, index) => ({
    id: `item-${index}`,
    text: entity.text_snippet,
    reason: `${entity.entity_type} - Confidence: ${(entity.score * 100).toFixed(1)}%`,
    active: true,
    start: entity.start,
    end: entity.end,
  }));
};

onMounted(() => {
  const pdfUrlParam = router.currentRoute.value.query.pdfUrl;
  const analysisDataParam = router.currentRoute.value.query.analysisData;

  if (!pdfUrlParam || !analysisDataParam) {
    router.push({ name: "Home" });
    return;
  }

  pdfUrl.value = pdfUrlParam;

  try {
    const decodedData = JSON.parse(atob(analysisDataParam));
    searchItems.value = parseAnalysisData(decodedData);
  } catch (error) {
    console.error("Failed to parse analysis data:", error);
    searchItems.value = [];
  }
});

const { pdf } = usePDF(computed(() => pdfUrl.value));

onUnmounted(() => {
  if (pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
  }
});

const getFinalRedactions = () => {
  return searchItems.value
    .filter((item) => item.active)
    .map((item) => item.text);
};

onBeforeUnmount(() => {
  const finalRedactions = getFinalRedactions();
  console.log("Final redacted strings:", finalRedactions);
});

const searchItems = ref([
  { text: "Dynamic", reason: "Sensitive Information", active: true },
  { text: "present", reason: "Classified", active: true },
]);

const activeItemId = ref(null);

const groupedItems = computed(() => {
  return groupBy(searchItems.value, (item) => item.reason.split(" - ")[0]);
});

const customText = ref("");
const isCustomMode = ref(false);

const highlightText = computed(() => {
  if (isCustomMode.value) return customText.value;
  const activeItem = searchItems.value.find(
    (item) => item.id === activeItemId.value
  );
  return activeItem?.active ? activeItem.text : "";
});

const toggleHighlight = (itemId) => {
  activeItemId.value = activeItemId.value === itemId ? null : itemId;
};

const highlightOptions = ref({
  completeWords: true,
  ignoreCase: true,
});

const keepRedaction = () => {
  if (currentItemIndex.value < searchItems.value.length - 1) {
    currentItemIndex.value++;
  } else {
    isReviewComplete.value = true;
  }
};

const handleDelete = (itemToDelete) => {
  const index = searchItems.value.findIndex(
    (item) => item.text === itemToDelete.text
  );
  if (index !== -1) {
    searchItems.value.splice(index, 1);
  }
};

const addCustomRedaction = () => {
  if (customText.value.trim()) {
    searchItems.value.push({
      text: customText.value,
      reason: "Custom redaction",
      active: true,
    });
    customText.value = "";
    isCustomMode.value = false;
  }
};

const isReviewComplete = ref(false);
const isPreviewMode = ref(false);
const isLoading = ref(false);

const skipCustomRedaction = () => {
  isCustomMode.value = false;
  isPreviewMode.value = true;
};

const showPasswordModal = ref(false);
const password = ref("");
const isEncrypting = ref(false);

const handlePreview = async () => {
  showPasswordModal.value = true;
};

const redactionStyle = ref("blackbox");

const processPreview = async (shouldEncrypt = false) => {
  isLoading.value = true;
  try {
    // Get the initial PDF blob
    const pdfBlob = await fetch(pdfUrl.value).then((r) => r.blob());

    // Do text redaction directly
    const uniqueStrings = [
      ...new Set(searchItems.value.map((item) => item.text)),
    ];
    const textFormData = new FormData();
    textFormData.append("file", pdfBlob);
    textFormData.append("strings", JSON.stringify(uniqueStrings));
    textFormData.append("redaction_style", redactionStyle.value);

    const redactedResponse = await axios.post(
      redactPdfWithStringsUrl,
      textFormData,
      {
        responseType: "blob",
      }
    );

    let finalPdfBlob = redactedResponse.data;

    // Encrypt if needed
    if (shouldEncrypt && password.value) {
      isEncrypting.value = true;
      const encryptFormData = new FormData();
      encryptFormData.append("file", new Blob([finalPdfBlob]));
      encryptFormData.append("password", password.value);

      const encryptedResponse = await axios.post(
        encryptPdfUrl,
        encryptFormData,
        {
          responseType: "blob",
        }
      );
      finalPdfBlob = encryptedResponse.data;
      isEncrypting.value = false;
    }

    // Download the final PDF
    const url = window.URL.createObjectURL(new Blob([finalPdfBlob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "redacted_document.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to process PDF:", error);
  } finally {
    isLoading.value = false;
    showPasswordModal.value = false;
    password.value = "";
  }
};

const vuePDFRef = ref(null);
const pdfWidth = ref(1000);

const handleZoom = (amount) => {
  const newWidth = pdfWidth.value + amount;
  pdfWidth.value = Math.min(Math.max(500, newWidth), 2000);
  vuePDFRef.value?.reload();
};
</script>

<template>
  <div v-if="pdfUrl" class="main-container">
    <div class="pdf-wrapper">
      <button
        @click="router.push({ name: 'Home' })"
        class="back-button"
        title="Back to Home"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <div :style="`width: ${pdfWidth}px`" class="pdf-container">
        <VuePDF
          ref="vuePDFRef"
          :pdf="pdf"
          fit-parent
          text-layer
          :highlight-text="highlightText"
          :highlight-options="highlightOptions"
        />
      </div>
    </div>

    <div class="sidebar">
      <div class="zoom-controls">
        <button @click="handleZoom(-100)" class="zoom-btn">
          <span class="text-xl">-</span>
        </button>
        <span class="zoom-level"
          >{{ Math.round((pdfWidth / 1000) * 100) }}%</span
        >
        <button @click="handleZoom(100)" class="zoom-btn">
          <span class="text-xl">+</span>
        </button>
      </div>

      <button
        @click="handlePreview"
        :disabled="isLoading"
        class="preview-button mb-4"
      >
        {{ isLoading ? "Generating Preview..." : "See Preview" }}
      </button>

      <div class="redaction-style-switch mb-4">
        <span class="switch-label">Redaction Style:</span>
        <div class="switch-buttons">
          <button
            @click="redactionStyle = 'blackbox'"
            :class="{ active: redactionStyle === 'blackbox' }"
            class="switch-btn"
          >
            Blackbox
          </button>
          <button
            @click="redactionStyle = 'label'"
            :class="{ active: redactionStyle === 'label' }"
            class="switch-btn"
          >
            Label
          </button>
        </div>
      </div>

      <div class="custom-redaction-box mb-4">
        <input
          v-model="customText"
          placeholder="Enter custom text to redact"
          class="custom-input"
        />
        <button @click="addCustomRedaction" class="add-redaction-btn">
          Add Custom Redaction
        </button>
      </div>

      <div class="entity-groups">
        <div
          v-for="(items, groupName) in groupedItems"
          :key="groupName"
          class="entity-group"
        >
          <h3 class="entity-title">{{ groupName }}</h3>
          <div class="cards-container">
            <div
              v-for="item in items"
              :key="item.id"
              class="redaction-card"
              :class="{ active: activeItemId === item.id }"
            >
              <div class="card-content">
                <p class="text-snippet">{{ item.text }}</p>
                <p class="confidence">{{ item.reason.split(" - ")[1] }}</p>
              </div>
              <div class="card-actions">
                <button
                  @click="handleDelete(item)"
                  class="delete-button"
                  title="Delete redaction"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  @click="toggleHighlight(item.id)"
                  class="eye-button"
                  :class="{ active: activeItemId === item.id }"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="w-6 h-6"
                  >
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path
                      fill-rule="evenodd"
                      d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Remove this section as it's now moved above -->
      <!-- <div v-if="isReviewComplete && !isPreviewMode">...</div> -->
    </div>
  </div>
  <div v-else class="p-4">Loading PDF...</div>

  <div v-if="showPasswordModal" class="modal-overlay">
    <div class="modal-content">
      <h3 class="modal-title">Encrypt PDF</h3>
      <p class="modal-description">
        Would you like to password protect your PDF?
      </p>
      <input
        v-model="password"
        type="password"
        placeholder="Enter password (optional)"
        class="password-input"
      />
      <div class="modal-actions">
        <button
          @click="processPreview(true)"
          :disabled="isLoading || isEncrypting"
          class="confirm-btn"
        >
          {{ isEncrypting ? "Encrypting..." : "Confirm" }}
        </button>
        <button
          @click="processPreview(false)"
          :disabled="isLoading || isEncrypting"
          class="skip-btn"
        >
          Skip
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  position: relative;
  min-height: 100vh;
  padding-right: 300px;
}

.pdf-wrapper {
  flex: 1;
  width: calc(100vw - 300px);
  overflow-x: auto;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
}

.pdf-container {
  height: fit-content;
  min-width: 500px;
  max-width: 2000px;
  margin: 0 auto;
}

.sidebar {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100vh;
  padding: 1rem;
  background: white;
  border-left: 1px solid #e5e7eb;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 10;
}

.zoom-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px;
  background: #f3f4f6;
  border-radius: 8px;
}

.zoom-btn {
  background: #e5e7eb;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.zoom-btn:hover {
  background: #d1d5db;
}

.zoom-level {
  font-size: 1.1rem;
  font-weight: 500;
}

.preview-button {
  width: 100%;
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.preview-button:hover {
  background: #2563eb;
}

.preview-button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.custom-redaction-box {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
}

.custom-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
}

.add-redaction-btn {
  width: 100%;
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-redaction-btn:hover {
  background: #059669;
}

.entity-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.entity-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: #374151;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.redaction-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.redaction-card.active {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.text-snippet {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.confidence {
  font-size: 0.75rem;
  color: #6b7280;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.delete-button {
  width: 2rem;
  height: 2rem;
  color: #ef4444;
  transition: color 0.2s;
}

.delete-button:hover {
  color: #dc2626;
}

.eye-button {
  width: 2rem;
  height: 2rem;
  margin-left: 0.5rem;
  color: #9ca3af;
  transition: color 0.2s;
}

.eye-button:hover {
  color: #6b7280;
}

.eye-button.active {
  color: #3b82f6;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 400px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.modal-description {
  margin-bottom: 1rem;
  color: #6b7280;
}

.password-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.confirm-btn {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.skip-btn {
  background: #6b7280;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}

.confirm-btn:disabled,
.skip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-button {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  background: white;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.back-button:hover {
  transform: scale(1.05);
  background: #f3f4f6;
}

.back-button svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #374151;
}

.redaction-style-switch {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
}

.switch-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.switch-buttons {
  display: flex;
  gap: 0.5rem;
}

.switch-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background: #fff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  transition: all 0.2s;
}

.switch-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}
</style>
