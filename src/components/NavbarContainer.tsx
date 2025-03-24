import { IonTabs, IonTabBar, IonTabButton, IonLabel, IonIcon } from "@ionic/react";
import { chatboxOutline, ticketOutline, personOutline, mailOutline, documentTextOutline } from "ionicons/icons";
import "./NavbarContainer.css";

const NavbarContainer: React.FC = () => {
  return (
    <IonTabs>
      <IonTabBar slot="bottom" className="footer-tab-bar">
        <IonTabButton tab="complains" href="/home">
          <IonIcon icon={chatboxOutline} />
          <IonLabel>Complains</IonLabel>
        </IonTabButton>

        <IonTabButton tab="ticket" href="/ticket">
          <IonIcon icon={ticketOutline} />
          <IonLabel>Ticket</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profile</IonLabel>
        </IonTabButton>

        <IonTabButton tab="inbox" href="/inbox">
          <IonIcon icon={mailOutline} />
          <IonLabel>Inbox</IonLabel>
        </IonTabButton>

        <IonTabButton tab="records" href="/records">
          <IonIcon icon={documentTextOutline} />
          <IonLabel>Records</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default NavbarContainer;
