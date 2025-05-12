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
  IonToast,
} from "@ionic/react";
import { mailOutline, peopleOutline, flagOutline } from "ionicons/icons";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart as ChartJS, ArcElement } from "chart.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { printOutline, downloadOutline } from "ionicons/icons";

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

interface UserData {
  id: number;
  name: string;
  email: string;
  address: string;
  phone: string;
  age: number | null;
  birthdate: string | null;
  created_at: string;
  verification_code: string | null;
  verified: boolean;
  role: string;
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
    userData: UserData[];
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
    console.log(
      `Fetching statistics for year: ${year}, month: ${month || "all"}`
    );

    try {
      // Build query parameters
      const params = new URLSearchParams({ year: year.toString() });
      if (month) {
        params.append("month", month);
      }

      // Fetch complaints statistics
      console.log(
        `Fetching complaints from: https://justifi.animal911.me/Justify/index.php/StatisticsController/complaints?${params}`
      );
      const complaintResponse = await fetch(
        `https://justifi.animal911.me/Justify/index.php/StatisticsController/complaints?${params}`
      );
      const complaintData = await complaintResponse.json();
      console.log("Complaints API response:", complaintData);

      // Fetch user statistics
      console.log(
        `Fetching users from: https://justifi.animal911.me/Justify/index.php/StatisticsController/users?${params}`
      );
      const userResponse = await fetch(
        `https://justifi.animal911.me/Justify/index.php/StatisticsController/users?${params}`
      );
      const userData = await userResponse.json();
      console.log("Users API response:", userData);

      // Fetch user list data
      console.log(
        "Fetching user list from: https://justifi.animal911.me/Justify/index.php/StatisticsController/user_list"
      );
      const userListResponse = await fetch(
        `https://justifi.animal911.me/Justify/index.php/StatisticsController/user_list`
      );
      const userListData = await userListResponse.json();
      console.log("User list API response:", userListData);

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
          userData: userListData.users || [],
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
          position: isMobile ? "bottom" : ("top" as const),
          labels: {
            boxWidth: isMobile ? 12 : 20,
            padding: isMobile ? 10 : 20,
            color: chartColors.primary,
            font: {
              size: isMobile ? 10 : 14,
              weight: "bold" as const,
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

  // Add these state variables after your existing state variables
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof UserData>("role");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Generate summary PDFs for different tabs
  const generateComplaintsPDF = () => {
    if (!stats) return;

    try {
      setToastMessage("Generating Complaints PDF...");
      setShowToast(true);

      // Create PDF document
      const pdf = new jsPDF();

      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 47, 167); // #002fa7 - primary blue
      pdf.text("Complaints Statistics Summary", 105, 15, { align: "center" });

      // Add date range
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100); // gray
      const dateText = filter.month
        ? `${filter.month} ${filter.year}`
        : `${filter.year} - All Months`;
      pdf.text(`Date Range: ${dateText}`, 105, 25, { align: "center" });

      // Add total complaints
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Complaints: ${stats.complaints.total}`, 20, 40);

      // Add complaints by status
      pdf.setFontSize(14);
      pdf.text("Complaints by Status:", 20, 55);

      let yPos = 60;
      stats.complaints.byStatus.forEach((status) => {
        pdf.setFontSize(12);
        pdf.text(`• ${status.status}: ${status.count}`, 30, yPos);
        yPos += 7;
      });

      // Add complaints by type
      yPos += 5;
      pdf.setFontSize(14);
      pdf.text("Top 5 Complaint Types:", 20, yPos);
      yPos += 5;

      // Sort by count and take top 5
      const topTypes = [...stats.complaints.byType]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      topTypes.forEach((type) => {
        pdf.setFontSize(12);
        pdf.text(`• ${type.type}: ${type.count}`, 30, yPos);
        yPos += 7;
      });

      // Add monthly/daily distribution summary
      yPos += 5;
      pdf.setFontSize(14);

      if (filter.month) {
        pdf.text(`Daily Complaints in ${filter.month}:`, 20, yPos);
        yPos += 5;

        // Find highest and lowest days
        const dailyData = stats.complaints.monthly;
        if (dailyData && dailyData.length > 0) {
          const sortedData = [...dailyData].sort((a, b) => b.count - a.count);

          pdf.setFontSize(12);
          if (sortedData.length > 0) {
            pdf.text(
              `• Highest: Day ${sortedData[0].day || "N/A"} (${
                sortedData[0].count
              } complaints)`,
              30,
              yPos
            );
            yPos += 7;
          }

          if (sortedData.length > 1) {
            pdf.text(
              `• Lowest: Day ${
                sortedData[sortedData.length - 1].day || "N/A"
              } (${sortedData[sortedData.length - 1].count} complaints)`,
              30,
              yPos
            );
          }
        }
      } else {
        pdf.text("Monthly Complaints Distribution:", 20, yPos);
        yPos += 5;

        // Find highest and lowest months
        const monthlyData = stats.complaints.monthly;
        if (monthlyData && monthlyData.length > 0) {
          const sortedData = [...monthlyData].sort((a, b) => b.count - a.count);

          pdf.setFontSize(12);
          if (sortedData.length > 0) {
            pdf.text(
              `• Highest: ${sortedData[0].month} (${sortedData[0].count} complaints)`,
              30,
              yPos
            );
            yPos += 7;
          }

          if (sortedData.length > 1) {
            pdf.text(
              `• Lowest: ${sortedData[sortedData.length - 1].month} (${
                sortedData[sortedData.length - 1].count
              } complaints)`,
              30,
              yPos
            );
          }
        }
      }

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      const today = new Date();
      pdf.text(
        `Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
        105,
        280,
        { align: "center" }
      );

      // Save the PDF
      pdf.save(
        `Complaints_Summary_${filter.year}_${filter.month || "All"}.pdf`
      );

      setToastMessage("Complaints summary PDF downloaded successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error generating complaints PDF:", error);
      setToastMessage("Failed to generate PDF. Please try again.");
      setShowToast(true);
    }
  };

  const generateUserStatsPDF = () => {
    if (!stats) return;

    try {
      setToastMessage("Generating User Statistics PDF...");
      setShowToast(true);

      // Create PDF document
      const pdf = new jsPDF();

      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 47, 167); // #002fa7 - primary blue
      pdf.text("User Statistics Summary", 105, 15, { align: "center" });

      // Add date range
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100); // gray
      const dateText = filter.month
        ? `${filter.month} ${filter.year}`
        : `${filter.year} - All Months`;
      pdf.text(`Date Range: ${dateText}`, 105, 25, { align: "center" });

      // Add total users
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Users: ${stats.users.total}`, 20, 40);

      // Add users by role
      pdf.setFontSize(14);
      pdf.text("User Distribution by Role:", 20, 55);

      let yPos = 60;
      stats.users.byRole.forEach((role) => {
        pdf.setFontSize(12);
        pdf.text(`• ${role.role}: ${role.count}`, 30, yPos);
        yPos += 7;
      });

      // Add monthly/daily registration summary
      yPos += 5;
      pdf.setFontSize(14);

      if (filter.month) {
        pdf.text(`Daily User Registrations in ${filter.month}:`, 20, yPos);
        yPos += 5;

        // Find highest and lowest days
        const dailyData = stats.users.monthly;
        if (dailyData && dailyData.length > 0) {
          const sortedData = [...dailyData].sort((a, b) => b.count - a.count);

          pdf.setFontSize(12);
          if (sortedData.length > 0) {
            pdf.text(
              `• Highest: Day ${sortedData[0].day || "N/A"} (${
                sortedData[0].count
              } registrations)`,
              30,
              yPos
            );
            yPos += 7;
          }

          if (sortedData.length > 1) {
            pdf.text(
              `• Lowest: Day ${
                sortedData[sortedData.length - 1].day || "N/A"
              } (${sortedData[sortedData.length - 1].count} registrations)`,
              30,
              yPos
            );
          }
        }
      } else {
        pdf.text("Monthly User Registrations:", 20, yPos);
        yPos += 5;

        // Find highest and lowest months
        const monthlyData = stats.users.monthly;
        if (monthlyData && monthlyData.length > 0) {
          const sortedData = [...monthlyData].sort((a, b) => b.count - a.count);

          pdf.setFontSize(12);
          if (sortedData.length > 0) {
            pdf.text(
              `• Highest: ${sortedData[0].month} (${sortedData[0].count} registrations)`,
              30,
              yPos
            );
            yPos += 7;
          }

          if (sortedData.length > 1) {
            pdf.text(
              `• Lowest: ${sortedData[sortedData.length - 1].month} (${
                sortedData[sortedData.length - 1].count
              } registrations)`,
              30,
              yPos
            );
          }
        }
      }

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      const today = new Date();
      pdf.text(
        `Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
        105,
        280,
        { align: "center" }
      );

      // Save the PDF
      pdf.save(
        `User_Statistics_Summary_${filter.year}_${filter.month || "All"}.pdf`
      );

      setToastMessage("User statistics summary PDF downloaded successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error generating user statistics PDF:", error);
      setToastMessage("Failed to generate PDF. Please try again.");
      setShowToast(true);
    }
  };
  const generateUserTablePDF = () => {
    if (!stats || !stats.users.userData) return;

    try {
      setToastMessage("Generating Users Table PDF...");
      setShowToast(true);

      // Create PDF document in landscape orientation for better table viewing
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add title
      pdf.setFontSize(18);
      pdf.setTextColor(0, 47, 167); // #002fa7 - primary blue
      pdf.text("Users Table Summary", pdf.internal.pageSize.width / 2, 15, {
        align: "center",
      });

      // Add date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100); // gray
      const today = new Date();
      pdf.text(
        `Generated on: ${today.toLocaleDateString()}`,
        pdf.internal.pageSize.width / 2,
        25,
        {
          align: "center",
        }
      );

      // Filter and sort users based on current view
      const filteredSortedUsers = stats.users.userData
        .filter((user) =>
          Object.values(user)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          const aValue = a[sortField];
          const bValue = b[sortField];

          const direction = sortDirection === "asc" ? 1 : -1;

          if (typeof aValue === "boolean" && typeof bValue === "boolean") {
            return aValue === bValue ? 0 : aValue ? direction : -direction;
          }

          if (typeof aValue === "number" && typeof bValue === "number") {
            return (aValue - bValue) * direction;
          }

          const aStr = String(aValue || "");
          const bStr = String(bValue || "");

          return aStr.localeCompare(bStr) * direction;
        });

      // Add total and filtered counts
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Users: ${stats.users.userData.length}`, 15, 35);
      pdf.text(`Filtered Users: ${filteredSortedUsers.length}`, 60, 35);
      if (searchTerm) {
        pdf.text(`Search Term: "${searchTerm}"`, 105, 35);
      }
      pdf.text(`Sort by: ${String(sortField)} (${sortDirection})`, 180, 35);

      // Set up table layout
      const startY = 42;
      const cellPadding = 2;
      const pageWidth = pdf.internal.pageSize.width;
      const tableWidth = pageWidth - 30; // 15mm margins on each side

      // Define column structure (column widths should add up to tableWidth)
      const columns = [
        { header: "Name", key: "name", width: tableWidth * 0.2 },
        { header: "Email", key: "email", width: tableWidth * 0.3 },
        { header: "Phone", key: "phone", width: tableWidth * 0.15 },
        { header: "Role", key: "role", width: tableWidth * 0.1 },
        { header: "Created", key: "created_at", width: tableWidth * 0.15 },
        { header: "Verified", key: "verified", width: tableWidth * 0.1 },
      ];

      // Calculate column start positions
      const columnPositions = [];
      let currentPosition = 15; // Start from left margin
      columnPositions.push(currentPosition);

      for (let i = 0; i < columns.length; i++) {
        currentPosition += columns[i].width;
        columnPositions.push(currentPosition);
      }

      // Draw table header background
      pdf.setFillColor(242, 246, 255); // Light blue background for header
      pdf.rect(15, startY, tableWidth, 8, "F");

      // Draw table headers
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.line(15, startY, 15 + tableWidth, startY); // Top border
      pdf.line(15, startY + 8, 15 + tableWidth, startY + 8); // Bottom border

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 47, 167); // Primary blue
      pdf.setFontSize(10);

      // Draw column headers and vertical lines
      for (let i = 0; i < columns.length; i++) {
        // Draw column header text
        pdf.text(
          columns[i].header,
          columnPositions[i] + cellPadding,
          startY + 5
        );

        // Draw vertical line for this column
        pdf.line(columnPositions[i], startY, columnPositions[i], startY + 8);
      }

      // Draw final vertical line
      pdf.line(
        columnPositions[columnPositions.length - 1],
        startY,
        columnPositions[columnPositions.length - 1],
        startY + 8
      );

      // Add user data
      let yPos = startY + 8; // Start after header
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(0, 0, 0); // Black text
      pdf.setFontSize(9);

      // Process rows with pagination
      for (let i = 0; i < filteredSortedUsers.length; i++) {
        const user = filteredSortedUsers[i];
        const rowHeight = 7;

        // Add new page if needed
        if (yPos > pdf.internal.pageSize.height - 20) {
          pdf.addPage();

          // Reset position for new page
          yPos = 15;

          // Redraw header on new page
          pdf.setFillColor(242, 246, 255);
          pdf.rect(15, yPos, tableWidth, 8, "F");

          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0, 47, 167);
          pdf.setFontSize(10);

          // Draw column headers again
          for (let j = 0; j < columns.length; j++) {
            pdf.text(
              columns[j].header,
              columnPositions[j] + cellPadding,
              yPos + 5
            );

            // Draw vertical line for this column
            pdf.line(columnPositions[j], yPos, columnPositions[j], yPos + 8);
          }

          // Draw final vertical line and bottom border
          pdf.line(
            columnPositions[columnPositions.length - 1],
            yPos,
            columnPositions[columnPositions.length - 1],
            yPos + 8
          );
          pdf.line(15, yPos, 15 + tableWidth, yPos); // Top border
          pdf.line(15, yPos + 8, 15 + tableWidth, yPos + 8); // Bottom border

          yPos += 8; // Move down past header

          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
        }

        // Row background for alternating rows
        if (i % 2 === 1) {
          pdf.setFillColor(249, 250, 252);
          pdf.rect(15, yPos, tableWidth, rowHeight, "F");
        }

        // Draw cell data
        // Name
        let name = user.name || "-";
        if (name.length > 20) name = name.substring(0, 18) + "...";
        pdf.text(name, columnPositions[0] + cellPadding, yPos + 4);

        // Email
        let email = user.email || "-";
        if (email.length > 30) email = email.substring(0, 28) + "...";
        pdf.text(email, columnPositions[1] + cellPadding, yPos + 4);

        // Phone
        let phone = user.phone || "-";
        if (phone.length > 15) phone = phone.substring(0, 13) + "...";
        pdf.text(phone, columnPositions[2] + cellPadding, yPos + 4);

        // Role
        pdf.text(user.role || "-", columnPositions[3] + cellPadding, yPos + 4);

        // Created date
        let created = "-";
        if (user.created_at) {
          try {
            created = new Date(user.created_at).toLocaleDateString();
          } catch (e) {
            created = user.created_at;
          }
        }
        pdf.text(created, columnPositions[4] + cellPadding, yPos + 4);

        // Verified
        pdf.text(
          user.verified ? "Yes" : "No",
          columnPositions[5] + cellPadding,
          yPos + 4
        );

        // Draw row bottom border
        pdf.setDrawColor(230, 230, 230);
        pdf.line(15, yPos + rowHeight, 15 + tableWidth, yPos + rowHeight);

        // Draw vertical borders for each column
        for (let j = 0; j < columnPositions.length; j++) {
          pdf.line(
            columnPositions[j],
            yPos,
            columnPositions[j],
            yPos + rowHeight
          );
        }

        yPos += rowHeight; // Move to next row
      }

      // Add footer with record count
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Report generated by Justify Admin Panel | ${today.toLocaleString()}`,
        pdf.internal.pageSize.width / 2,
        pdf.internal.pageSize.height - 10,
        { align: "center" }
      );

      // Save the PDF
      pdf.save(
        `Users_Table_Report_${filter.year}_${filter.month || "All"}.pdf`
      );

      setToastMessage("Users table summary PDF downloaded successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error generating users table PDF:", error);
      setToastMessage("Failed to generate PDF. Please try again.");
      setShowToast(true);
    }
  };

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
            <IonLabel>User Stats</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="usersTable">
            <IonLabel>Users Table</IonLabel>
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
                <IonRow>
                  <IonCol size="12" className="ion-text-end">
                    <IonButton
                      fill="outline"
                      className="stats-outline-button"
                      onClick={generateComplaintsPDF}
                    >
                      Download Complaints PDF
                    </IonButton>
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
                <IonRow>
                  <IonCol size="12" className="ion-text-end">
                    <IonButton
                      fill="outline"
                      className="stats-outline-button"
                      onClick={generateUserStatsPDF}
                    >
                      Download User Stats PDF
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}

            {activeTab === "usersTable" && stats && (
              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <div
                      className="user-table-container"
                      style={{
                        backgroundColor: "white",
                        borderRadius: "10px",
                        padding: "16px",
                        boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                      }}
                    >
                      <div
                        className="search-and-filter"
                        style={{ marginBottom: "16px" }}
                      >
                        <IonLabel
                          position="stacked"
                          style={{ color: "#002fa7", fontWeight: "bold" }}
                        >
                          Search Users
                        </IonLabel>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search by name, email, address..."
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "0.9rem",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05) inset",
                            backgroundColor: "white",
                          }}
                        />
                      </div>

                      <div
                        className="table-responsive"
                        style={{ overflowX: "auto" }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.9rem",
                            minWidth: "900px", // Ensures horizontal scrolling on small screens
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#f5f7ff" }}>
                              <th
                                style={{
                                  padding: "12px 8px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #e0e0e0",
                                  color: "#002fa7",
                                  cursor: "pointer",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  backgroundColor: "#f5f7ff",
                                }}
                                onClick={() => {
                                  if (sortField === "name") {
                                    setSortDirection(
                                      sortDirection === "asc" ? "desc" : "asc"
                                    );
                                  } else {
                                    setSortField("name");
                                    setSortDirection("asc");
                                  }
                                }}
                              >
                                Name{" "}
                                {sortField === "name" &&
                                  (sortDirection === "asc" ? "▲" : "▼")}
                              </th>
                              <th
                                style={{
                                  padding: "12px 8px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #e0e0e0",
                                  color: "#002fa7",
                                  cursor: "pointer",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  backgroundColor: "#f5f7ff",
                                }}
                                onClick={() => {
                                  if (sortField === "age") {
                                    setSortDirection(
                                      sortDirection === "asc" ? "desc" : "asc"
                                    );
                                  } else {
                                    setSortField("age");
                                    setSortDirection("asc");
                                  }
                                }}
                              >
                                Age{" "}
                                {sortField === "age" &&
                                  (sortDirection === "asc" ? "▲" : "▼")}
                              </th>
                              <th
                                style={{
                                  padding: "12px 8px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #e0e0e0",
                                  color: "#002fa7",
                                  cursor: "pointer",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  backgroundColor: "#f5f7ff",
                                }}
                                onClick={() => {
                                  if (sortField === "email") {
                                    setSortDirection(
                                      sortDirection === "asc" ? "desc" : "asc"
                                    );
                                  } else {
                                    setSortField("email");
                                    setSortDirection("asc");
                                  }
                                }}
                              >
                                Email{" "}
                                {sortField === "email" &&
                                  (sortDirection === "asc" ? "▲" : "▼")}
                              </th>
                              <th
                                style={{
                                  padding: "12px 8px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #e0e0e0",
                                  color: "#002fa7",
                                  cursor: "pointer",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  backgroundColor: "#f5f7ff",
                                }}
                                onClick={() => {
                                  if (sortField === "address") {
                                    setSortDirection(
                                      sortDirection === "asc" ? "desc" : "asc"
                                    );
                                  } else {
                                    setSortField("address");
                                    setSortDirection("asc");
                                  }
                                }}
                              >
                                Address{" "}
                                {sortField === "address" &&
                                  (sortDirection === "asc" ? "▲" : "▼")}
                              </th>
                              <th
                                style={{
                                  padding: "12px 8px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #e0e0e0",
                                  color: "#002fa7",
                                  cursor: "pointer",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  backgroundColor: "#f5f7ff",
                                }}
                                onClick={() => {
                                  if (sortField === "phone") {
                                    setSortDirection(
                                      sortDirection === "asc" ? "desc" : "asc"
                                    );
                                  } else {
                                    setSortField("phone");
                                    setSortDirection("asc");
                                  }
                                }}
                              >
                                Phone{" "}
                                {sortField === "phone" &&
                                  (sortDirection === "asc" ? "▲" : "▼")}
                              </th>
                              <th
                                style={{
                                  padding: "12px 8px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #e0e0e0",
                                  color: "#002fa7",
                                  cursor: "pointer",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  backgroundColor: "#f5f7ff",
                                }}
                                onClick={() => {
                                  if (sortField === "created_at") {
                                    setSortDirection(
                                      sortDirection === "asc" ? "desc" : "asc"
                                    );
                                  } else {
                                    setSortField("created_at");
                                    setSortDirection("desc");
                                  }
                                }}
                              >
                                Registration Date{" "}
                                {sortField === "created_at" &&
                                  (sortDirection === "asc" ? "▲" : "▼")}
                              </th>
                              <th
                                style={{
                                  padding: "12px 8px",
                                  textAlign: "left",
                                  borderBottom: "2px solid #e0e0e0",
                                  color: "#002fa7",
                                  cursor: "pointer",
                                  position: "sticky",
                                  top: 0,
                                  zIndex: 1,
                                  backgroundColor: "#f5f7ff",
                                }}
                                onClick={() => {
                                  if (sortField === "verified") {
                                    setSortDirection(
                                      sortDirection === "asc" ? "desc" : "asc"
                                    );
                                  } else {
                                    setSortField("verified");
                                    setSortDirection("asc");
                                  }
                                }}
                              >
                                Verified{" "}
                                {sortField === "verified" &&
                                  (sortDirection === "asc" ? "▲" : "▼")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.users.userData &&
                              stats.users.userData
                                .filter((user) =>
                                  Object.values(user)
                                    .join(" ")
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                                )
                                .sort((a, b) => {
                                  const aValue = a[sortField];
                                  const bValue = b[sortField];

                                  if (sortField === "created_at") {
                                    return sortDirection === "asc"
                                      ? new Date(aValue as string).getTime() -
                                          new Date(bValue as string).getTime()
                                      : new Date(bValue as string).getTime() -
                                          new Date(aValue as string).getTime();
                                  }

                                  if (
                                    typeof aValue === "boolean" &&
                                    typeof bValue === "boolean"
                                  ) {
                                    return sortDirection === "asc"
                                      ? aValue === bValue
                                        ? 0
                                        : aValue
                                        ? 1
                                        : -1
                                      : aValue === bValue
                                      ? 0
                                      : aValue
                                      ? -1
                                      : 1;
                                  }

                                  if (
                                    typeof aValue === "number" &&
                                    typeof bValue === "number"
                                  ) {
                                    return sortDirection === "asc"
                                      ? aValue - bValue
                                      : bValue - aValue;
                                  }

                                  if (
                                    typeof aValue === "string" &&
                                    typeof bValue === "string"
                                  ) {
                                    return sortDirection === "asc"
                                      ? aValue.localeCompare(bValue)
                                      : bValue.localeCompare(aValue);
                                  }

                                  return 0;
                                })
                                .map((user) => (
                                  <tr
                                    key={user.id}
                                    style={{
                                      borderBottom: "1px solid #f0f0f0",
                                      backgroundColor: "white",
                                      transition: "background-color 0.2s",
                                    }}
                                    onMouseOver={(e) =>
                                      ((
                                        e.currentTarget as HTMLTableRowElement
                                      ).style.backgroundColor = "#f9f9ff")
                                    }
                                    onMouseOut={(e) =>
                                      ((
                                        e.currentTarget as HTMLTableRowElement
                                      ).style.backgroundColor = "white")
                                    }
                                  >
                                    <td style={{ padding: "12px 8px" }}>
                                      {user.name}
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                      {user.age || "-"}
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                      {user.email}
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                      {user.address || "-"}
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                      {user.phone || "-"}
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                      {new Date(
                                        user.created_at
                                      ).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "12px 8px" }}>
                                      <span
                                        style={{
                                          padding: "3px 8px",
                                          borderRadius: "12px",
                                          fontSize: "0.8rem",
                                          fontWeight: 500,
                                          backgroundColor: user.verified
                                            ? "rgba(46, 213, 115, 0.15)"
                                            : "rgba(255, 71, 87, 0.15)",
                                          color: user.verified
                                            ? "#2ecc71"
                                            : "#ff4757",
                                        }}
                                      >
                                        {user.verified ? "Yes" : "No"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                          </tbody>
                        </table>

                        {stats.users.userData &&
                          stats.users.userData.filter((user) =>
                            Object.values(user)
                              .join(" ")
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          ).length === 0 && (
                            <div
                              style={{
                                padding: "30px 0",
                                textAlign: "center",
                                color: "#666",
                              }}
                            >
                              No users found matching your search criteria.
                            </div>
                          )}
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          fontSize: "0.9rem",
                          color: "#666",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <strong>Total Records:</strong>{" "}
                          {stats.users.userData
                            ? stats.users.userData.length
                            : 0}
                        </div>
                        <div>
                          <strong>Filtered Records:</strong>{" "}
                          {stats.users.userData
                            ? stats.users.userData.filter((user) =>
                                Object.values(user)
                                  .join(" ")
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase())
                              ).length
                            : 0}
                        </div>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" className="ion-text-end">
                    <IonButton
                      fill="outline"
                      className="stats-outline-button"
                      onClick={generateUserTablePDF}
                    >
                      Download Users Table PDF
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            )}
          </>
        )}
      </IonCardContent>
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
      />
    </>
  );
};

export default StatisticsContainer;
