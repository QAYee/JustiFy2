"use client"

import type React from "react"

import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { useIonAlert } from "@ionic/react"
import { useEffect } from "react"
import HomeContainer from "../../components/admin/HomeContainer"
const Home: React.FC = () => {
  



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
      </IonContent>
    </IonPage>
  )
}

export default Home

