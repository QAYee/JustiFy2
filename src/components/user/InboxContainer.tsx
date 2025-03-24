import React from 'react';
import { IonAvatar, IonItem, IonLabel, IonList, IonIcon } from '@ionic/react';
import { airplane, bluetooth, call, wifi } from 'ionicons/icons';


interface ContainerProps {
  name: string;
}

const InboxContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <>
    <IonList>
      <IonItem>
        <IonAvatar aria-hidden="true" slot="start">
          <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </IonAvatar>
        <IonLabel>Huey</IonLabel>
      </IonItem>
      <IonItem>
        <IonAvatar aria-hidden="true" slot="start">
          <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </IonAvatar>
        <IonLabel>Dewey</IonLabel>
      </IonItem>
      <IonItem>
        <IonAvatar aria-hidden="true" slot="start">
          <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </IonAvatar>
        <IonLabel>Louie</IonLabel>
      </IonItem>
      <IonItem>
        <IonAvatar aria-hidden="true" slot="start">
          <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
        </IonAvatar>
        <IonLabel>Fooie</IonLabel>
      </IonItem>
    </IonList>
  </>
  );
};

export default InboxContainer;
