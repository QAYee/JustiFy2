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
      <IonCardTitle>admin ABI</IonCardTitle>
      <IonCardSubtitle>admin GIRLS</IonCardSubtitle>
    </IonCardHeader>

    <IonCardContent>admin ina mo!!!</IonCardContent>
  </IonCard>
  );
};

export default HomeContainer;
