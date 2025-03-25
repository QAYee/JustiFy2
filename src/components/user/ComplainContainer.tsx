import React, { useState, useEffect } from 'react';
import { 
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
    IonLabel, IonInput, IonButton, IonToast, IonSpinner 
} from '@ionic/react';
import './ComplainContainer.css';

const ComplainContainer: React.FC = () => {
  const [user, setUser] = useState<{ id: number, name: string } | null>(null);
  const [respondent, setRespondent] = useState('');
  const [details, setDetails] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string, success: boolean } | null>(null);

  useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
          try {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser?.id && parsedUser?.name) {
                  setUser(parsedUser);
              } else {
                  console.error('Invalid user data in localStorage');
              }
          } catch (error) {
              console.error('Failed to parse user from localStorage:', error);
          }
      }
  }, []);

  const handleSubmit = async () => {
    if (!user) {
        setShowToast({ message: 'You must be logged in to submit a complaint.', success: false });
        return;
    }

    if (!respondent.trim()) {
        setShowToast({ message: 'Respondent name is required.', success: false });
        return;
    }

    if (!details.trim()) {
        setShowToast({ message: 'Complaint details are required.', success: false });
        return;
    }

    if (!incidentDate) {
        setShowToast({ message: 'Incident date is required in YYYY-MM-DD format.', success: false });
        return;
    }

    const complaintData = {
        user_id: user.id,
        complainant: user.name,
        respondent,
        details,
        incident_date: incidentDate // ✅ Fixed the key to match backend
    };

    console.log('Sending data:', JSON.stringify(complaintData)); // Debugging request payload

    setLoading(true);

    try {
        const response = await fetch("http://localhost/justify/index.php/ComplaintController/create", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', 
                'Accept': 'application/json'
            },
            body: JSON.stringify(complaintData),
        });

        const result = await response.json();
        console.log('Server response:', result); // Debugging server response

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! Status: ${response.status}`);
        }

        if (result.status) {
            setShowToast({ message: 'Complaint submitted successfully.', success: true });
            setRespondent('');
            setDetails('');
            setIncidentDate('');
        } else {
            setShowToast({ message: result.message || 'Failed to submit complaint', success: false });
        }

    } catch (error) {
        console.error('Error submitting complaint:', error);
        setShowToast({ 
            message: error instanceof Error ? error.message : 'An unexpected error occurred', 
            success: false 
        });
    } finally {
        setLoading(false);
    }
};

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle className="ion-text-center">Barangay Complaint Form</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" color="light">
                <div className="ion-margin-bottom ion-padding form-container">
                    <IonItem lines="full" className="ion-margin-bottom">
                        <IonLabel position="floating">Complainant</IonLabel>
                        <IonInput 
                            value={user ? user.name : ''}
                            readonly
                            className="custom-input"
                        />
                    </IonItem>

                    <IonItem lines="full" className="ion-margin-bottom">
                        <IonLabel position="floating">Respondent</IonLabel>
                        <IonInput 
                            placeholder="Enter respondent's name"
                            className="custom-input"
                            value={respondent}
                            onIonChange={(e) => setRespondent(e.detail.value!)}
                            clearInput={true}
                        />
                    </IonItem>

                    <IonItem lines="full" className="ion-margin-bottom">
                        <IonLabel position="floating">Complaint Details</IonLabel>
                        <IonInput 
                            placeholder="Provide detailed description"
                            className="custom-input complaint-details"
                            value={details}
                            onIonChange={(e) => setDetails(e.detail.value!)}
                            clearInput={true}
                            multiple={true}
                        />
                    </IonItem>

                    <IonItem lines="full" className="ion-margin-bottom">
                        <IonLabel position="floating">Date of Incident</IonLabel>
                        <IonInput 
                            type="date"
                            className="custom-input"
                            value={incidentDate || ''} // ✅ Ensures correct default value
                            onIonChange={(e) => setIncidentDate(e.detail.value || '')}
                        />
                    </IonItem>

                    <IonButton 
                        expand="block" 
                        color="primary" 
                        className="ion-margin-top ion-padding"
                        strong={true}
                        onClick={handleSubmit}
                        disabled={loading} 
                    >
                        {loading ? <IonSpinner name="dots" /> : 'Submit Complaint'}
                    </IonButton>

                    {showToast && (
                        <IonToast
                            isOpen={!!showToast}
                            message={showToast.message}
                            duration={3000}
                            color={showToast.success ? 'success' : 'danger'}
                            onDidDismiss={() => setShowToast(null)}
                        />
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ComplainContainer;
