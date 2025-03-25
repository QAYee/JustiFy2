import type React from "react"
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
} from "@ionic/react"
import {
  notificationsOutline,
  calendarOutline,
  arrowForwardOutline,
  statsChartOutline,
  peopleOutline,
  documentTextOutline,
} from "ionicons/icons"

interface ContainerProps {
  name: string
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
  }

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
  ]

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
  ]

  return (
    <div className="ion-padding">
      {/* Admin Dashboard Header */}
      <IonCard color="primary">
        <IonCardHeader>
          <IonCardTitle>Admin Dashboard</IonCardTitle>
          <IonCardSubtitle>Welcome to the JustiFy Admin Portal</IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <p>Manage complaints, users, and community announcements from this central dashboard.</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
            <IonButton fill="outline" color="light" href="/admin/complain">
              View Complaints
              <IonIcon slot="end" icon={arrowForwardOutline} />
            </IonButton>
            <IonButton fill="outline" color="light" href="/admin/inbox">
              <IonIcon slot="start" icon={notificationsOutline} />
              Notifications
              <IonBadge color="danger" style={{ marginLeft: "8px" }}>
                5
              </IonBadge>
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      {/* Statistics Cards */}
      <h2 style={{ margin: "24px 0 16px", fontSize: "20px", fontWeight: "600" }}>
        <IonIcon icon={statsChartOutline} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        System Statistics
      </h2>

      <IonGrid>
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Complaint Statistics</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Total Complaints</span>
                    <strong>{stats.totalComplaints}</strong>
                  </div>
                  <IonProgressBar value={1} color="primary"></IonProgressBar>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Pending</span>
                    <strong>{stats.pendingComplaints}</strong>
                  </div>
                  <IonProgressBar
                    value={stats.pendingComplaints / stats.totalComplaints}
                    color="warning"
                  ></IonProgressBar>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Processing</span>
                    <strong>{stats.processingComplaints}</strong>
                  </div>
                  <IonProgressBar
                    value={stats.processingComplaints / stats.totalComplaints}
                    color="tertiary"
                  ></IonProgressBar>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Resolved</span>
                    <strong>{stats.resolvedComplaints}</strong>
                  </div>
                  <IonProgressBar
                    value={stats.resolvedComplaints / stats.totalComplaints}
                    color="success"
                  ></IonProgressBar>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>User Statistics</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Total Users</span>
                    <strong>{stats.totalUsers}</strong>
                  </div>
                  <IonProgressBar value={1} color="primary"></IonProgressBar>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Active Users</span>
                    <strong>{stats.activeUsers}</strong>
                  </div>
                  <IonProgressBar value={stats.activeUsers / stats.totalUsers} color="success"></IonProgressBar>
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Pending Registrations</span>
                    <strong>{stats.pendingRegistrations}</strong>
                  </div>
                  <IonProgressBar
                    value={stats.pendingRegistrations / stats.totalUsers}
                    color="warning"
                  ></IonProgressBar>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* Recent Complaints */}
      <h2 style={{ margin: "24px 0 16px", fontSize: "20px", fontWeight: "600" }}>
        <IonIcon icon={documentTextOutline} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Recent Complaints
      </h2>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Latest Submissions</IonCardTitle>
        </IonCardHeader>
        <IonList>
          {recentComplaints.map((complaint) => (
            <IonItem key={complaint.id} detail={true} button>
              <IonLabel>
                <h2>
                  {complaint.type} <IonBadge color="medium">#{complaint.id}</IonBadge>
                </h2>
                <p>From: {complaint.complainant}</p>
                <p style={{ fontSize: "12px", color: "#666" }}>{complaint.date}</p>
              </IonLabel>
              {complaint.status === "pending" && (
                <IonChip color="warning" outline={true}>
                  Pending
                </IonChip>
              )}
              {complaint.status === "processing" && (
                <IonChip color="primary" outline={true}>
                  Processing
                </IonChip>
              )}
              {complaint.status === "resolved" && (
                <IonChip color="success" outline={true}>
                  Resolved
                </IonChip>
              )}
            </IonItem>
          ))}
        </IonList>
        <IonCardContent>
          <IonButton expand="block" fill="clear" href="/admin/complain">
            View All Complaints
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Upcoming Events */}
      <h2 style={{ margin: "24px 0 16px", fontSize: "20px", fontWeight: "600" }}>
        <IonIcon icon={calendarOutline} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Upcoming Events
      </h2>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Community Calendar</IonCardTitle>
        </IonCardHeader>
        <IonList>
          {upcomingEvents.map((event) => (
            <IonItem key={event.id}>
              <IonLabel>
                <h2>{event.title}</h2>
                <p>
                  <IonIcon icon={calendarOutline} style={{ verticalAlign: "middle", marginRight: "4px" }} />{" "}
                  {event.date}
                </p>
                <p>
                  <IonIcon icon={peopleOutline} style={{ verticalAlign: "middle", marginRight: "4px" }} />{" "}
                  {event.participants} participants
                </p>
              </IonLabel>
              <IonButton fill="outline" slot="end" size="small">
                Manage
              </IonButton>
            </IonItem>
          ))}
        </IonList>
        <IonCardContent>
          <IonButton expand="block" fill="clear">
            Manage Events
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  )
}

export default HomeContainer

