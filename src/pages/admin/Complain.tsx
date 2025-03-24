import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
  } from "@ionic/react";
 import ComplainContainer from "../../components/admin/ComplainContainer";
  
  const Complain: React.FC = () => {
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
          <ComplainContainer name="Complain" />
        </IonContent>
      </IonPage>
    );
  };
  
  export default Complain;
  