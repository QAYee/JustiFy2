import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/react';

interface ContainerProps {
    name: string;
  }

const ComplainContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Barangay Complaint Form</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Complainant</IonLabel>
          <IonInput placeholder="Enter name" />
        </IonItem>
        
        <IonItem>
          <IonLabel position="stacked">Respondent</IonLabel>
          <IonInput placeholder="Enter name" />
        </IonItem>
        
        <IonItem>
          <IonLabel position="stacked">Complaint Details</IonLabel>
          <IonInput placeholder="Describe the complaint" />
        </IonItem>
        
        <IonItem>
          <IonLabel position="stacked">Date</IonLabel>
          <IonInput type="date" />
        </IonItem>
        
        <IonButton expand="full" className="ion-margin-top">Submit Complaint</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ComplainContainer;