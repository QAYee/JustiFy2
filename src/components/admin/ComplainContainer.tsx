import React, { useEffect, useState } from 'react';
import { 
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonList, IonSpinner, IonToast 
} from '@ionic/react';

const ComplainContainer: React.FC = () => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await fetch("http://localhost/justify/index.php/ComplaintController/getAllComplaints");
                if (!response.ok) {
                    throw new Error("Failed to fetch complaints");
                }
                const data = await response.json();
                setComplaints(data.complaints); // Ensure the response has a `complaints` key
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle className="ion-text-center">All Complaints</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding" color="light">
                {loading && <IonSpinner name="dots" />}
                {error && <IonToast isOpen message={error} duration={3000} color="danger" />}
                
                {!loading && !error && (
                    <IonList>
                        {complaints.length > 0 ? (
                            complaints.map((complaint, index) => (
                                <IonItem key={index}>
                                    <IonLabel>
                                        <h2>Complainant: {complaint.complainant}</h2>
                                        <p><strong>Respondent:</strong> {complaint.respondent}</p>
                                        <p><strong>Details:</strong> {complaint.details}</p>
                                        <p><strong>Date:</strong> {complaint.incident_date}</p>
                                    </IonLabel>
                                </IonItem>
                            ))
                        ) : (
                            <IonItem>
                                <IonLabel>No complaints found.</IonLabel>
                            </IonItem>
                        )}
                    </IonList>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ComplainContainer;
