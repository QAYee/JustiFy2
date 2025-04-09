import { useState, useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonSpinner,
} from "@ionic/react";
import {
  notificationsOutline,
  calendarOutline,
  arrowForwardOutline,
  statsChartOutline,
  peopleOutline,
  documentTextOutline,
  locationOutline,
  alertCircleOutline,
} from "ionicons/icons";

interface ContainerProps {
  name: string;
}

interface Complaint {
  name: string;
  complaint_type: string;
  id: number;
  complainant: string;
  respondent: string;
  details: string;
  incident_date: string;
  status:
    | "New"
    | "Under review"
    | "In progress"
    | "Resolved"
    | "Closed"
    | "Rejected";
  type: string;
  user_id: number;
  created_at: string;
  image?: string;
}

const HomeContainer: React.FC<ContainerProps> = ({ name }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dummy statistics data
  const stats = {
    totalComplaints: 24,
    pendingComplaints: 8,
    processingComplaints: 10,
    resolvedComplaints: 6,
    totalUsers: 42,
    activeUsers: 35,
    pendingRegistrations: 3,
  };

  // Dummy upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: "Community Clean-up Drive",
      date: "October 28, 2023",
      location: "Barangay Plaza",
      participants: 15,
    },
    {
      id: 2,
      title: "Barangay General Assembly",
      date: "November 5, 2023",
      location: "Barangay Hall",
      participants: 30,
    },
  ];

  // Define consistent styles
  const sectionHeaderStyle = {
    margin: "32px 0 16px",
    fontSize: "22px",
    fontWeight: "600",
    color: "#333",
    display: "flex",
    alignItems: "center",
  };

  const iconStyle = {
    marginRight: "10px",
    fontSize: "24px",
    color: "#3880ff",
  };

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://ivory-swallow-404351.hostingersite.com/Justify/index.php/ComplaintController/getAllComplaints`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      } else {
        setComplaints([]);
        setError(data.message || "No complaints found");
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch complaints"
      );
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Get only the most recent 3 complaints
  const recentComplaints = complaints.slice(0, 3);

  // Helper function to determine chip color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "New":
        return "warning";
      case "Under review":
      case "In progress":
        return "primary";
      case "Resolved":
        return "success";
      case "Closed":
        return "medium";
      case "Rejected":
        return "danger";
      default:
        return "medium";
    }
  };

  return (
    <div className="ion-padding">
      {/* Admin Dashboard Header */}
      <div className="ion-text-center" style={{ margin: "0 auto", maxWidth: "800px" }}>
        <IonCard
          className="ion-no-margin"
          color="primary"
          style={{ borderRadius: "12px", marginBottom: "24px", width: "100%" }}
        >
          <IonCardHeader>
        <IonCardTitle style={{ fontSize: "24px", fontWeight: "700" }}>
          Admin Dashboard
        </IonCardTitle>
        <IonCardSubtitle style={{ fontSize: "16px", marginTop: "4px" }}>
          Welcome to the JustiFy Admin Portal
        </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
        <p style={{ marginBottom: "20px", fontSize: "15px" }}>
          Manage complaints, users, and community announcements from this
          central dashboard.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <IonButton
            fill="solid"
            color="light"
            href="/admin/complain"
            style={{ fontWeight: "500" }}
          >
            View Complaints
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
          <IonButton
            fill="solid"
            color="light"
            href="/admin/inbox"
            style={{ fontWeight: "500" }}
          >
            <IonIcon slot="start" icon={notificationsOutline} />
            Notifications
            <IonBadge
          color="danger"
          style={{
            marginLeft: "8px",
            borderRadius: "10px",
            padding: "4px 8px",
          }}
            >
          5
            </IonBadge>
          </IonButton>
        </div>
          </IonCardContent>
        </IonCard>
      </div>

  

      {/* Recent Complaints */}
      <h2 style={sectionHeaderStyle}>
        <IonIcon icon={documentTextOutline} style={iconStyle} />
        Recent Complaints
      </h2>

      <IonCard
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <IonCardHeader>
          <IonCardTitle style={{ fontSize: "18px", color: "#ffffff" }}>
            Latest Submissions
          </IonCardTitle>
        </IonCardHeader>

        {loading ? (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <IonSpinner name="crescent" />
            <p style={{ marginTop: "10px", color: "#666" }}>
              Loading complaints...
            </p>
          </div>
        ) : error ? (
          <div
            style={{ padding: "20px", textAlign: "center", color: "#eb445a" }}
          >
            <IonIcon icon={alertCircleOutline} style={{ fontSize: "32px" }} />
            <p style={{ marginTop: "10px" }}>{error}</p>
          </div>
        ) : recentComplaints.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>No complaints found</p>
          </div>
        ) : (
          <IonList style={{ margin: "0 -16px" }}>
            {recentComplaints.map((complaint) => (
              <IonItem
                key={complaint.id}
                detail={true}
                button
                style={{ "--padding-start": "16px", "--padding-end": "16px" }}
              >
                <IonLabel>
                  <h2
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    {complaint.complaint_type}
                    <IonBadge
                      color="medium"
                      style={{ marginLeft: "8px", fontSize: "12px" }}
                    >
                      #{complaint.id}
                    </IonBadge>
                  </h2>
                  <p style={{ fontSize: "14px", marginBottom: "2px" }}>
                    From: {complaint.complainant}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "4px",
                    }}
                  >
                    {new Date(complaint.created_at).toLocaleDateString()} -{" "}
                    {complaint.incident_date}
                  </p>
                </IonLabel>
                <IonChip
                  color={getStatusColor(complaint.status)}
                  outline={true}
                  style={{ fontWeight: "500" }}
                >
                  {complaint.status}
                </IonChip>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonCardContent>
          <IonButton
            expand="block"
            fill="outline"
            href="/admin/complain"
            style={{ marginTop: "8px", fontWeight: "500", color: "#3880ff" }}
          >
            View All Complaints
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Upcoming Events */}
      <h2 style={sectionHeaderStyle}>
        <IonIcon icon={calendarOutline} style={iconStyle} />
        Upcoming Events
      </h2>

      <IonCard
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          marginBottom: "24px",
        }}
      >
        <IonCardHeader>
          <IonCardTitle style={{ fontSize: "18px", color: "#ffffff" }}>
            Community Calendar
          </IonCardTitle>
        </IonCardHeader>
        <IonList style={{ margin: "0 -16px" }}>
          {upcomingEvents.map((event) => (
            <IonItem
              key={event.id}
              style={{ "--padding-start": "16px", "--padding-end": "16px" }}
            >
              <IonLabel>
                <h2
                  style={{
                    fontWeight: "600",
                    fontSize: "16px",
                    marginBottom: "6px",
                  }}
                >
                  {event.title}
                </h2>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  <IonIcon
                    icon={calendarOutline}
                    style={{ marginRight: "6px", color: "#666" }}
                  />
                  {event.date}
                </p>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    marginBottom: "4px",
                  }}
                >
                  <IonIcon
                    icon={locationOutline}
                    style={{ marginRight: "6px", color: "#666" }}
                  />
                  {event.location}
                </p>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                  }}
                >
                  <IonIcon
                    icon={peopleOutline}
                    style={{ marginRight: "6px", color: "#666" }}
                  />
                  {event.participants} participants
                </p>
              </IonLabel>
              <IonButton
                fill="outline"
                slot="end"
                size="small"
                style={{ fontWeight: "500" , color: "#3880ff"}}
              >
                Manage
              </IonButton>
            </IonItem>
          ))}
        </IonList>
        <IonCardContent>
          <IonButton
            expand="block"
            fill="outline"
            style={{ marginTop: "8px", fontWeight: "500" , color: "#3880ff" }}
          >
            Manage Events
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default HomeContainer;
