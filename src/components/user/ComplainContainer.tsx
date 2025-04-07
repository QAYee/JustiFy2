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
  const respondent = "Barangay Officials"; // Fixed value that cannot be changed
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
  const [otherComplaintType, setOtherComplaintType] = useState(""); // Add this for "Others" option

  // Updated complaint types to match backend mapping
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
    {
      id: 6,
      name: "Vandalism",
      description: "Destruction or defacement of public/private property",
    },
    {
      id: 7,
      name: "Illegal Construction",
      description: "Construction without proper permits or approvals",
    },
    {
      id: 8,
      name: "Parking Violation",
      description: "Improper parking or blocking access to property",
    },
    {
      id: 9,
      name: "Animal Complaint",
      description: "Issues related to pets, strays, or wildlife",
    },
    {
      id: 10,
      name: "Others",
      description: "Any other issue not listed above",
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

  // Updated handleDateChange function to capture both date and time
  const handleDateChange = (e: CustomEvent) => {
    const selectedDateTime = e.detail.value!;

    // Format the datetime value
    const date = new Date(selectedDateTime);

    // Create formatted string (YYYY-MM-DD HH:MM)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

    setIncidentDate(formattedDateTime);
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

    if (!details.trim() || !incidentDate) {
      setShowToast({
        message: "Please fill in all required fields.",
        success: false,
      });
      return;
    }

    // Validate that "Others" complaint type has a description
    if (complaintType === 10 && !otherComplaintType.trim()) {
      setShowToast({
        message: "Please specify your complaint type",
        success: false,
      });
      return;
    }

    // Find the selected complaint type name from the array
    const selectedComplaintType = complaintTypes.find(
      (type) => type.id === complaintType
    );
    const complaintTypeName = selectedComplaintType
      ? selectedComplaintType.name
      : "";

    const formData = new FormData();
    formData.append("user_id", user.id.toString());
    formData.append("complainant", user.name);
    formData.append("respondent", respondent); // Use the fixed value
    formData.append("details", details);
    formData.append("incident_date", incidentDate);

    // Use the complaint type name instead of the ID
    formData.append(
      "complaint_type",
      complaintType === 10 ? otherComplaintType : complaintTypeName
    );

    // We still might want to keep the complaint type ID for reference
    formData.append("complaint_type_id", complaintType.toString());

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/ComplaintController/create",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Server response:", text);
        throw new Error(`Server error: ${response.status}`);
      }

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
      <div className="complaint-form-container">
        <h2 className="form-title">Barangay Complaint Form</h2>
        <p className="form-subtitle">
          Please provide accurate information to help us process your complaint
          efficiently.
        </p>

        <IonCardHeader>
          <IonCardTitle>Complaint Information</IonCardTitle>
        </IonCardHeader>

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
            <div className="select-wrapper">
              <IonIcon icon={documentTextOutline} className="select-icon" />
              <IonSelect
                value={complaintType}
                onIonChange={(e) => setComplaintType(e.detail.value)}
                interface="action-sheet"
                placeholder="Select complaint type"
                className="custom-select"
              >
                {complaintTypes.map((type) => (
                  <IonSelectOption key={type.id} value={type.id}>
                    {type.name}
                    <div className="select-option-description">
                      {type.description}
                    </div>
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </IonItem>

          {/* Show additional input field when "Others" is selected */}
          {complaintType === 10 && (
            <IonItem lines="full" className="form-item">
              <IonLabel position="stacked" className="required-field">
                Specify Complaint Type
              </IonLabel>
              <IonInput
                placeholder="Enter your specific complaint type"
                value={otherComplaintType}
                onIonChange={(e) => setOtherComplaintType(e.detail.value!)}
              />
            </IonItem>
          )}

          <IonItem lines="full" className="form-item">
            <IonLabel position="stacked" className="required-field">
              Respondent
            </IonLabel>
            <IonInput value={respondent} readonly disabled={true}>
              <IonIcon slot="start" icon={personOutline} />
            </IonInput>
          </IonItem>

          <IonItem lines="full" className="form-item">
            <IonLabel position="stacked" className="required-field">
              Date of Incident
            </IonLabel>
            <IonInput
              placeholder="YYYY-MM-DD HH:MM"
              value={incidentDate}
              readonly
              onClick={() => setShowDatePicker(true)}
            >
              <IonIcon slot="start" icon={calendarOutline} />
            </IonInput>
          </IonItem>

          {/* Modified date picker modal with time component */}
          <IonModal
            isOpen={showDatePicker}
            onDidDismiss={() => setShowDatePicker(false)}
          >
            <IonContent>
              <IonDatetime
                value={incidentDate}
                presentation="date-time" // Changed from "date" to "date-time"
                onIonChange={handleDateChange}
                minuteValues="0,15,30,45" // Optional: add minute intervals of 15
                firstDayOfWeek={1}
                locale="en-US"
              />
              <div style={{ padding: "10px" }}>
                <IonButton
                  expand="block"
                  onClick={() => setShowDatePicker(false)}
                >
                  Done
                </IonButton>
              </div>
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
                className="image-upload-button"
                expand="block"
                color="primary"
                fill="outline"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <IonIcon slot="start" icon={imageOutline} />
                Choose Image
              </IonButton>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <IonButton fill="clear" color="danger" onClick={removeImage}>
                    <IonIcon slot="icon-only" icon={closeCircleOutline} />
                  </IonButton>
                </div>
              )}
            </div>
          </IonItem>
        </div>

        <div className="form-actions">
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

        {/* Recent complaints preview */}
        {/* Recent complaints with chat functionality */}
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
    </>
  );
};

export default ComplainContainer;
