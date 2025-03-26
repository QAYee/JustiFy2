"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonTextarea,
  IonIcon,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonModal,
  IonList,
} from "@ionic/react";
import {
  documentTextOutline,
  calendarOutline,
  personOutline,
  sendOutline,
} from "ionicons/icons";
import "./ComplainContainer.css";

interface ComplaintType {
  id: number;
  name: string;
  description: string;
}

const ComplainContainer: React.FC = () => {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);
  const [respondent, setRespondent] = useState("");
  const [details, setDetails] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [complaintType, setComplaintType] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    success: boolean;
  } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recentComplaints, setRecentComplaints] = useState([]);

  // Updated complaint types
  const complaintTypes: ComplaintType[] = [
    {
      id: 1,
      name: "Noise Complaint",
      description: "Report excessive noise from neighbors or establishments",
    },
    {
      id: 2,
      name: "Property Dispute",
      description: "Issues related to property boundaries or ownership",
    },
    {
      id: 3,
      name: "Public Disturbance",
      description: "Report disruptive behavior in public spaces",
    },
    {
      id: 4,
      name: "Utility Issue",
      description: "Problems with water, electricity, or other utilities",
    },
    {
      id: 5,
      name: "Environmental Concern",
      description: "Issues related to pollution, waste disposal, etc.",
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          id: parsedUser.id || 0,
          name: parsedUser.name || "",
        });

        // Fetch user's complaints
        fetchUserComplaints(parsedUser.id);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        setShowToast({
          message: "Failed to load user information",
          success: false,
        });
      }
    }
  }, []);

  const fetchUserComplaints = async (userId: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1/justify/index.php/ComplaintController/getAllComplaints`
      );
      const data = await response.json();

      if (data.status && Array.isArray(data.complaints)) {
        // Filter complaints to only show the current user's complaints
        const userComplaints = data.complaints.filter(
          (complaint: any) => complaint.user_id === userId.toString()
        );
        setRecentComplaints(userComplaints);
      } else {
        setRecentComplaints([]);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setShowToast({
        message: "Failed to load your complaints",
        success: false,
      });
    }
  };

  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value!.split("T")[0]; // Extract only the date part (YYYY-MM-DD)
    setIncidentDate(selectedDate);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      setShowToast({
        message: "You must be logged in to submit a complaint.",
        success: false,
      });
      return;
    }

    if (!respondent.trim() || !details.trim() || !incidentDate) {
      setShowToast({
        message: "Please fill in all required fields.",
        success: false,
      });
      return;
    }

    const complaintData = {
      user_id: user.id,
      complainant: user.name,
      respondent,
      details,
      incident_date: incidentDate,
      complaint_type: complaintType,
    };

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/ComplaintController/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json", // Add this line
          },
          body: JSON.stringify(complaintData),
        }
      );

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const text = await response.text();
        console.error("Server response:", text);
        throw new Error(`Server error: ${response.status}`);
      }

      // Try to parse JSON response
      let result;
      try {
        result = await response.json();
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Invalid response from server");
      }

      if (result.status) {
        setShowToast({
          message: `Complaint submitted successfully!`,
          success: true,
        });

        // Reset form and refresh list
        setRespondent("");
        setDetails("");
        setIncidentDate("");
        setComplaintType(1);
        fetchUserComplaints(user.id);
      } else {
        throw new Error(result.message || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setShowToast({
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to server. Please check your connection.",
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IonContent className="ion-padding" color="light">
        <div className="complaint-form-container">
          <h2 className="form-title">Barangay Complaint Form</h2>
          <p className="form-subtitle">
            Please provide accurate information to help us process your
            complaint efficiently.
          </p>

          <IonCardHeader>
            <IonCardTitle>Complaint Information</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <div className="form-section">
              <h3 className="section-title">Complainant Details</h3>

              <IonItem lines="full" className="form-item">
                <IonLabel position="stacked" className="required-field">
                  Complainant
                </IonLabel>
                <IonInput
                  value={user ? user.name : ""}
                  readonly
                  placeholder="Your name"
                >
                  <IonIcon slot="start" icon={personOutline} />
                </IonInput>
              </IonItem>
            </div>

            <div className="form-section">
              <h3 className="section-title">Complaint Details</h3>

              <IonItem lines="full" className="form-item">
                <IonLabel position="stacked" className="required-field">
                  Complaint Type
                </IonLabel>
                <IonSelect
                  value={complaintType}
                  onIonChange={(e) => setComplaintType(e.detail.value)}
                  interface="popover"
                  placeholder="Select complaint type"
                >
                  {complaintTypes.map((type) => (
                    <IonSelectOption key={type.id} value={type.id}>
                      {type.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem lines="full" className="form-item">
                <IonLabel position="stacked" className="required-field">
                  Respondent
                </IonLabel>
                <IonInput
                  placeholder="Enter respondent's name"
                  value={respondent}
                  onIonChange={(e) => setRespondent(e.detail.value!)}
                  clearInput={true}
                >
                  <IonIcon slot="start" icon={personOutline} />
                </IonInput>
              </IonItem>

              <IonItem lines="full" className="form-item">
                <IonLabel position="stacked" className="required-field">
                  Date of Incident
                </IonLabel>
                <IonInput
                  placeholder="YYYY-MM-DD"
                  value={incidentDate}
                  readonly
                  onClick={() => setShowDatePicker(true)}
                >
                  <IonIcon slot="start" icon={calendarOutline} />
                </IonInput>
              </IonItem>

              <IonModal
                isOpen={showDatePicker}
                onDidDismiss={() => setShowDatePicker(false)}
              >
                <IonContent>
                  <IonDatetime
                    value={incidentDate}
                    presentation="date"
                    onIonChange={handleDateChange}
                  />
                  <IonButton
                    expand="block"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Done
                  </IonButton>
                </IonContent>
              </IonModal>

              <IonItem lines="full" className="form-item">
                <IonLabel position="stacked" className="required-field">
                  Complaint Details
                </IonLabel>
                <IonTextarea
                  placeholder="Provide detailed description of your complaint"
                  value={details}
                  onIonChange={(e) => setDetails(e.detail.value!)}
                  rows={6}
                  className="complaint-details"
                >
                  <IonIcon slot="start" icon={documentTextOutline} />
                </IonTextarea>
              </IonItem>
            </div>

            <div className="form-actions">
              <IonButton expand="block" fill="outline" className="form-button">
                Cancel
              </IonButton>
              <IonButton
                expand="block"
                color="primary"
                className="form-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <IonSpinner name="dots" />
                ) : (
                  <>
                    <IonIcon slot="start" icon={sendOutline} />
                    Submit Complaint
                  </>
                )}
              </IonButton>
            </div>
          </IonCardContent>

          {/* Recent complaints preview */}
          <IonCard className="form-card" style={{ marginTop: "20px" }}>
            <IonCardHeader>
              <IonCardTitle>Your Recent Complaints</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {recentComplaints.length > 0 ? (
                  recentComplaints.map((complaint: any) => (
                    <IonItem key={complaint.id}>
                      <IonLabel>
                        <h2>
                          {complaintTypes.find(
                            (t) => t.id === parseInt(complaint.complaint_type)
                          )?.name || "Unknown Complaint Type"}
                        </h2>
                        <p>Against: {complaint.respondent}</p>
                        <p>
                          Status:{" "}
                          <IonChip
                            color={
                              complaint.status === "pending"
                                ? "warning"
                                : complaint.status === "resolved"
                                ? "success"
                                : "primary"
                            }
                            outline={true}
                          >
                            {complaint.status.charAt(0).toUpperCase() +
                              complaint.status.slice(1)}
                          </IonChip>
                        </p>
                        <p>Date: {complaint.incident_date}</p>
                      </IonLabel>
                    </IonItem>
                  ))
                ) : (
                  <IonItem>
                    <IonLabel>No complaints found</IonLabel>
                  </IonItem>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>

        {showToast && (
          <IonToast
            isOpen={!!showToast}
            message={showToast.message}
            duration={3000}
            color={showToast.success ? "success" : "danger"}
            onDidDismiss={() => setShowToast(null)}
          />
        )}
      </IonContent>
    </>
  );
};

export default ComplainContainer;
