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
    monthly: { month: string; count: number }[];
    byRole: { role: string; count: number }[];
  };
}

interface DateFilter {
  year: number;
  month: string | null;
}

// Map numeric complaint types to readable names
const complaintTypeMap: { [key: number]: string } = {
  1: "Noise Complaint",
  2: "Property Dispute",
  3: "Public Disturbance",
  4: "Maintenance Issue",
  5: "Other",
};

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
        `http://127.0.0.1/justify/index.php/StatisticsController/complaints?${params}`
      );
      const complaintData = await complaintResponse.json();

      // Fetch user statistics
      const userResponse = await fetch(`http://127.0.0.1/justify/index.php/StatisticsController/users?${params}`);
      const userData = await userResponse.json();

      // Check if the responses were successful based on the status flag in response
      if (!complaintData.status || !userData.status) {
        throw new Error("API returned error status");
      }

      setStats({
        complaints: {
          total: complaintData.total || 0,
          monthly: complaintData.monthly || [],
          byStatus: complaintData.byStatus || [],
          byType: complaintData.byType || [],
        },
        users: {
          total: userData.total || 0,
          monthly: userData.monthly || [],
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
        chartInstances.current.complaints = new Chart(ctx, {
          type: "line",
          data: {
            labels: stats.complaints.monthly.map((item) => item.month),
            datasets: [
              {
                label: "Complaints per Month",
                data: stats.complaints.monthly.map((item) => item.count),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
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
              },
              title: {
                display: true,
                text: `Monthly Complaints ${filter.year}${
                  filter.month ? " - " + filter.month : ""
                }`,
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
        chartInstances.current.complaintsStatus = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: stats.complaints.byStatus.map((item) => item.status),
            datasets: [
              {
                label: "Complaints by Status",
                data: stats.complaints.byStatus.map((item) => item.count),
                backgroundColor: [
                  "rgba(255, 206, 86, 0.6)", // New - yellow
                  "rgba(54, 162, 235, 0.6)", // Under review - blue
                  "rgba(153, 102, 255, 0.6)", // In progress - purple
                  "rgba(75, 192, 192, 0.6)", // Resolved - green
                  "rgba(201, 203, 207, 0.6)", // Closed - grey
                  "rgba(255, 99, 132, 0.6)", // Rejected - red
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Complaints by Status",
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
        chartInstances.current.complaintsType = new Chart(ctx, {
          type: "bar",
          data: {
            labels: stats.complaints.byType.map((item) => item.type),
            datasets: [
              {
                label: "Complaints by Type",
                data: stats.complaints.byType.map((item) => item.count),
                backgroundColor: "rgba(153, 102, 255, 0.6)",
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "top",
              },
              title: {
                display: true,
                text: "Complaints by Type",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0, // Only show whole numbers
                },
              },
            },
          },
        });
      }
    }

    // Create user registrations chart
    if (usersChartRef.current) {
      const ctx = usersChartRef.current.getContext("2d");
      if (ctx) {
        chartInstances.current.users = new Chart(ctx, {
          type: "line",
          data: {
            labels: stats.users.monthly.map((item) => item.month),
            datasets: [
              {
                label: "User Registrations per Month",
                data: stats.users.monthly.map((item) => item.count),
                borderColor: "rgb(153, 102, 255)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
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
              },
              title: {
                display: true,
                text: `Monthly User Registrations ${filter.year}${
                  filter.month ? " - " + filter.month : ""
                }`,
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
              },
              title: {
                display: true,
                text: "Users by Role",
              },
            },
          },
        });
      }
    }
  }, [stats, loading, activeTab, filter]);

  return (
    <>
      <IonCardHeader>
        <IonCardTitle>{name}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {/* Date filtering controls */}
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonItem>
                <IonLabel>Year</IonLabel>
                <IonSelect
                  value={filter.year}
                  onIonChange={(e) => handleYearChange(e.detail.value)}
                  interface="popover"
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
              <IonItem>
                <IonLabel>Month</IonLabel>
                <IonSelect
                  value={filter.month}
                  onIonChange={(e) => handleMonthChange(e.detail.value)}
                  interface="popover"
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
              <IonButton fill="outline" onClick={handleResetFilters}>
                Reset Filters
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as string)}
        >
          <IonSegmentButton value="complaints">
            <IonLabel>Complaints</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="users">
            <IonLabel>Users</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="circular" />
            <p>Loading statistics...</p>
          </div>
        ) : (
          <>
            {activeTab === "complaints" && stats && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <div className="stats-header ion-text-center">
                      <h2>
                        Total Complaints: {stats.complaints.total}
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
                    <div className="canvas-container">
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
                    <div className="stats-header ion-text-center">
                      <h2>
                        Total Users: {stats.users.total}
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
