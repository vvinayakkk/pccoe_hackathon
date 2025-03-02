<template>
  <div>
    <header-bar showMenu showLogo />
    <h1 class="table-heading">Home</h1>
    <div class="card-container">
      <div class="stat-card purple">
        <div class="icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="content">
          <h4>Total Users</h4>
          <p>{{ stats.users }}</p>
        </div>
      </div>

      <div class="stat-card teal">
        <div class="icon">
          <i class="pi pi-file"></i>
        </div>
        <div class="content">
          <h4>Total Documents</h4>
          <p>{{ stats.documents }}</p>
        </div>
      </div>

      <div class="stat-card amber">
        <div class="icon">
          <i class="pi pi-shield"></i>
        </div>
        <div class="content">
          <h4>Redactions This Week</h4>
          <p>{{ stats.weeklyRedacted }}</p>
        </div>
      </div>
    </div>

    <!-- Redaction Tabs -->
    <div class="redaction-tabs-container">
      <TabView>
        <TabPanel header="File Redaction" :value="0">
          <div class="grid gap-8">
            <div class="col-12 md:col-6">
              <FileUpload
                mode="advanced"
                :multiple="true"
                accept="application/*,text/*,video/*,audio/*"
                :maxFileSize="1000000"
                @upload="onFileUpload"
                @select="onFileSelect"
                :customUpload="true"
                uploadLabel="Redact"
                class="w-full custom-upload"
              >
                <template #empty>
                  <div class="upload-placeholder">
                    <i class="pi pi-cloud-upload text-4xl mb-2"></i>
                    <p class="m-0">Drag and drop files here to upload</p>
                    <p class="text-sm text-gray-500">or click to browse</p>
                  </div>
                </template>
              </FileUpload>
            </div>
            <div class="col-12 md:col-6">
              <Card>
                <template #title>
                  <span class="text-gray-800">Redacted Files</span>
                </template>
                <template #content>
                  <div v-if="redactedFiles.length === 0">
                    No files redacted yet
                  </div>
                  <ul v-else class="list-none p-0">
                    <li
                      v-for="file in redactedFiles"
                      :key="file.name"
                      class="mb-2"
                    >
                      <Chip :label="file.name" />
                      <Button
                        icon="pi pi-download"
                        class="p-button-rounded p-button-text"
                        @click="downloadFile(file)"
                      />
                    </li>
                  </ul>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <!-- New TabPanel for Image Redaction -->
        <TabPanel header="Image Redaction" :value="2">
          <div class="grid gap-8">
            <div class="col-12 md:col-6">
              <FileUpload
                mode="advanced"
                :multiple="false"
                accept="image/*"
                :maxFileSize="1000000"
                @upload="onImageUpload"
                @select="onImageSelect"
                :customUpload="true"
                uploadLabel="Redact"
                class="w-full custom-upload"
                :disabled="isUploading"
              >
                <template #empty>
                  <div class="upload-placeholder">
                    <i class="pi pi-cloud-upload text-4xl mb-2"></i>
                    <p class="m-0">Drag and drop image here to upload</p>
                    <p class="text-sm text-gray-500">or click to browse</p>
                  </div>
                </template>
              </FileUpload>

              <!-- Error message -->
              <div v-if="imageError" class="error-message mt-2 text-red-500">
                {{ imageError }}
              </div>
            </div>

            <div class="col-12 md:col-6">
              <Card>
                <template #title>
                  <span class="text-gray-800">Image Preview</span>
                </template>
                <template #content>
                  <div class="image-preview-container">
                    <div
                      v-if="originalImageUrl"
                      class="original-image-container"
                    >
                      <h3>Original Image</h3>
                      <img
                        :src="originalImageUrl"
                        alt="Original"
                        class="preview-image"
                      />
                    </div>
                    <div v-if="redactedImage" class="redacted-image-container">
                      <h3>Redacted Image</h3>
                      <img
                        :src="redactedImage.url"
                        :alt="redactedImage.name"
                        class="redacted-image"
                      />
                      <Button
                        label="Download"
                        icon="pi pi-download"
                        class="p-button-rounded p-button-text mt-2"
                        :disabled="isUploading"
                        @click="downloadFile(redactedImage)"
                      />
                    </div>
                    <div v-else-if="isUploading" class="loading-state">
                      <i
                        class="pi pi-spin pi-spinner"
                        style="font-size: 2rem"
                      ></i>
                      <p>Processing image...</p>
                    </div>
                    <div v-else>No image redacted yet</div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <TabPanel header="Text Redaction" :value="1">
          <div class="grid gap-4">
            <div class="col-12">
              <!--Text Input area & Redact Button-->
              <div class="grid bg-black w-screen">
                <Textarea
                  v-model="inputText"
                  rows="8"
                  class="w-screen"
                  style="resize: none"
                  placeholder="Enter text to redact..."
                />
                <Button
                  label="Redact Text"
                  class="m-2"
                  @click="redactText"
                  :loading="isRedacting"
                />
              </div>
              <!--Text Input area & Redact Button Ends-->
            </div>
            <div class="col-12" v-if="redactedText">
              <Card>
                <template #title>
                  <span class="text-gray-800">Redacted Text</span>
                </template>
                <template #content>
                  <div class="redacted-text">{{ redactedText }}</div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from "vue";
import HeaderBar from "@/components/header/HeaderBar.vue";
import FileUpload from "primevue/fileupload";
import Card from "primevue/card";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import Chip from "primevue/chip";

//API function imports:
import { redactImage } from "@/api/redact";

// Add logger utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`📘 [INFO] ${message}`, data || "");
  },
  error: (message: string, error: any) => {
    console.error(`❌ [ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [WARN] ${message}`, data || "");
  },
  debug: (message: string, data?: any) => {
    console.debug(`🔍 [DEBUG] ${message}`, data || "");
  },
};

const inputText = ref("");
const redactedText = ref("");
const isRedacting = ref(false);
const redactedFiles = ref<Array<{ name: string; url: string }>>([]);
const redactedImageFiles = ref<Array<{ name: string; url: string }>>([]);
const redactedImage = ref<{ name: string; url: string } | null>(null);

// Add loading state
const isRedactingImage = ref(false);

const stats = reactive({
  users: 0,
  documents: 0,
  weeklyRedacted: 0,
});

// Fetch stats when component mounts
const fetchStats = async () => {
  // TODO: Implement API call to fetch statistics
  stats.users = 150;
  stats.documents = 1240;
  stats.weeklyRedacted = 45;
};

const onFileSelect = (event: any) => {
  // Handle file selection
  console.log("Files selected:", event.files);
};

const onFileUpload = async (event: any) => {
  // Handle file upload and redaction
  const files = event.files;
  // TODO: Implement file redaction logic
  // Mock redacted file
  redactedFiles.value.push({
    name: files[0].name.replace(".", "_redacted."),
    url: URL.createObjectURL(files[0]),
  });
};

const onImageSelect = (event: any) => {
  const file = event.files[0];

  // Validate file type
  if (!file.type.startsWith("image/")) {
    // If using PrimeVue Toast you can uncomment this
    // toast.add({ severity: '98error', summary: 'Error', detail: 'Please select an image file' });
    console.error("Please select an image file");
    return;
  }

  // Validate file size (1MB = 1000000 bytes)
  if (file.size > 1000000) {
    // toast.add({ severity: 'error', summary: 'Error', detail: 'File size should not exceed 1MB' });
    console.error("File size should not exceed 1MB");
    return;
  }

  // Create a URL for the original image
  originalImageUrl.value = URL.createObjectURL(file);

  // Manually trigger upload
  onImageUpload({ files: [file] });
};

const redactText = async () => {
  isRedacting.value = true;
  try {
    // TODO: Implement actual redaction logic
    redactedText.value = inputText.value.replace(/sensitive/g, "[REDACTED]");
  } finally {
    isRedacting.value = false;
  }
};

// Initialize component
fetchStats();

// Add these refs
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const originalImageUrl = ref<string | null>(null);
const imageError = ref<string | null>(null);
const isUploading = ref(false);

const onImageUpload = async (event: any) => {
  logger.debug("Image upload started", event);
  const file = event.files[0];
  if (!file) {
    logger.warn("No file provided for upload");
    return;
  }

  isUploading.value = true;
  imageError.value = null;

  try {
    logger.info("Preparing image upload", {
      fileName: file.name,
      fileSize: file.size,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", "en");
    formData.append(
      "entities",
      JSON.stringify([
        "DATE_TIME",
        "ID",
        "PHONE_NUMBER",
        "LOCATION",
        "EMAIL",
        "NRP",
        "NUMBER",
        "PERSON",
        "AGE",
      ])
    );

    logger.debug("Sending request to redact image");
    const response = await fetch("http://172.21.5.11:3000/redact-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to redact image: ${response.status} ${response.statusText}`
      );
    }

    logger.debug("Response received", { status: response.status });
    const blob = await response.blob();
    const redactedUrl = URL.createObjectURL(blob);

    logger.info("Image successfully redacted", {
      originalSize: file.size,
      redactedSize: blob.size,
    });

    redactedImage.value = {
      name: file.name.replace(/\.[^/.]+$/, "_redacted$&"),
      url: redactedUrl,
    };
  } catch (error) {
    logger.error("Image redaction failed", error);
    imageError.value =
      error instanceof Error ? error.message : "Failed to redact image";
  } finally {
    isUploading.value = false;
    logger.debug("Image upload process completed");
  }
};

const downloadFile = (file: { name: string; url: string }) => {
  logger.debug("Starting file download", { fileName: file.name });
  try {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logger.info("File download initiated", { fileName: file.name });
  } catch (error) {
    logger.error("File download failed", error);
  }
};

// Clean up URLs on component unmount
onUnmounted(() => {
  logger.debug("Component unmounting, cleaning up resources");
  if (originalImageUrl.value) {
    URL.revokeObjectURL(originalImageUrl.value);
    logger.debug("Revoked original image URL");
  }
  if (redactedImage.value?.url) {
    URL.revokeObjectURL(redactedImage.value.url);
    logger.debug("Revoked redacted image URL");
  }
});
</script>

<style scoped>
/* .page-container {
  min-height: 100vh;
  animation: fadeIn ease-in;
} */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.card-container {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 1rem;
  justify-items: center;
  margin-bottom: 3rem; /* Add this line */
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 12px;
  padding: 1.5rem;
  width: 100%;
  min-width: 200px;
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  animation: bounce 0.4s ease-in-out;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.stat-card .icon {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  padding: 1rem;
  margin-bottom: 1rem;
}

.stat-card h4 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.stat-card p {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.stat-card.purple {
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
}

.stat-card.teal {
  background: linear-gradient(135deg, #48c9b0, #1abc9c);
}

.stat-card.amber {
  background: linear-gradient(135deg, #ffca28, #ffb300);
}

@media (max-width: 968px) {
  .card-container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

.redaction-container {
  background: white;
  border-radius: 24px !important;
  width: 100%;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.custom-upload ::v-deep(.p-fileupload-content) {
  padding: 3rem;
  border: 2px dashed #4f46e5;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.custom-upload ::v-deep(.p-fileupload-content:hover) {
  border-color: #6366f1;
  background: rgba(255, 255, 255, 1);
  transform: scale(1.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #4f46e5;
}

.upload-placeholder i {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: float 1.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
    animation-timing-function: cubic-bezier(0.8, 0, 0.2, 1);
  }
  50% {
    transform: translateY(-6px);
    animation-timing-function: cubic-bezier(0.8, 0, 0.2, 1);
  }
}

.redacted-text {
  white-space: pre-wrap;
  min-height: 200px;
  padding: 1.5rem;
  border-radius: 12px;
  background: #f8fafc;
  font-family: "Monaco", monospace;
  line-height: 1.6;
}

Button {
  transition: all 0.3s ease;
}

Button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

Textarea {
  border-radius: 12px !important;
  padding: 1rem !important;
  font-family: "Inter", sans-serif;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

Textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.text-4xl {
  font-size: 3rem;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stats-container {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(20em, 1fr));
  justify-content: space-between;
}
.stats-card {
  height: 100%;
  width: 20em;
}

.stats-card ::v-deep(.p-card-title) {
  color: white;
}

.redacted-text {
  white-space: pre-wrap;
  min-height: 200px;
}

.grid {
  display: grid;
  gap: 1rem;
}

.col-12 {
  grid-column: span 12 / span 12;
}

.md\:col-4 {
  grid-column: span 4 / span 12;
}

.mt-4 {
  margin-top: 1rem;
}

.custom-upload ::v-deep(.p-fileupload-content) {
  padding: 2rem;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.custom-upload ::v-deep(.p-fileupload-content:hover) {
  border-color: #4f46e5;
  background-color: #f3f4f6;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.text-4xl {
  font-size: 2.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-gray-500 {
  color: #6b7280;
}

:deep(.p-tabview) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.p-tabview-panels) {
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  background-color: white;
  padding: 1.5rem;
}

:deep(.p-tabview-nav) {
  background-color: #f8fafc;
  border: none;
}

:deep(.p-tabview-nav li .p-tabview-nav-link) {
  border-radius: 0;
  margin: 0;
  transition: all 0.3s ease;
}

:deep(.p-tabview-nav li:first-child .p-tabview-nav-link) {
  border-top-left-radius: 12px;
}

:deep(.p-tabview-nav li:last-child .p-tabview-nav-link) {
  border-top-right-radius: 12px;
}

.table-heading {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem;
}

.redacted-image {
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.preview-image,
.redacted-image {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  margin: 1rem 0;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.original-image-container,
.redacted-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
