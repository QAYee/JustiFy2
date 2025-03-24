import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  } from "@ionic/react";
  import ExploreContainer from "../components/ExploreContainer";
 import RegisterContainer from "../components/RegisterContainer";
    import "./Register.css";
  
  const Register: React.FC = () => {
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
              <IonTitle size="large">Tab 1</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonCard>
      
      <RegisterContainer/>
    </IonCard>
          
        </IonContent>
      </IonPage>
    );
  };
  
  export default Register;
  