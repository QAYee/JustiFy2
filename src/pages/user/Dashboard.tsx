import type React from "react"
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import DashboardContainer from "../../components/user/DashboardContainer"
import "./Dashboard.css"

const Dashboard: React.FC = () => {
  return (
    <IonPage>
      {/* <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">JustiFy</IonTitle>
        </IonToolbar>
      </IonHeader> */}

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>
        <DashboardContainer />
      </IonContent>

      {/* ✅ Move NavbarContainer OUTSIDE IonContent */}
    </IonPage>
  )
}

export default Dashboard

