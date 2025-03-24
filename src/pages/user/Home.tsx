import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useIonAlert } from "@ionic/react";
import { useEffect } from "react";
import HomeContainer from "../../components/user/HomeContainer";
const Home: React.FC = () => {
  const [presentAlert] = useIonAlert();

  useEffect(() => {
    presentAlert({
      header: "NEWS & ANNOUNCEMENTS",
      message: "nagawa palang ako tangina mo",
      buttons: ["Exit"],
      htmlAttributes: {
        "aria-label": "alert dialog",
      },
    });
  }, [presentAlert]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">JustiFy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar></IonToolbar>
        </IonHeader>
        <HomeContainer name="Home" />
        <HomeContainer name="Home" />
        <HomeContainer name="Home" />
      </IonContent>
    </IonPage>
  );
};

export default Home;
