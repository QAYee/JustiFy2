"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonButton,
} from "@ionic/react";
import { mailOutline, peopleOutline, flagOutline } from "ionicons/icons";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement } from "chart.js";

// Import the CSS file
import "./StatisticsContainer.css";

ChartJS.register(ChartDataLabels);

interface ContainerProps {
  name: string;
}

interface ComplaintsByStatus {
  status: string;
  count: number;
}

interface ComplaintsByType {
  type: string;
  count: number;
}

interface ComplaintsByMonth {
  month: string;
  count: number;
  day?: number;
  date?: string;
}

interface StatisticsData {
  complaints: {
    total: number;
    monthly: ComplaintsByMonth[];
    byStatus: ComplaintsByStatus[];
    byType: ComplaintsByType[];
  };
  users: {
    total: number;
    monthly: { month: string; count: number; day?: number; date?: string }[];
    byRole: { role: string; count: number }[];
  };
}

interface DateFilter {
  year: number;
  month: string | null;
}

// No need for complaint type mapping since we're using names directly now
// Remove or comment out the old mapping
/*
const complaintTypeMap: { [key: number]: string } = {
  1: "Noise Complaint",
  2: "Property Dispute",
  3: "Public Disturbance",
  4: "Utility Issue",
  5: "Environmental Concern",
  6: "Vandalism",
  7: "Illegal Construction",
  8: "Parking Violation",
  9: "Animal Complaint",
  10: "Others",
};
*/

const StatisticsContainer: React.FC<ContainerProps> = ({ name }) => {
  const [activeTab, setActiveTab] = useState<string>("complaints");
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatisticsData | null>(null);

  // Date filtering states
  const currentYear = new Date().getFullYear();
  const [availableYears] = useState<number[]>(
    Array.from({ length: 6 }, (_, i) => currentYear - 5 + i)
  );
  const [filter, setFilter] = useState<DateFilter>({
    year: currentYear,
    month: null,
  });

  const complaintsChartRef = useRef<HTMLCanvasElement | null>(null);
  const complaintsStatusChartRef = useRef<HTMLCanvasElement | null>(null);
  const complaintsTypeChartRef = useRef<HTMLCanvasElement | null>(null);
  const usersChartRef = useRef<HTMLCanvasElement | null>(null);
  const usersRoleChartRef = useRef<HTMLCanvasElement | null>(null);

  const chartInstances = useRef<{ [key: string]: Chart | null }>({
    complaints: null,
    complaintsStatus: null,
    complaintsType: null,
    users: null,
    usersRole: null,
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const fetchStatistics = async (year: number, month: string | null) => {
    setLoading(true);

    try {
      // Build query parameters
      const params = new URLSearchParams({ year: year.toString() });
      if (month) {
        params.append("month", month);
      }

      // Fetch complaints statistics
      const complaintResponse = await fetch(
        `https://ivory-swallow-404351.hostingersite.com/Justify/index.php/StatisticsController/complaints?${params}`
      );
      const complaintData = await complaintResponse.json();

      // Fetch user statistics
      const userResponse = await fetch(
        `https://ivory-swallow-404351.hostingersite.com/Justify/index.php/StatisticsController/users?${params}`
      );
      const userData = await userResponse.json();

      // Check if the responses were successful based on the status flag in response
      if (!complaintData.status || !userData.status) {
        throw new Error("API returned error status");
      }

      // Determine if we're using daily or monthly data based on month filter
      const complaintsDataPoints = month
        ? complaintData.daily || []
        : complaintData.monthly || [];
      const usersDataPoints = month
        ? userData.daily || []
        : userData.monthly || [];

      setStats({
        complaints: {
          total: complaintData.total || 0,
          monthly: complaintsDataPoints,
          byStatus: complaintData.byStatus || [],
          byType: complaintData.byType || [],
        },
        users: {
          total: userData.total || 0,
          monthly: usersDataPoints,
          byRole: userData.byRole || [],
        },
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setLoading(false);
      // You might want to implement proper error handling here
      // For example:
      // setError("Failed to load statistics data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchStatistics(filter.year, filter.month);
  }, [filter.year, filter.month]);

  // Reset month filter when year changes
  const handleYearChange = (year: number) => {
    setFilter({ year, month: null });
  };

  // Apply both year and month filters
  const handleMonthChange = (month: string | null) => {
    setFilter({ ...filter, month });
  };

  // Reset filters to current year and no month
  const handleResetFilters = () => {
    setFilter({
      year: currentYear,
      month: null,
    });
  };

  // Define chart colors
  const chartColors = {
    primary: "#002fa7",
    primaryLight: "rgba(0, 47, 167, 0.2)",
    accent: "#9be368",
    accentLight: "rgba(155, 227, 104, 0.2)",

    statusColors: [
      "rgba(255, 206, 86, 0.6)", // New - yellow
      "rgba(0, 47, 167, 0.6)", // Under review - blue (primary)
      "rgba(153, 102, 255, 0.6)", // In progress - purple
      "rgba(155, 227, 104, 0.6)", // Resolved - green (accent)
      "rgba(201, 203, 207, 0.6)", // Closed - grey
      "rgba(255, 99, 132, 0.6)", // Rejected - red
    ],

    typeColors: {
      "Noise Complaint": "rgba(255, 99, 132, 0.6)",
      "Property Dispute": "rgba(0, 47, 167, 0.6)", // primary blue
      "Public Disturbance": "rgba(255, 206, 86, 0.6)",
      "Utility Issue": "rgba(155, 227, 104, 0.6)", // accent green
      "Environmental Concern": "rgba(153, 102, 255, 0.6)",
      Vandalism: "rgba(255, 159, 64, 0.6)",
      "Illegal Construction": "rgba(201, 203, 207, 0.6)",
      "Parking Violation": "rgba(255, 99, 71, 0.6)",
      "Animal Complaint": "rgba(46, 204, 113, 0.6)",
      Others: "rgba(0, 47, 167, 0.4)", // lighter primary
      Unknown: "rgba(100, 100, 100, 0.6)",
      default: "rgba(0, 47, 167, 0.6)",
    },
  };

  useEffect(() => {
    if (!stats || loading) return;

    // Destroy existing charts to prevent memory leaks
    Object.values(chartInstances.current).forEach((chart) => {
      if (chart) chart.destroy();
    });

    // Create complaint trend chart
    if (complaintsChartRef.current) {
      const ctx = complaintsChartRef.current.getContext("2d");
      if (ctx) {
        let dataLabels = [];
        let dataPoints = [];

        if (filter.month) {
          // Get number of days in the selected month
          const monthIndex = monthNames.indexOf(filter.month);
          const daysInMonth = new Date(
            filter.year,
            monthIndex + 1,
            0
          ).getDate();

          // Create array of all days in month
          dataLabels = Array.from(
            { length: daysInMonth },
            (_, i) => `Day ${i + 1}`
          );

          // Initialize data points with zeros
          dataPoints = Array(daysInMonth).fill(0);

          // Fill in actual data where available
          stats.complaints.monthly.forEach((item) => {
            const day = item.day || parseInt(item.date?.split("-")[2] || "0");
            if (day > 0 && day <= daysInMonth) {
              dataPoints[day - 1] = item.count;
            }
          });
        } else {
          // Monthly view - use data as is
          dataLabels = stats.complaints.monthly.map((item) => item.month);
          dataPoints = stats.complaints.monthly.map((item) => item.count);
        }

        const chartTitle = filter.month
          ? `Daily Complaints for ${filter.month} ${filter.year}`
          : `Monthly Complaints ${filter.year}`;

        chartInstances.current.complaints = new Chart(ctx, {
          type: "line",
          data: {
            labels: dataLabels,
            datasets: [
              {
                label: filter.month
                  ? "Complaints per Day"
                  : "Complaints per Month",
                data: dataPoints,
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryLight,
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: chartColors.primary,
                  font: {
                    weight: "bold",
                  },
                },
              },
              title: {
                display: true,
                text: chartTitle,
                color: chartColors.primary,
                font: {
                  weight: "bold",
                  size: 16,
                },
              },
            },
          },
        });
      }
    }

    // User chart - using accent colors
    if (usersChartRef.current) {
      const ctx = usersChartRef.current.getContext("2d");
      if (ctx) {
        let dataLabels = [];
        let dataPoints = [];

        if (filter.month) {
          // Get number of days in the selected month
          const monthIndex = monthNames.indexOf(filter.month);
          const daysInMonth = new Date(
            filter.year,
            monthIndex + 1,
            0
          ).getDate();

          // Create array of all days in month
          dataLabels = Array.from(
            { length: daysInMonth },
            (_, i) => `Day ${i + 1}`
          );

          // Initialize data points with zeros
          dataPoints = Array(daysInMonth).fill(0);

          // Fill in actual data where available
          stats.users.monthly.forEach((item) => {
            const day = item.day || parseInt(item.date?.split("-")[2] || "0");
            if (day > 0 && day <= daysInMonth) {
              dataPoints[day - 1] = item.count;
            }
          });
        } else {
          // Monthly view - use data as is
          dataLabels = stats.users.monthly.map((item) => item.month);
          dataPoints = stats.users.monthly.map((item) => item.count);
        }

        const chartTitle = filter.month
          ? `Daily User Registrations for ${filter.month} ${filter.year}`
          : `Monthly User Registrations ${filter.year}`;

        chartInstances.current.users = new Chart(ctx, {
          type: "line",
          data: {
            labels: dataLabels,
            datasets: [
              {
                label: filter.month
                  ? "User Registrations per Day"
                  : "User Registrations per Month",
                data: dataPoints,
                borderColor: chartColors.accent,
                backgroundColor: chartColors.accentLight,
                tension: 0.3,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: chartColors.primary,
                  font: {
                    weight: "bold",
                  },
                },
              },
              title: {
                display: true,
                text: chartTitle,
                color: chartColors.primary,
                font: {
                  weight: "bold",
                  size: 16,
                },
              },
            },
          },
        });
      }
    }

    // Create complaints by status chart
    if (complaintsStatusChartRef.current) {
      const ctx = complaintsStatusChartRef.current.getContext("2d");
      if (ctx) {
        // Calculate total for percentages
        const statusTotal = stats.complaints.byStatus.reduce(
          (sum, item) => sum + item.count,
          0
        );

        chartInstances.current.complaintsStatus = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: stats.complaints.byStatus.map((item) => item.status),
            datasets: [
              {
                label: "Complaints by Status",
                data: stats.complaints.byStatus.map((item) => item.count),
                backgroundColor: chartColors.statusColors,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: chartColors.primary,
                  font: {
                    weight: "bold",
                  },
                },
              },
              title: {
                display: true,
                text: "Complaints by Status",
                color: chartColors.primary,
                font: {
                  weight: "bold",
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    const percentage = (
                      (Number(value) / statusTotal) *
                      100
                    ).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                  },
                },
              },
              datalabels: {
                formatter: (value, context) => {
                  const percentage = ((value / statusTotal) * 100).toFixed(1);
                  return `${percentage}%`;
                },
                color: "#fff",
                font: {
                  weight: "bold",
                },
              },
            },
          },
        });
      }
    }

    // Create complaints by type chart
    if (complaintsTypeChartRef.current) {
      const ctx = complaintsTypeChartRef.current.getContext("2d");
      if (ctx) {
        // Define consistent colors for complaint types
        const complaintTypeColors: { [key: string]: string } =
          chartColors.typeColors;

        // Sort data by count (descending) for better visualization
        const sortedData = [...stats.complaints.byType].sort(
          (a, b) => b.count - a.count
        );

        // Show only top 10 complaint types if there are more
        const displayData = sortedData.slice(0, 10);

        // Get background colors based on type names
        const backgroundColors = displayData.map(
          (item) =>
            complaintTypeColors[item.type] || complaintTypeColors.default
        );

        console.log("Complaint types data:", stats.complaints.byType);

        chartInstances.current.complaintsType = new Chart(ctx, {
          type: "bar",
          data: {
            labels: displayData.map((item) => item.type),
            datasets: [
              {
                label: "Number of Complaints",
                data: displayData.map((item) => item.count),
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map((color) =>
                  color.replace("0.6", "1")
                ),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            indexAxis: "y", // Makes horizontal bar chart for better readability
            plugins: {
              legend: {
                display: false, // Hide legend as we're using colored bars
              },
              title: {
                display: true,
                text: "Complaints by Type",
                font: {
                  size: 16,
                  weight: "bold",
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.raw} complaints`;
                  },
                },
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  precision: 0, // Only show whole numbers
                },
                title: {
                  display: true,
                  text: "Number of Complaints",
                },
              },
              y: {
                title: {
                  display: true,
                  text: "Complaint Type",
                },
              },
            },
          },
        });
      }
    }

    // Create users by role chart
    if (usersRoleChartRef.current) {
      const ctx = usersRoleChartRef.current.getContext("2d");
      if (ctx) {
        // Calculate total for percentages
        const roleTotal = stats.users.byRole.reduce(
          (sum, item) => sum + item.count,
          0
        );

        chartInstances.current.usersRole = new Chart(ctx, {
          type: "pie",
          data: {
            labels: stats.users.byRole.map((item) => item.role),
            datasets: [
              {
                label: "Users by Role",
                data: stats.users.byRole.map((item) => item.count),
                backgroundColor: [
                  "rgba(255, 99, 132, 0.6)",
                  "rgba(54, 162, 235, 0.6)",
                  "rgba(255, 206, 86, 0.6)",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  color: chartColors.primary,
                  font: {
                    weight: "bold",
                  },
                },
              },
              title: {
                display: true,
                text: "Users by Role",
                color: chartColors.primary,
                font: {
                  weight: "bold",
                  size: 16,
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    const percentage = (
                      (Number(value) / roleTotal) *
                      100
                    ).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                  },
                },
              },
              datalabels: {
                formatter: (value, context) => {
                  const percentage = ((value / roleTotal) * 100).toFixed(1);
                  return `${percentage}%`;
                },
                color: "#fff",
                font: {
                  weight: "bold",
                },
              },
            },
          },
        });
      }
    }
  }, [stats, loading, activeTab, filter]);

  return (
    <>
      <IonCardHeader className="stats-card-header">
        <IonCardTitle className="stats-title">{name}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="stats-card-content">
        {/* Date filtering controls */}
        <div className="filter-container">
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonItem
                  className="filter-item"
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    margin: "8px 0",
                  }}
                >
                  <IonLabel
                    className="filter-label"
                    style={{
                      color: "#002fa7",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    Year
                  </IonLabel>
                  <IonSelect
                    value={filter.year}
                    onIonChange={(e) => handleYearChange(e.detail.value)}
                    interface="popover"
                    className="filter-select"
                    style={{
                      color: "#002fa7",
                      fontWeight: 500,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "rgba(0, 47, 167, 0.05)",
                    }}
                  >
                    {availableYears.map((year) => (
                      <IonSelectOption key={year} value={year}>
                        {year}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonItem
                  className="filter-item"
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e0e0e0",
                    margin: "8px 0",
                  }}
                >
                  <IonLabel
                    className="filter-label"
                    style={{
                      color: "#002fa7",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    Month
                  </IonLabel>
                  <IonSelect
                    value={filter.month}
                    onIonChange={(e) => handleMonthChange(e.detail.value)}
                    interface="popover"
                    className="filter-select"
                    style={{
                      color: "#002fa7",
                      fontWeight: 500,
                      padding: "4px 8px",
                      borderRadius: "4px",
                      background: "rgba(0, 47, 167, 0.05)",
                    }}
                  >
                    <IonSelectOption value={null}>All Months</IonSelectOption>
                    {monthNames.map((month, index) => (
                      <IonSelectOption key={month} value={month}>
                        {month}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
              <IonCol
                size="12"
                sizeMd="4"
                className="ion-text-end ion-padding-top"
              >
                <IonButton
                  fill="outline"
                  className="stats-outline-button"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>

        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as string)}
          className="stats-segment"
          scrollable={true}
        >
          <IonSegmentButton value="complaints">
            <IonLabel>Complaints</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="users">
            <IonLabel>Users</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="circular" className="loading-spinner" />
            <p className="loading-text">Loading statistics...</p>
          </div>
        ) : (
          <>
            {activeTab === "complaints" && stats && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <div className="stats-header">
                      <h2>
                        Total Complaints:{" "}
                        <span className="stats-total-value">
                          {stats.complaints.total}
                        </span>
                        {filter.month && (
                          <span className="filter-info">
                            {" "}
                            ({filter.month} {filter.year})
                          </span>
                        )}
                        {!filter.month && (
                          <span className="filter-info"> ({filter.year})</span>
                        )}
                      </h2>
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <div className="canvas-container">
                      <canvas ref={complaintsChartRef}></canvas>
                    </div>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <div className="canvas-container">
                      <canvas ref={complaintsStatusChartRef}></canvas>
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12">
                    <div
                      className="canvas-container"
                      style={{ minHeight: "400px" }}
                    >
                      <canvas ref={complaintsTypeChartRef}></canvas>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {activeTab === "users" && stats && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <div className="stats-header">
                      <h2>
                        Total Users:{" "}
                        <span className="stats-total-value">
                          {stats.users.total}
                        </span>
                        {filter.month && (
                          <span className="filter-info">
                            {" "}
                            ({filter.month} {filter.year})
                          </span>
                        )}
                        {!filter.month && (
                          <span className="filter-info"> ({filter.year})</span>
                        )}
                      </h2>
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" sizeMd="7">
                    <div className="canvas-container">
                      <canvas ref={usersChartRef}></canvas>
                    </div>
                  </IonCol>
                  <IonCol size="12" sizeMd="5">
                    <div className="canvas-container">
                      <canvas ref={usersRoleChartRef}></canvas>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </>
        )}
      </IonCardContent>
    </>
  );
};

export default StatisticsContainer;
