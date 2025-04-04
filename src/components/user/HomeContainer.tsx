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
  IonAvatar,
} from "@ionic/react"
import {
  notificationsOutline,
  calendarOutline,
  megaphoneOutline,
  newspaperOutline,
  arrowForwardOutline,
  personOutline,
  timeOutline,
  alertCircleOutline,
} from "ionicons/icons"

interface ContainerProps {
  name: string
}

const HomeContainer: React.FC<ContainerProps> = ({ name }) => {
  // Dummy announcements data
  const announcements = [
    {
      id: 1,
      title: "Community Clean-up Drive",
      subtitle: "Environmental Initiative",
      date: "October 28, 2023",
      image: "https://ionicframework.com/docs/img/demos/card-media.png",
      content:
        "Join us for our monthly community clean-up drive this Saturday. Bring gloves and wear appropriate clothing. Refreshments will be provided for all volunteers.",
      important: true,
    },
    {
      id: 2,
      title: "Barangay General Assembly",
      subtitle: "Community Meeting",
      date: "November 5, 2023",
      image: "https://ionicframework.com/docs/img/demos/thumbnail.svg",
      content:
        "All residents are invited to attend the quarterly general assembly where we will discuss upcoming projects and address community concerns.",
      important: false,
    },
    {
      id: 3,
      title: "Free Medical Mission",
      subtitle: "Health Services",
      date: "November 12, 2023",
      image: "https://ionicframework.com/docs/img/demos/thumbnail.svg",
      content:
        "Free medical check-ups, dental services, and eye examinations will be available at the barangay hall from 8 AM to 3 PM.",
      important: true,
    },
  ]

  // Dummy recent activities
  const recentActivities = [
    {
      id: 1,
      type: "Complaint Filed",
      description: "Your noise complaint against Pedro Santos has been received.",
      date: "October 16, 2023",
      status: "pending",
    },
    {
      id: 2,
      type: "Status Update",
      description: "Your property dispute complaint is now being processed.",
      date: "October 14, 2023",
      status: "processing",
    },
    {
      id: 3,
      type: "Resolution",
      description: "Your utility issue complaint has been resolved.",
      date: "October 10, 2023",
      status: "resolved",
    },
  ]

  return (
    <div className="ion-padding">
      {/* Welcome Card */}
      
        <img
          alt="Barangay Hall"
          src="https://ionicframework.com/docs/img/demos/card-media.png"
          style={{ maxHeight: "200px", objectFit: "cover", width: "100%" }}
        />
        <IonCardHeader>
          <IonCardSubtitle>Welcome to</IonCardSubtitle>
          <IonCardTitle>JustiFy Community Portal</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>
            Your one-stop platform for community services, complaint management, and local updates. Stay connected with
            your barangay officials and fellow residents.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
            <IonButton fill="clear" href="/complain">
              File a Complaint
              <IonIcon slot="end" icon={arrowForwardOutline} />
            </IonButton>
            <IonButton fill="clear" href="/inbox">
              <IonIcon slot="start" icon={notificationsOutline} />
              Notifications
              <IonBadge color="danger" style={{ marginLeft: "8px" }}>
                3
              </IonBadge>
            </IonButton>
          </div>
        </IonCardContent>
      

      {/* Announcements Section */}
      <h2 style={{ margin: "24px 0 16px", fontSize: "20px", fontWeight: "600" }}>
        <IonIcon icon={megaphoneOutline} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Announcements & Events
      </h2>

      {announcements.map((announcement) => (
        <IonCard key={announcement.id}>
          <img
            alt={announcement.title}
            src={announcement.image || "/placeholder.svg"}
            style={{ maxHeight: "150px", objectFit: "cover", width: "100%" }}
          />
          <IonCardHeader>
            <IonCardSubtitle>
              {announcement.subtitle}
              {announcement.important && (
                <IonChip color="danger" outline={true} style={{ marginLeft: "8px" }}>
                  <IonIcon icon={alertCircleOutline} />
                  <IonLabel>Important</IonLabel>
                </IonChip>
              )}
            </IonCardSubtitle>
            <IonCardTitle>{announcement.title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p style={{ marginBottom: "12px" }}>{announcement.content}</p>
            <p style={{ display: "flex", alignItems: "center", color: "#666" }}>
              <IonIcon icon={calendarOutline} style={{ marginRight: "6px" }} />
              {announcement.date}
            </p>
            <IonButton fill="clear" size="small" style={{ marginTop: "8px" }}>
              Read More
              <IonIcon slot="end" icon={arrowForwardOutline} />
            </IonButton>
          </IonCardContent>
        </IonCard>
      ))}

      {/* Recent Activities Section */}
      <h2 style={{ margin: "24px 0 16px", fontSize: "20px", fontWeight: "600" }}>
        <IonIcon icon={timeOutline} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Recent Activities
      </h2>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Your Activity Feed</IonCardTitle>
        </IonCardHeader>
        <IonList>
          {recentActivities.map((activity) => (
            <IonItem key={activity.id}>
              <IonAvatar slot="start">
                <IonIcon icon={personOutline} style={{ fontSize: "24px", margin: "8px" }} />
              </IonAvatar>
              <IonLabel>
                <h2>{activity.type}</h2>
                <p>{activity.description}</p>
                <p style={{ fontSize: "12px", color: "#666" }}>{activity.date}</p>
              </IonLabel>
              {activity.status === "pending" && (
                <IonChip color="warning" outline={true}>
                  Pending
                </IonChip>
              )}
              {activity.status === "processing" && (
                <IonChip color="primary" outline={true}>
                  Processing
                </IonChip>
              )}
              {activity.status === "resolved" && (
                <IonChip color="success" outline={true}>
                  Resolved
                </IonChip>
              )}
            </IonItem>
          ))}
        </IonList>
        <IonCardContent>
          <IonButton expand="block" fill="clear">
            View All Activities
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* News Section */}
      <h2 style={{ margin: "24px 0 16px", fontSize: "20px", fontWeight: "600" }}>
        <IonIcon icon={newspaperOutline} style={{ marginRight: "8px", verticalAlign: "middle" }} />
        Community News
      </h2>

      <IonCard>
        <img
          alt="Community News"
          src="https://ionicframework.com/docs/img/demos/card-media.png"
          style={{ maxHeight: "150px", objectFit: "cover", width: "100%" }}
        />
        <IonCardHeader>
          <IonCardSubtitle>Local Development</IonCardSubtitle>
          <IonCardTitle>New Public Park Opening Next Month</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>
            The new community park will be inaugurated on November 30. The park features playground equipment, walking
            paths, and a basketball court for residents to enjoy.
          </p>
          <IonButton fill="clear" size="small" style={{ marginTop: "8px" }}>
            Read Full Story
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  )
}

export default HomeContainer

