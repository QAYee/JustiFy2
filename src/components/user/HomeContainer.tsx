import React from 'react';
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from '@ionic/react';


interface ContainerProps {
  name: string;
}

const HomeContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <IonCard>
    <img alt="Mt. Pinatubo" src="https://ionicframework.com/docs/img/demos/card-media.png" />
    <IonCardHeader>
      <IonCardTitle>HEV ABI</IonCardTitle>
      <IonCardSubtitle>QC GIRLS</IonCardSubtitle>
    </IonCardHeader>

    <IonCardContent>Balitang ina mo!!!</IonCardContent>
  </IonCard>
  );
};

export default HomeContainer;
