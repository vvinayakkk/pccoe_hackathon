<template>
  <div>
    <header-bar showMenu showLogo />
    <Sidebar />
    <div class="shared-files-container">
      <h1 class="page-title">Shared Files</h1>
      <!-- Filters -->
      <div class="filters">
        <Dropdown 
          v-model="selectedType" 
          :options="typeOptions" 
          optionLabel="name" 
          placeholder="Type" 
          class="filter-dropdown"
          :showClear="false"
        >
          <template #option="slotProps">
            <div class="dropdown-item">
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Dropdown>
        <Dropdown 
          v-model="selectedPeople" 
          :options="peopleOptions" 
          optionLabel="name" 
          placeholder="Search people" 
          class="filter-dropdown"
          :filter="true"
          :showClear="true"
        >
          <template #option="slotProps">
            <div class="dropdown-item">
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Dropdown>
        <Dropdown 
          v-model="selectedModified" 
          :options="modifiedOptions" 
          optionLabel="name" 
          placeholder="Time Period" 
          class="filter-dropdown"
          :showClear="false"
        >
          <template #option="slotProps">
            <div class="dropdown-item">
              <span>{{ slotProps.option.name }}</span>
            </div>
          </template>
        </Dropdown>
      </div>

      <!-- Table Header -->
      <DataTable :value="filteredSharedFiles" class="shared-files-table">
        <Column field="name" header="Name">
          <template #body="slotProps">
            <div class="file-name-cell">
              <i :class="getFileIcon(slotProps.data.type)" class="pi mr-2"></i>
              <a 
                @click="openFile(slotProps.data)"
                class="file-link"
              >
                {{ slotProps.data.name }}
              </a>
            </div>
          </template>
        </Column>
        <Column field="sharedBy" header="Shared by">
          <template #body="slotProps">
            <div class="shared-by-cell">
              <!-- <Avatar :image="slotProps.data.avatar" shape="circle" size="normal" /> -->
              <span class="ml-2">{{ slotProps.data.sharedBy }}</span>
            </div>
          </template>
        </Column>
        <Column field="shareDate" header="Share date" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.shareDate) }}
          </template>
        </Column>
        <Column style="width: 5rem">
          <template #body="slotProps">
            <Menu ref="menu" :model="menuItems" :popup="true" />
            <Button 
              icon="pi pi-ellipsis-v" 
              rounded 
              text 
              @click="toggleMenu($event, slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>

      <!-- Commented out time groups -->
      <!-- <div v-for="(group, index) in timeGroups" :key="index" class="time-group">
        <h3 class="time-group-header">{{ group.label }}</h3>
        <Divider />
      </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import HeaderBar from '@/components/header/HeaderBar.vue';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Divider from 'primevue/divider';
import Sidebar from '@/components/Sidebar.vue';
import Menu from 'primevue/menu';
import { ref as refVue } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Add this before your refs
interface TimeOption {
  name: string;
  value: string;
}

// Filter options
const typeOptions = ref([
  { name: 'All', value: 'all' },
  { name: 'Documents', value: 'document' },
  { name: 'Folders', value: 'folder' },
  { name: 'Images', value: 'image' }
]);

const peopleOptions = ref([
  { name: 'sih@aicte-india.org', value: 'sih' },
  { name: 'maggie@shefi.org', value: 'maggie' },
  // Add more people as needed
]);

const modifiedOptions = ref([
  { name: 'All Time', value: 'all' },
  { name: 'Today', value: 'today' },
  { name: 'Last 7 Days', value: 'last_7_days' },
  { name: 'Last 30 Days', value: 'last_30_days' },
  { name: 'This Year', value: 'this_year' }
]);

// Selected values
const selectedType = ref<{ name: string; value: string } | null>(null);
const selectedPeople = ref<{ name: string; value: string } | null>(null);
const selectedModified = ref<TimeOption | null>(null);

// Mock data with real dates
const sharedFiles = ref([
  {
    name: '#SIH2024_Student Repository',
    type: 'folder',
    sharedBy: 'sih@aicte-india.org',
    avatar: null,
    shareDate: '2024-03-20' // Recent date
  },
  {
    name: 'Learning and Development Stipend Request for SheFi',
    type: 'document',
    sharedBy: 'maggie@shefi.org',
    avatar: null,
    shareDate: '2024-02-15' // Older date
  },
  {
    name: 'Project Documentation',
    type: 'document',
    sharedBy: 'sih@aicte-india.org',
    avatar: null,
    shareDate: new Date().toISOString().split('T')[0] // Today's date
  }
]);

// Comment out timeGroups ref
// const timeGroups = ref([
//   { label: 'Last week', files: [] },
//   { label: 'Last month', files: [] }
// ]);

// Helper function to get appropriate icon based on file type
const getFileIcon = (type: string) => {
  switch (type) {
    case 'folder':
      return 'pi-folder';
    case 'document':
      return 'pi-file';
    case 'image':
      return 'pi-image';
    default:
      return 'pi-file';
  }
};

// Format date helper
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const menu = ref();
const selectedFile = ref(null);

const menuItems = [
  {
    label: 'Download',
    icon: 'pi pi-download',
    command: () => downloadFile(selectedFile.value)
  },
  {
    label: 'Remove',
    icon: 'pi pi-trash',
    command: () => removeFile(selectedFile.value)
  }
];

const toggleMenu = (event: Event, file: any) => {
  selectedFile.value = file;
  menu.value.toggle(event);
};

const downloadFile = (file: any) => {
  console.log('Downloading file:', file);
  // Implement download logic
};

const removeFile = (file: any) => {
  console.log('Removing file:', file);
  // Implement remove logic
};

const openFile = (file: any) => {
  if (file.type === 'folder') {
    // Navigate to folder
    router.push(`/files/${file.path}`);
  } else {
    // Open file (you can implement your file opening logic here)
    window.open(file.url, '_blank');
  }
};

// Computed property to filter files based on all selected filters
const filteredSharedFiles = computed(() => {
  let filtered = sharedFiles.value;

  // Filter by type
  if (selectedType.value?.value && selectedType.value.value !== 'all') {
    filtered = filtered.filter(file => file.type === selectedType.value!.value);
  }

  // Filter by people
  if (selectedPeople.value?.value) {
    filtered = filtered.filter(file => file.sharedBy === selectedPeople.value!.name);
  }

  // Filter by time period
  if (selectedModified.value?.value && selectedModified.value.value !== 'all') {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const msPerDay = 24 * 60 * 60 * 1000;
    
    filtered = filtered.filter(file => {
      const fileDate = new Date(file.shareDate);
      const daysDifference = Math.floor((now.getTime() - fileDate.getTime()) / msPerDay);

      switch (selectedModified.value!.value) {
        case 'today':
          return fileDate >= today;
        case 'last_7_days':
          return daysDifference <= 7;
        case 'last_30_days':
          return daysDifference <= 30;
        case 'this_year':
          return fileDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
  }

  return filtered;
});

onMounted(() => {
  // Initialize data or fetch from API
});
</script>

<style scoped>
.shared-files-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-left: 300px; /* Updated to match new sidebar width */
  margin-top: 0;
  padding-top: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-dropdown {
  min-width: 150px;
}

.shared-files-table {
  margin-bottom: 2rem;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shared-by-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-group {
  margin-top: 2rem;
}

.time-group-header {
  color: var(--text-color);
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

:deep(.p-dropdown) {
  background-color: var(--surface-a) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-panel) {
  background-color: var(--surface-a) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-items-wrapper) {
  background-color: var(--surface-a) !important;
}

:deep(.p-dropdown-item) {
  padding: 0.75rem 1.25rem !important;
  color: var(--text-color) !important;
  background: var(--surface-a) !important;
}

:deep(.p-dropdown-item:not(.p-highlight):not(.p-disabled):hover) {
  background: var(--surface-hover) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-item.p-highlight) {
  background: var(--surface-hover) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-item .p-checkbox) {
  display: none !important;
}

:deep(.p-dropdown-filter-container) {
  background-color: var(--surface-a) !important;
}

:deep(.p-dropdown-filter) {
  background-color: var(--surface-a) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-label) {
  color: var(--text-color) !important;
}

:deep(.p-dropdown-trigger) {
  color: var(--text-color) !important;
}

:deep(.p-datatable) {
  background-color: transparent;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background-color: transparent;
  border-left: none;
  border-right: none;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: transparent !important;
}

:deep(.p-datatable .p-datatable-thead > tr:first-child > th:first-child) {
  border-top-left-radius: 12px;
}

:deep(.p-datatable .p-datatable-thead > tr:first-child > th:last-child) {
  border-top-right-radius: 12px;
}

:deep(.p-datatable .p-datatable-tbody > tr:last-child > td:first-child) {
  border-bottom-left-radius: 12px;
}

:deep(.p-datatable .p-datatable-tbody > tr:last-child > td:last-child) {
  border-bottom-right-radius: 12px;
}

.page-title {
  color: var(--text-color);
  margin-bottom: 2rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 0;
  padding-top: 0;
}

:deep(.p-dropdown-filter) {
  width: 100%;
  padding: 0.5rem;
}

:deep(.p-dropdown) {
  width: 100%;
  min-width: 200px;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border-left: none;
  border-right: none;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  border-left: none;
  border-right: none;
  border-bottom: 1px solid var(--surface-border);
}

:deep(.p-datatable-wrapper) {
  background-color: transparent !important;
}

:deep(.p-datatable) {
  background-color: transparent !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: transparent !important;
  border: none !important;
  border-bottom: 1px solid var(--surface-border) !important;
  color: var(--text-color) !important;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  background-color: transparent !important;
  border-bottom: 1px solid var(--surface-border) !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  background-color: transparent !important;
  border: none !important;
  border-bottom: 1px solid var(--surface-border) !important;
  padding: 1rem !important;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: transparent !important;
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
  background-color: transparent !important;
}

.file-link {
  color: var(--text-color);
  cursor: pointer;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
  color: var(--primary-color);
}

:deep(.p-dropdown-panel .p-dropdown-items) {
  background: var(--surface-a);
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
  color: var(--text-color);
  background: var(--surface-a);
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover) {
  background: var(--surface-hover);
  color: var(--text-color);
}

:deep(.p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight) {
  background: var(--surface-hover);
  color: var(--text-color);
}

:deep(.p-dropdown-panel .p-dropdown-header .p-dropdown-filter) {
  background: var(--surface-a);
  color: var(--text-color);
}

:deep(.p-dropdown-panel .p-dropdown-header .p-dropdown-filter:focus) {
  border-color: var(--primary-color);
}

.dropdown-item {
  display: flex;
  align-items: center;
  color: var(--text-color);
}

:deep(.p-dropdown-items) {
  padding: 0.5rem 0;
  background: var(--surface-b) !important;
  color: var(--text-color) !important;
  border: 1px solid var(--surface-border);
}

:deep(.p-dropdown-item) {
  padding: 0.75rem 1.25rem !important;
  color: var(--text-color) !important;
  background: var(--surface-b) !important;
  transition: background-color 0.2s !important;
}

:deep(.p-dropdown-item:not(.p-highlight):not(.p-disabled):hover) {
  background: var(--surface-d) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-item.p-highlight) {
  background: var(--surface-d) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-filter-container) {
  background-color: var(--surface-b) !important;
}

:deep(.p-dropdown-filter) {
  background-color: var(--surface-b) !important;
  color: var(--text-color) !important;
}

:deep(.p-dropdown-panel) {
  background: var(--surface-b) !important;
}
</style>
