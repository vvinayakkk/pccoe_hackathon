<template>
  <div>
    <header-bar showMenu showLogo />
    <h1 class="table-heading">Analytics Dashboard</h1>
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
          <h4>Total Redactions</h4>
          <p>{{ stats.totalRedactions }}</p>
        </div>
      </div>
    </div>

    <div class="activity-flex-container">
      <div class="card table-container">
        <h2 class="datatable-heading">Recent Activities</h2>
        <!-- <DataTable :value="products" showGridlines tableStyle="min-width: 50rem">
          <Column field="document_name" header="File"></Column>
          <Column field="activity_type" header="Activity"></Column>
          <Column field="user_name" header="User"></Column>
          <Column field="activity_time" header="Time"></Column>
        </DataTable> -->
        <div class="table-container">
    <DataTable 
      :value="activities" 
      showGridlines 
      :scrollable="true"
      scrollHeight="400px"
      class="recent-activities-table"
    >
      <Column field="document_name" header="File"></Column>
      <Column field="activity" header="Activity">
        <template #body="slotProps">
          <span :class="getActivityClass(slotProps.data.activity)">
            {{ slotProps.data.activity }}
          </span>
        </template>
      </Column>
      <Column field="username" header="User"></Column>
      <Column field="timestamp" header="Time">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.timestamp) }}
        </template>
      </Column>
    </DataTable>
  </div>
      </div>
      
    </div>

    <div class="activity-flex-container">
      <div class="card chart-container">
        <h2 class="chart-heading">Monthly Analytics</h2>
        <Chart
          type="bar"
          :data="chartData"
          :options="chartOptions"
          class="analytics-chart"
        />
      </div>
      <div class="card chart-container">
        <h2 class="chart-heading">Distribution</h2>
        <Chart
          type="pie"
          :data="pieChartData"
          :options="pieChartOptions"
          class="analytics-chart"
        />
      </div>
    </div>
  </div>
  <div >
    <Users class="users-margin" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch , reactive } from "vue";
import { ProductService } from "@/service/ProductService";
import HeaderBar from "@/components/header/HeaderBar.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup"; // optional
import Row from "primevue/row";
import Users from "@/views/settings/Users.vue";
import axios from 'axios';

import Chart from 'primevue/chart';
import { useTheme } from '@/composables/useTheme';

const { isDark } = useTheme();

// onMounted(() => {
//   ProductService.getProductsMini().then((data) => (products.value = data));
// });

// const products = ref();
const stats = reactive({
  users: 0,
  documents: 0,
  totalRedactions: 0 // Added new stat
});

// Update fetchStats function
const fetchStats = async () => {
  try {
    // Fetch total redactions
    const response = await axios.get('http://localhost:3500/api/redactions/total');
    if (response.data.success) {
      stats.totalRedactions = response.data.data.total_redactions;
    }
    
    // TODO: Implement other API calls
    stats.users = 150;
    stats.documents = 1240;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};
onMounted(() => {
  fetchStats();
});
const activities = ref([]);

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3500/api/logs');
    activities.value = response.data;
    console.log('Activities:', activities.value);
  } catch (error) {
    console.error('Error fetching activities:', error);
  }
});

const getActivityClass = (activity) => {
  return {
    'activity-add': activity === 'add',
    'activity-delete': activity === 'delete'
  };
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3500/api/analytics/monthly');
    console.log('Raw API Response:', response.data);
    console.log('Analytics Data:', response.data.data);
    chartData.value = setChartData(response.data.data);
    console.log('Processed Chart Data:', chartData.value);
    chartOptions.value = setChartOptions();
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }
});

const chartData = ref();
const chartOptions = ref();

const setChartData = (analyticsData) => {
  if (!analyticsData) return null;
  
  return {
    labels: analyticsData.months,
    datasets: [
      {
        label: 'Number of PII detected',
        backgroundColor: '#06b6d4',
        borderColor: '#06b6d4',
        data: analyticsData.piisDetected,
      },
      {
        label: "Number of Users",
        backgroundColor: '#6b7280',
        borderColor: '#6b7280',
        data: analyticsData.usersCount,
      },
      {
        label: "Number of Documents",
        backgroundColor: "#FACC15",
        borderColor: "#FACC15",
        data: analyticsData.documentsCount,
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const borderColor = documentStyle.getPropertyValue('--border-color');

  return {
    maintainAspectRatio: false,
    aspectRatio: 1.5,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColor,
          font: {
            weight: 500,
          },
        },
        grid: {
          color: borderColor,
          display: true,
          drawBorder: true,
        },
      },
      y: {
        ticks: {
          color: textColor,
        },
        grid: {
          color: borderColor,
          display: true,
          drawBorder: true,
        },
      },
    },
  };
};

watch(isDark, () => {
  chartOptions.value = setChartOptions();
});

const pieChartData = ref();
const pieChartOptions = ref();
watch(isDark, () => {
  pieChartOptions.value = initializePieChartOptions();
});

onMounted(async () => {
  try {
    // Fetch bar chart data
    const monthlyResponse = await axios.get('http://localhost:3500/api/analytics/monthly');
    console.log('Monthly Analytics Data:', monthlyResponse.data);
    chartData.value = setChartData(monthlyResponse.data.data);
    chartOptions.value = setChartOptions();

    // Fetch pie chart data
    const pieResponse = await axios.get('http://localhost:3500/api/analytics/pie');
    console.log('Pie Chart Data:', pieResponse.data);
    pieChartData.value = initializePieChartData(pieResponse.data);
    pieChartOptions.value = initializePieChartOptions();
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }
});

const initializePieChartData = (responseData) => {
  if (!responseData) return null;

  const documentStyle = getComputedStyle(document.body);
  
  return {
    labels: responseData.labels,
    datasets: [
      {
        data: responseData.data,
        backgroundColor: [
         '#06b6d4',
          '#6b7280',
          '#FACC15',
          '#3b82f6',
          '#9333ea',
          '#22c55e',
          '#ef4444',
          '#f97316',
          '#8b5cf6',
          '#14b8a6',
          '#fde047',
          '#fca5a5',
          '#fcd34d',
          '#7dd3fc',
          '#e879f9',
          '#60a5fa',
          '#a3e635',
          '#d97706',
        ],
        hoverBackgroundColor: [
          '#05a3c0',
          '#5f6472',
          '#eab308',
          '#3476e3',
          '#832eda',
          '#1e9e54',
          '#dc3838',
          '#e8640f',
          '#7a4ee3',
          '#129b93',
          '#e9c336',
          '#f79090',
          '#f6c03c',
          '#6bc6f1',
          '#d968ea',
          '#5294e6',
          '#93c12e',
          '#c16a05',
        ]
      }
    ]
  };
};

const initializePieChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const borderColor = documentStyle.getPropertyValue('--border-color');

  return {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          usePointStyle: true,
          padding: 20,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, index) => ({
              text: label,
              fillStyle: datasets[0].backgroundColor[index],
              strokeStyle: borderColor,
              lineWidth: 1,
              hidden: false,
              index: index,
              fontColor: textColor
            }));
          },
          font: {
            size: 8
          }
        }
      }
    },
    responsive: true,
    maintainAspectRatio: false
  };
};

watch(isDark, () => {
  pieChartOptions.value = initializePieChartOptions();
});
</script>

<style scoped>
.table-heading {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem;
  margin-top: 0;
  padding-top: 0;
}

.datatable-heading {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem;
}
.chart-heading {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 1rem;
  margin-top: 0;
}

.card-container {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 1rem;
  justify-items: center;
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
  transition: transform 0.2s ease-in-out; /* Smooth animation */
}

.stat-card:hover {
  animation: bounce 0.4s ease-in-out; /* Trigger the bounce animation */
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



/* Lighter Gradient Backgrounds */
.stat-card.purple {
  background: linear-gradient(135deg, #9b59b6, #8e44ad); /* Lighter purple */
}

.stat-card.teal {
  background: linear-gradient(135deg, #48c9b0, #1abc9c); /* Lighter teal */
}

.stat-card.amber {
  background: linear-gradient(135deg, #ffca28, #ffb300); /* Lighter amber */
}

@media (max-width: 968px) {
  .card-container {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

.chart-container {
  margin-top: 2rem;
  padding: 1.5rem;
  height: 600px;
}

.analytics-chart {
  height: 500px !important;
  width: 100%;
}

.p-datatable,
.p-datatable-header,
.p-datatable-thead > tr > th,
.p-datatable-tbody > tr > td,
.p-datatable-footer,
.p-datatable-wrapper,
.p-datatable-table {
  border-radius: 0 !important; /* Remove all rounded corners */
  overflow: hidden; /* Ensure no overflow issues */
}

.flex-container {
  display: flex;
  align-items: stretch;
  gap: 2rem;
  padding: 0 1rem;
  margin-top: 2rem;
}

.chart-flex-container {
  display: flex;
  align-items: stretch;
  gap: 2rem;
  padding: 0 1rem;
  margin-top: 2rem;
}

.table-container {
  flex: 3;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: auto;
  overflow: hidden;
}

.users-container {
  flex: 2;
  min-width: 0;
  height: 500px;
  overflow-y: auto;
}

/* Make table body scrollable */
:deep(.p-datatable-wrapper) {
  height: calc(100% - 3.5rem); /* Subtract header height */
  overflow: auto; /* Changed from overflow-y to overflow to enable both scrolls */
}

/* Keep header fixed */
:deep(.p-datatable-header) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: var(--surface-a);
}

/* Ensure table rows don't shrink and enable horizontal scroll */
:deep(.p-datatable-tbody > tr > td) {
  white-space: nowrap; /* Prevent text wrapping */
}

/* Responsive design for smaller screens */
@media (max-width: 1024px) {
  .flex-container,
  .chart-flex-container {
    flex-direction: column;
  }

  .table-container,
  .users-container{
    width: 100%;
    margin-top: 0;
  }
  .chart-container {
    width: 100%;
    margin-top: 0;
    height: auto;
  }
}
.chart {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-container {
  flex: 1;
  min-width: 0;
  height: 400px; /* Set a fixed height for charts */
}

/* Add these new styles to set the 3:2 ratio */
.chart-flex-container .chart-container:first-child {
  flex: 3; /* Bar chart takes 3 parts */
}

.chart-flex-container .chart-container:last-child {
  flex: 2; /* Pie chart takes 2 parts */
}

.chart-container {
  flex: 1;
  min-width: 0;
  height: 600px; /* Increased from 400px to 600px */
  margin-top: 0rem;
  margin-left: 0rem;
}

.analytics-chart {
  height: 500px !important; /* Increased from default to 500px */
  width: 100%;
  margin-top: 0rem;
  margin-right: 0rem;
}

.activity-flex-container {
  display: flex;
  align-items: stretch;
  gap: 2rem;
  padding: 0 1rem;
  margin-top: 2rem;
}

/* Update these containers to match the chart ratio */
.activity-flex-container .table-container {
  flex: 3; /* Takes 3 parts like the bar chart */
  min-width: 0;
}

.activity-flex-container .users-container {
  flex: 2; /* Takes 2 parts like the pie chart */
  min-width: 0;
}

/* Update responsive design */
@media (max-width: 1024px) {
  .activity-flex-container {
    flex-direction: column;
  }
}

.activity-flex-container {
  display: flex;
  align-items: stretch;
  gap: 2rem;
  padding: 0 1rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

/* Update containers to have consistent widths */
.activity-flex-container .table-container,
.activity-flex-container .chart-container:first-child {
  flex: 3;
  min-width: 0;
}

.activity-flex-container .users-container,
.activity-flex-container .chart-container:last-child {
  flex: 2;
  min-width: 0;
}

/* Remove any conflicting styles */
.chart-flex-container {
  display: none; /* Remove the old container */
}

.chart-container {
  margin: 0;
  height: 600px;
}

.analytics-chart {
  height: 450px !important; /* Reduced height to make room for bottom labels */
  width: 100%;
  margin: 0;
}

.users-margin {
  margin-left: 1rem;
  margin-right: 1rem;
}
:deep(.p-datatable),
:deep(.p-datatable-header),
:deep(.p-datatable-thead > tr > th),
:deep(.p-datatable-tbody > tr > td),
:deep(.p-datatable-footer),
:deep(.p-datatable-wrapper),
:deep(.p-datatable-table) {
  border-radius: 0 !important; /* Remove all rounded corners */
  overflow: hidden; /* Ensure no overflow issues */
}

.chart-container {
  margin: 0;
  height: 600px;
  display: flex;
  flex-direction: column;
}

.analytics-chart {
  height: 450px !important; /* Reduced height to make room for bottom labels */
  width: 100%;
  margin: 0;
}
.activity-add {
  color: var(--green-500);
  font-weight: 500;
}

.activity-delete {
  color: var(--red-500);
  font-weight: 500;
}

.table-container {
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
}

:deep(.recent-activities-table) {
  height: 100%;
}

:deep(.p-datatable-wrapper) {
  height: 100%;
}

:deep(.p-datatable-scrollable-body) {
  overflow-y: scroll !important;
}
</style>
