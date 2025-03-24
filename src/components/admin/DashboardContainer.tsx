import { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAvatar,
  IonIcon,
} from "@ionic/react";
import { logOutOutline, personCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./DashboardContainer.css";

const DashboardContainer: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<{ [key: string]: any } | null>(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");

    if (!loggedInUser) {
      history.replace("/login");
      return;
    }

    try {
      let parsedUser = JSON.parse(loggedInUser);

      if (!parsedUser.admin) {
        history.replace("/user-dashboard");
        return;
      }

      // Remove 'id' and 'created_at' before setting user state
      const { id, created_at, admin, ...filteredUser } = parsedUser;
      setUser({ ...filteredUser, admin });

      // Optional: Update localStorage without 'id' & 'created_at'
      localStorage.setItem("user", JSON.stringify({ ...filteredUser, admin }));

    } catch (error) {
      console.error("Error parsing user data:", error);
      history.replace("/login");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    history.replace("/login");
  };

  return (
    <div className="container">
      <IonCard className="dashboard-card">
        <IonCardHeader className="dashboard-header">
          <IonAvatar className="dashboard-avatar">
            <IonIcon icon={personCircleOutline} size="large" />
          </IonAvatar>
          <IonCardTitle>Welcome, {user?.name || "User"}!</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {user ? (
            <div>
              {Object.entries(user).map(([key, value]) => (
                <p key={key}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
                </p>
              ))}
            </div>
          ) : (
            <p>No user data available</p>
          )}
          <IonButton expand="full" color="danger" onClick={handleLogout}>
            <IonIcon slot="start" icon={logOutOutline} />
            Logout
          </IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default DashboardContainer;
