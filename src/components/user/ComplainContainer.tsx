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
  IonFooter,
} from "@ionic/react";
import {
  documentTextOutline,
  calendarOutline,
  personOutline,
  sendOutline,
  imageOutline,
  closeCircleOutline,
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
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [messages, setMessages] = useState<Array<any>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        const userId = parseInt(parsedUser.id);

        if (!userId) {
          throw new Error("Invalid user ID");
        }

        setUser({
          id: userId,
          name: parsedUser.name || "",
        });

        // Fetch only this user's complaints
        fetchUserComplaints(userId);
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
        `http://127.0.0.1/justify/index.php/ComplaintController/getAllComplaints?user_id=${userId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.status && Array.isArray(data.complaints)) {
        // Ensure we only get complaints for this user
        const userComplaints = data.complaints.filter(
          (complaint: any) => String(complaint.user_id) === String(userId)
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
      setRecentComplaints([]);
    }
  };

  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value!.split("T")[0]; // Extract only the date part (YYYY-MM-DD)
    setIncidentDate(selectedDate);
    setShowDatePicker(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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

    const formData = new FormData();
    formData.append("user_id", user.id.toString());
    formData.append("complainant", user.name);
    formData.append("respondent", respondent);
    formData.append("details", details);
    formData.append("incident_date", incidentDate);
    formData.append("complaint_type", complaintType.toString());
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/ComplaintController/create",
        {
          method: "POST",
          body: formData, // Changed to formData instead of JSON.stringify
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

  const fetchMessages = async (complaintId: number) => {
    try {
      if (!complaintId) {
        throw new Error("Invalid complaint ID");
      }

      const response = await fetch(
        `http://127.0.0.1/justify/index.php/ChatController/getMessages/${complaintId}`
      );

      const data = await response.json();

      if (!data.status) {
        // If no messages, set empty array but don't show error
        setMessages([]);
        return;
      }

      // Format messages if they exist
      if (Array.isArray(data.messages)) {
        const formattedMessages = data.messages.map((msg: any) => ({
          text: msg.message,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp).toLocaleString(),
          user_id: msg.user_id,
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedComplaint || !user) return;

    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/ChatController/sendMessage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            complaint_id: selectedComplaint.id,
            user_id: user.id,
            message: newMessage,
            sender: "user", // Keep this as "user" for consistent typing
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: newMessage,
            sender: "user",
            timestamp: new Date().toLocaleString(),
            user_id: user.id,
          },
        ]);
        setNewMessage("");
      } else {
        throw new Error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setShowToast({
        message:
          error instanceof Error ? error.message : "Failed to send message",
        success: false,
      });
    }
  };

  const handleComplaintClick = (complaint: any) => {
    setSelectedComplaint(complaint);
    fetchMessages(complaint.id);
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

              <IonItem lines="full" className="form-item">
                <IonLabel position="stacked">Attachment (Optional)</IonLabel>
                <div className="image-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <IonButton
                    fill="outline"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <IonIcon slot="start" icon={imageOutline} />
                    Choose Image
                  </IonButton>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={removeImage}
                      >
                        <IonIcon slot="icon-only" icon={closeCircleOutline} />
                      </IonButton>
                    </div>
                  )}
                </div>
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
          {/* Recent complaints with chat functionality */}

          <IonCardHeader>
            <IonCardTitle>Your Recent Complaints</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {recentComplaints.length > 0 ? (
                recentComplaints.map((complaint: any) => (
                  <IonItem
                    key={complaint.id}
                    button
                    onClick={() => handleComplaintClick(complaint)}
                  >
                    <IonLabel>
                      <h2>
                        {complaintTypes.find(
                          (t) => t.id === parseInt(complaint.complaint_type)
                        )?.name || "Unknown Complaint Type"}
                      </h2>
                      <p>
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

          {/* Chat Modal */}
          <IonModal
            isOpen={!!selectedComplaint}
            onDidDismiss={() => setSelectedComplaint(null)}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>
                  {selectedComplaint
                    ? `Complaint #${selectedComplaint.id}`
                    : "Chat"}
                </IonTitle>
                <IonButton
                  slot="end"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Close
                </IonButton>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              <div className="chat-container">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${
                      msg.sender === "user" ? "user-message" : "admin-message"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <small>{msg.timestamp}</small>
                  </div>
                ))}
              </div>
            </IonContent>
            <IonFooter>
              <IonItem>
                <IonInput
                  placeholder="Type your message..."
                  value={newMessage}
                  onIonChange={(e) => setNewMessage(e.detail.value!)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <IonButton onClick={handleSendMessage}>
                  <IonIcon icon={sendOutline} />
                </IonButton>
              </IonItem>
            </IonFooter>
          </IonModal>
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
