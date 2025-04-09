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

  // Add state to track window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redraw charts when window size changes
  useEffect(() => {
    if (stats && !loading) {
      // Force chart redraw by destroying and recreating them
      Object.values(chartInstances.current).forEach((chart) => {
        if (chart) chart.destroy();
      });

      // This will trigger the useEffect that creates charts
      setStats({ ...stats });
    }
  }, [windowWidth]);

  useEffect(() => {
    if (!stats || loading) return;

    // Get current screen width for responsive adjustments
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth < 768;

    // Common responsive chart options
    const getResponsiveOptions = (title: string) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isMobile ? "bottom" : "top",
          labels: {
            boxWidth: isMobile ? 12 : 20,
            padding: isMobile ? 10 : 20,
            color: chartColors.primary,
            font: {
              size: isMobile ? 10 : 14,
              weight: "bold",
            },
          },
        },
        title: {
          display: true,
          text: title,
          color: chartColors.primary,
          font: {
            weight: "bold",
            size: isMobile ? 14 : 16,
          },
          padding: {
            top: 10,
            bottom: isMobile ? 5 : 10,
          },
        },
        datalabels: {
          font: {
            size: isMobile ? 9 : 11,
            weight: "bold",
          },
        },
      },
    });

    // Destroy existing charts to prevent memory leaks
    Object.values(chartInstances.current).forEach((chart) => {
      if (chart) chart.destroy();
    });

    // Create complaint trend chart with responsive options
    if (complaintsChartRef.current) {
      const ctx = complaintsChartRef.current.getContext("2d");
      if (ctx) {
        let dataLabels = [];
        let dataPoints = [];

        if (filter.month) {
          const monthIndex = monthNames.indexOf(filter.month);
          const daysInMonth = new Date(
            filter.year,
            monthIndex + 1,
            0
          ).getDate();

          dataLabels = Array.from(
            { length: daysInMonth },
            (_, i) => `Day ${i + 1}`
          );

          dataPoints = Array(daysInMonth).fill(0);

          stats.complaints.monthly.forEach((item) => {
            const day = item.day || parseInt(item.date?.split("-")[2] || "0");
            if (day > 0 && day <= daysInMonth) {
              dataPoints[day - 1] = item.count;
            }
          });
        } else {
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
            ...getResponsiveOptions(chartTitle),
            scales: {
              x: {
                ticks: {
                  maxRotation: isMobile ? 45 : 0,
                  minRotation: isMobile ? 45 : 0,
                  font: {
                    size: isMobile ? 8 : 12,
                  },
                  autoSkip: true,
                  maxTicksLimit: isMobile ? 8 : 12,
                },
              },
              y: {
                ticks: {
                  font: {
                    size: isMobile ? 10 : 12,
                  },
                },
                beginAtZero: true,
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
          const monthIndex = monthNames.indexOf(filter.month);
          const daysInMonth = new Date(
            filter.year,
            monthIndex + 1,
            0
          ).getDate();

          dataLabels = Array.from(
            { length: daysInMonth },
            (_, i) => `Day ${i + 1}`
          );

          dataPoints = Array(daysInMonth).fill(0);

          stats.users.monthly.forEach((item) => {
            const day = item.day || parseInt(item.date?.split("-")[2] || "0");
            if (day > 0 && day <= daysInMonth) {
              dataPoints[day - 1] = item.count;
            }
          });
        } else {
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
            ...getResponsiveOptions(chartTitle),
            scales: {
              x: {
                ticks: {
                  maxRotation: isMobile ? 45 : 0,
                  minRotation: isMobile ? 45 : 0,
                  font: {
                    size: isMobile ? 8 : 12,
                  },
                  autoSkip: true,
                  maxTicksLimit: isMobile ? 8 : 12,
                },
              },
              y: {
                ticks: {
                  font: {
                    size: isMobile ? 10 : 12,
                  },
                },
                beginAtZero: true,
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
            ...getResponsiveOptions("Complaints by Status"),
            plugins: {
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
        const complaintTypeColors: { [key: string]: string } =
          chartColors.typeColors;

        const sortedData = [...stats.complaints.byType].sort(
          (a, b) => b.count - a.count
        );

        const displayData = sortedData.slice(0, 10);

        const backgroundColors = displayData.map(
          (item) =>
            complaintTypeColors[item.type] || complaintTypeColors.default
        );

        const typeChartOptions = {
          ...getResponsiveOptions("Complaints by Type"),
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                font: {
                  size: isMobile ? 10 : 12,
                },
              },
            },
            y: {
              ticks: {
                font: {
                  size: isMobile ? 9 : 11,
                },
                autoSkip: true,
                maxTicksLimit: isMobile ? 7 : 10,
              },
            },
          },
        };

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
        });
      }
    }

    // Create users by role chart
    if (usersRoleChartRef.current) {
      const ctx = usersRoleChartRef.current.getContext("2d");
      if (ctx) {
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
            ...getResponsiveOptions("Users by Role"),
            plugins: {
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
              <IonGrid className="stats-grid">
                {/* Summary header - Mobile optimized */}
                <IonRow>
                  <IonCol size="12">
                    <div
                      className="stats-header"
                      style={{
                        padding: "12px",
                        backgroundColor: "#f5f7ff",
                        borderRadius: "10px",
                        marginBottom: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <h2
                        className="stats-title-mobile"
                        style={{
                          fontSize: "1.2rem",
                          margin: "0",
                          textAlign: "center",
                          fontWeight: "700",
                          color: "#002fa7",
                        }}
                      >
                        Total Complaints:{" "}
                        <span
                          className="stats-total-value"
                          style={{
                            fontSize: "1.5rem",
                            color: "#002fa7",
                            fontWeight: "800",
                          }}
                        >
                          {stats.complaints.total}
                        </span>
                        {filter.month && (
                          <span
                            className="filter-info"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "500",
                              color: "#666",
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            {filter.month} {filter.year}
                          </span>
                        )}
                        {!filter.month && (
                          <span
                            className="filter-info"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "500",
                              color: "#666",
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            {filter.year}
                          </span>
                        )}
                      </h2>
                    </div>
                  </IonCol>
                </IonRow>

                {/* Charts - Mobile responsive layout */}
                <IonRow>
                  {/* Chart container with horizontal scrolling */}
                  <IonCol size="12" sizeMd="6">
                    <div
                      className="chart-scroll-container"
                      style={{
                        marginBottom: "24px",
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                        position: "relative",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      <div
                        style={{
                          minHeight: "250px",
                          height: window.innerWidth < 768 ? "280px" : "300px",
                          minWidth: window.innerWidth < 768 ? "500px" : "100%",
                        }}
                      >
                        <canvas ref={complaintsChartRef}></canvas>
                      </div>
                    </div>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <div
                      className="chart-scroll-container"
                      style={{
                        marginBottom: "24px",
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                        position: "relative",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      <div
                        style={{
                          minHeight: "250px",
                          height: window.innerWidth < 768 ? "280px" : "300px",
                          minWidth: window.innerWidth < 768 ? "300px" : "100%",
                        }}
                      >
                        <canvas ref={complaintsStatusChartRef}></canvas>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>

                {/* Complaint types chart with horizontal scrolling */}
                <IonRow>
                  <IonCol size="12">
                    <div
                      className="chart-scroll-container"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                        position: "relative",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      <div
                        style={{
                          height: window.innerWidth < 768 ? "380px" : "400px",
                          minWidth: window.innerWidth < 768 ? "600px" : "100%",
                        }}
                      >
                        <canvas ref={complaintsTypeChartRef}></canvas>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {activeTab === "users" && stats && (
              <IonGrid>
                {/* Summary header - Mobile optimized */}
                <IonRow>
                  <IonCol size="12">
                    <div
                      className="stats-header"
                      style={{
                        padding: "12px",
                        backgroundColor: "#f5f7ff",
                        borderRadius: "10px",
                        marginBottom: "16px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.2rem",
                          margin: "0",
                          textAlign: "center",
                          fontWeight: "700",
                          color: "#002fa7",
                        }}
                      >
                        Total Users:{" "}
                        <span
                          className="stats-total-value"
                          style={{
                            fontSize: "1.5rem",
                            color: "#002fa7",
                            fontWeight: "800",
                          }}
                        >
                          {stats.users.total}
                        </span>
                        {filter.month && (
                          <span
                            className="filter-info"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "500",
                              color: "#666",
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            {filter.month} {filter.year}
                          </span>
                        )}
                        {!filter.month && (
                          <span
                            className="filter-info"
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: "500",
                              color: "#666",
                              display: "block",
                              marginTop: "4px",
                            }}
                          >
                            {filter.year}
                          </span>
                        )}
                      </h2>
                    </div>
                  </IonCol>
                </IonRow>

                {/* User charts with horizontal scrolling */}
                <IonRow>
                  <IonCol size="12" sizeMd="7">
                    <div
                      className="chart-scroll-container"
                      style={{
                        marginBottom: "24px",
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                        position: "relative",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      <div
                        style={{
                          minHeight: "250px",
                          height: "300px",
                          minWidth: window.innerWidth < 768 ? "500px" : "100%",
                        }}
                      >
                        <canvas ref={usersChartRef}></canvas>
                      </div>
                    </div>
                  </IonCol>

                  <IonCol size="12" sizeMd="5">
                    <div
                      className="chart-scroll-container"
                      style={{
                        marginBottom: "24px",
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                        position: "relative",
                        overflowX: "auto",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      <div
                        style={{
                          minHeight: "250px",
                          height: "300px",
                          minWidth: window.innerWidth < 768 ? "300px" : "100%",
                        }}
                      >
                        <canvas ref={usersRoleChartRef}></canvas>
                      </div>
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
