import type React from "react";
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
} from "@ionic/react";
import {
  notificationsOutline,
  calendarOutline,
  arrowForwardOutline,
  statsChartOutline,
  peopleOutline,
  documentTextOutline,
  locationOutline,
} from "ionicons/icons";

interface ContainerProps {
  name: string;
}

const HomeContainer: React.FC<ContainerProps> = ({ name }) => {
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

  // Dummy recent complaints
  const recentComplaints = [
    {
      id: 1001,
      complainant: "Juan Dela Cruz",
      type: "Noise Complaint",
      date: "October 16, 2023",
      status: "pending",
    },
    {
      id: 1002,
      complainant: "Maria Garcia",
      type: "Utility Issue",
      date: "October 12, 2023",
      status: "processing",
    },
    {
      id: 1003,
      complainant: "Roberto Reyes",
      type: "Environmental Concern",
      date: "October 8, 2023",
      status: "resolved",
    },
  ];

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

  return (
    <div className="ion-padding">
      {/* Admin Dashboard Header */}
      <IonCard
        className="ion-no-margin"
        color="primary"
        style={{ borderRadius: "12px", marginBottom: "24px" }}
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
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <IonButton
              fill="solid"
              color="light"
              href="/admin/complain"
              style={{ fontWeight: "500" }}
              expand="block"
            >
              View Complaints
              <IonIcon slot="end" icon={arrowForwardOutline} />
            </IonButton>
            <IonButton
              fill="solid"
              color="light"
              href="/admin/inbox"
              style={{ fontWeight: "500" }}
              expand="block"
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

      {/* Statistics Cards */}
      <h2 style={sectionHeaderStyle}>
        <IonIcon icon={statsChartOutline} style={iconStyle} />
        System Statistics
      </h2>

      <IonGrid className="ion-no-padding">
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: "18px", color: "#333" }}>
                  Complaint Statistics
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>Total Complaints</span>
                    <strong style={{ fontSize: "18px" }}>
                      {stats.totalComplaints}
                    </strong>
                  </div>
                  <IonProgressBar
                    value={1}
                    color="primary"
                    style={{ height: "8px", borderRadius: "4px" }}
                  ></IonProgressBar>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>Pending</span>
                    <strong style={{ fontSize: "18px" }}>
                      {stats.pendingComplaints}
                    </strong>
                  </div>
                  <IonProgressBar
                    value={stats.pendingComplaints / stats.totalComplaints}
                    color="warning"
                    style={{ height: "8px", borderRadius: "4px" }}
                  ></IonProgressBar>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>Processing</span>
                    <strong style={{ fontSize: "18px" }}>
                      {stats.processingComplaints}
                    </strong>
                  </div>
                  <IonProgressBar
                    value={stats.processingComplaints / stats.totalComplaints}
                    color="tertiary"
                    style={{ height: "8px", borderRadius: "4px" }}
                  ></IonProgressBar>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>Resolved</span>
                    <strong style={{ fontSize: "18px" }}>
                      {stats.resolvedComplaints}
                    </strong>
                  </div>
                  <IonProgressBar
                    value={stats.resolvedComplaints / stats.totalComplaints}
                    color="success"
                    style={{ height: "8px", borderRadius: "4px" }}
                  ></IonProgressBar>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="6">
            <IonCard
              style={{
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
            >
              <IonCardHeader>
                <IonCardTitle style={{ fontSize: "18px", color: "#333" }}>
                  User Statistics
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>Total Users</span>
                    <strong style={{ fontSize: "18px" }}>
                      {stats.totalUsers}
                    </strong>
                  </div>
                  <IonProgressBar
                    value={1}
                    color="primary"
                    style={{ height: "8px", borderRadius: "4px" }}
                  ></IonProgressBar>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>Active Users</span>
                    <strong style={{ fontSize: "18px" }}>
                      {stats.activeUsers}
                    </strong>
                  </div>
                  <IonProgressBar
                    value={stats.activeUsers / stats.totalUsers}
                    color="success"
                    style={{ height: "8px", borderRadius: "4px" }}
                  ></IonProgressBar>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "15px" }}>
                      Pending Registrations
                    </span>
                    <strong style={{ fontSize: "18px" }}>
                      {stats.pendingRegistrations}
                    </strong>
                  </div>
                  <IonProgressBar
                    value={stats.pendingRegistrations / stats.totalUsers}
                    color="warning"
                    style={{ height: "8px", borderRadius: "4px" }}
                  ></IonProgressBar>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

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
                  {complaint.type}
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
                  style={{ fontSize: "12px", color: "#fffff", marginTop: "4px" }}
                >
                  {complaint.date}
                </p>
              </IonLabel>
              {complaint.status === "pending" && (
                <IonChip
                  color="warning"
                  outline={true}
                  style={{ fontWeight: "500" }}
                >
                  Pending
                </IonChip>
              )}
              {complaint.status === "processing" && (
                <IonChip
                  color="primary"
                  outline={true}
                  style={{ fontWeight: "500" }}
                >
                  Processing
                </IonChip>
              )}
              {complaint.status === "resolved" && (
                <IonChip
                  color="success"
                  outline={true}
                  style={{ fontWeight: "500" }}
                >
                  Resolved
                </IonChip>
              )}
            </IonItem>
          ))}
        </IonList>
        <IonCardContent>
          <IonButton
            expand="block"
            fill="outline"
            href="/admin/complain"
            style={{ marginTop: "8px", fontWeight: "500" , color: "blue" }}
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
                style={{ fontWeight: "500", color: "blue" }}
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
            style={{ marginTop: "8px", fontWeight: "500", color: "blue" }}
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
