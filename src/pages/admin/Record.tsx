import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
  } from "@ionic/react";
  import RecordContainer from "../../components/admin/RecordContainer";

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
          <RecordContainer name="name" />
        </IonContent>
      </IonPage>
    );
  };
  
  export default Inbox;
  