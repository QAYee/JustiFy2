import React from 'react';
import { IonContent, IonItem, IonLabel, IonList } from '@ionic/react';

interface ContainerProps {
    name: string;
  }

const RecordContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <IonContent color="light">
      <IonList inset={true}>
        <IonItem>
          <IonLabel>Pokémon Yellow</IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>Mega Man X</IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>The Legend of Zelda</IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>Pac-Man</IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>Super Mario World</IonLabel>
        </IonItem>
      </IonList>
    </IonContent>
  );
};

export default RecordContainer;