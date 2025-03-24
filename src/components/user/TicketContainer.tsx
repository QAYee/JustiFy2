import React from 'react';
import { IonContent, IonItem, IonLabel, IonList, IonInput, IonButton, IonPage, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

interface ContainerProps {
    name: string;
  }

const TicketContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Barangay Complaint Form</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" color="light">
        <IonList inset={true}>
          <IonItem>
            <IonLabel>Complainant</IonLabel>
            
            <IonButton slot="end">View</IonButton>
          </IonItem>
          
          <IonItem>
            <IonLabel>Respondent</IonLabel>
            
            <IonButton slot="end">View</IonButton>
          </IonItem>
          
          <IonItem>
            <IonLabel>Complaint Details</IonLabel>
            <IonButton slot="end">View</IonButton>
          </IonItem>
          
          <IonItem>
            <IonLabel>Date</IonLabel>
            <IonButton slot="end">View</IonButton>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default TicketContainer;