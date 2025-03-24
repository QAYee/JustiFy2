import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
  } from "@ionic/react";
import InboxContainer from "../../components/user/InboxContainer";
  
  const Inbox: React.FC = () => {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle className="centered-title">JustiFy</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
            </IonToolbar>
          </IonHeader>
          <InboxContainer name="name" />
        </IonContent>
      </IonPage>
    );
  };
  
  export default Inbox;
  