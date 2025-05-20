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
  IonAvatar,
} from "@ionic/react";
import {
  notificationsOutline,
  calendarOutline,
  megaphoneOutline,
  newspaperOutline,
  arrowForwardOutline,
  personOutline,
  timeOutline,
  alertCircleOutline,
} from "ionicons/icons";
import "./HomeContainer.css";

interface ContainerProps {
  name: string;
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
  ];

  // Dummy recent activities
  const recentActivities = [
    {
      id: 1,
      type: "Complaint Filed",
      description:
        "Your noise complaint against Pedro Santos has been received.",
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
  ];

  return (
    <div className="home-container">
      {/* Welcome Card */}
      

      {/* Announcements Section */}
      <h2 className="section-header">
        <IonIcon icon={megaphoneOutline} />
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
                <IonChip
                  color="danger"
                  outline={true}
                  style={{ marginLeft: "8px" }}
                >
                  <IonIcon icon={alertCircleOutline} />
                  <IonLabel>Important</IonLabel>
                </IonChip>
              )}
            </IonCardSubtitle>
            <IonCardTitle>{announcement.title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p style={{ marginBottom: "12px" }}>{announcement.content}</p>
            <p className="date-text">
              <IonIcon icon={calendarOutline} />
              {announcement.date}
            </p>
            <IonButton fill="clear" size="small" style={{ marginTop: "8px" }}>
              Read More
              <IonIcon slot="end" icon={arrowForwardOutline} />
            </IonButton>
          </IonCardContent>
        </IonCard>
      ))}

    
   <h2 className="section-header">
        <IonIcon icon={megaphoneOutline} />
        File a Complaint
      </h2>


<IonCard style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', margin: '16px auto', maxWidth: '800px' }}>
        <div style={{ position: 'relative' }}>
          <img
        alt="Barangay Hall"
        src="https://ionicframework.com/docs/img/demos/card-media.png"
        style={{ maxHeight: "200px", objectFit: "cover", width: "100%" }}
          />
          <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.7))',
        zIndex: 1 
          }}></div>
        </div>
        <IonCardHeader style={{ paddingTop: '16px', background: '#ffffff', textAlign: 'center' }}>
          <IonCardSubtitle style={{ color: '#666666', fontWeight: 500, fontSize: '14px' }}>Welcome to</IonCardSubtitle>
          <IonCardTitle style={{ color: '#263238', fontWeight: 700, fontSize: '24px' }}>JustiFi Community Portal</IonCardTitle>
        </IonCardHeader>
        <IonCardContent style={{ background: '#ffffff', paddingTop: '0', textAlign: 'center' }}>
          <p style={{ color: '#546e7a', lineHeight: '1.5', marginBottom: '20px' }}>
        Your one-stop platform for community services, complaint management,
        and local updates. Stay connected with your barangay officials and
        fellow residents.
          </p>
          <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "16px",
          flexWrap: "wrap",
          gap: "16px"
        }}
          >
        <IonButton fill="clear" href="/complain" style={{ color: '#1976d2' }}>
          File a Complaint
          <IonIcon slot="end" icon={arrowForwardOutline} />
        </IonButton>
        <IonButton fill="clear" href="/inbox" style={{ color: '#1976d2' }}>
          <IonIcon slot="start" icon={notificationsOutline} />
          Notifications
        </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
     

      {/* News Section */}
      <h2 className="section-header">
        <IonIcon icon={newspaperOutline} />
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
            The new community park will be inaugurated on November 30. The park
            features playground equipment, walking paths, and a basketball court
            for residents to enjoy.
          </p>
          <IonButton fill="clear" size="small" style={{ marginTop: "8px" }}>
            Read Full Story
            <IonIcon slot="end" icon={arrowForwardOutline} />
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Call to action */}
      <IonCard>
        <IonCardContent>
          <h2 style={{ color: "var(--primary-color)", marginTop: 0 }}>
            Get Involved in Your Community
          </h2>
          <p>
            Participate in upcoming events and help make our community better.
          </p>
          <IonButton className="secondary-button" expand="block">
            Volunteer Opportunities
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default HomeContainer;
