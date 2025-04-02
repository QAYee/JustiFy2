import type React from "react"
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import MessageContainer from "../../components/admin/MessageContainer"

const Message: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">JustiFy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
         
        </IonHeader>
        <MessageContainer />
      </IonContent>
    </IonPage>
  )
}

export default Message

