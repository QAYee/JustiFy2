import type React from "react";
import { useState, useEffect } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonIcon,
  IonChip,
  IonModal,
  IonList,
  IonFooter,
  IonSelect,
  IonSelectOption,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonTab,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonBadge,
  IonPage,
} from "@ionic/react";
import {
  sendOutline,
  documentsOutline,
  ticketOutline,
  timeOutline,
} from "ionicons/icons";
import "./TicketContainer.css";

interface UserData {
  name: string;
  email: string;
  address: string;
  [key: string]: any;
}

interface ComplaintType {
  id: number;
  name: string;
  description: string;
}

interface Message {
  text: string;
  sender: "user" | "admin";
  timestamp: string;
  user_id: number;
}

interface ShowToast {
  message: string;
  success: boolean;
}

interface Complaint {
  id: number;
  complaint_type: string; // This could be a string ID or a direct string name
  complaint_type_id?: number; // Optional ID if stored separately
  incident_date: string;
  status:
    | "New"
    | "Under review"
    | "In progress"
    | "Resolved"
    | "Closed"
    | "Rejected";
  user_id: number;
  respondent: string;
}

// Default complaint types
const DEFAULT_COMPLAINT_TYPES: ComplaintType[] = [
  {
    id: 1,
    name: "Noise Complaint",
    description: "Issues related to noise disturbances",
  },
  {
    id: 2,
    name: "Property Dispute",
    description: "Conflicts regarding property",
  },
  {
    id: 3,
    name: "Public Disturbance",
    description: "Issues affecting public peace",
  },
  { id: 4, name: "Utility Issue", description: "Problems with utilities" },
  {
    id: 5,
    name: "Environmental Concern",
    description: "Environmental related issues",
  },
];

// Helper functions
const isActiveTicket = (status: string) => {
  return ["New", "Under review", "In progress"].includes(status);
};

const isRecord = (status: string) => {
  return ["Closed", "Resolved", "Rejected"].includes(status);
};

const TicketContainer: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showToast, setShowToast] = useState<ShowToast | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Separate filters for tickets and records
  const [ticketFilter, setTicketFilter] = useState<
    "all" | "New" | "Under review" | "In progress"
  >("all");
  const [recordFilter, setRecordFilter] = useState<
    "all" | "Resolved" | "Closed" | "Rejected"
  >("all");

  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([]);
  const [activeTab, setActiveTab] = useState<string>("tickets"); // New state for tab control

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
          email: parsedUser.email || "",
          address: parsedUser.address || "",
        });

        fetchUserComplaints(userId);
        fetchComplaintTypes();
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        setShowToast({
          message: "Failed to load user information",
          success: false,
        });
      }
    }
  }, []);

  useEffect(() => {
    fetchComplaintTypes();
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
    if (!newMessage.trim() || !selectedComplaint?.id || !user?.id) {
      setShowToast({
        message: "Unable to send message. Please check all required fields.",
        success: false,
      });
      return;
    }

    // Check if the complaint is resolved, closed or rejected
    if (["Resolved", "Closed", "Rejected"].includes(selectedComplaint.status)) {
      setShowToast({
        message:
          "Cannot send messages to resolved, closed, or rejected complaints",
        success: false,
      });
      return;
    }

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
            sender: "user",
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status) {
        const newMessageObj: Message = {
          text: newMessage,
          sender: "user",
          timestamp: new Date().toLocaleString(),
          user_id: user.id,
        };

        setMessages((prevMessages) => [...prevMessages, newMessageObj]);
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

  const handleComplaintClick = (complaint: Complaint) => {
    if (!complaint?.id) {
      setShowToast({
        message: "Invalid complaint selected",
        success: false,
      });
      return;
    }

    setSelectedComplaint(complaint);
    fetchMessages(complaint.id);
  };

  // Updated filtering logic with separate filters for tickets and records
  const filterComplaint = (complaint: Complaint) => {
    // Search query filtering - applies to both sections
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      // Check if the complaint type exists and matches search
      const complaintType = complaintTypes.find(
        (t) => t.id === parseInt(complaint.complaint_type)
      );
      const typeMatches = complaintType?.name.toLowerCase().includes(query);

      // Check if the date matches search
      const dateMatches = complaint.incident_date
        ?.toLowerCase()
        .includes(query);

      // If search query doesn't match anything, filter out this complaint
      if (!typeMatches && !dateMatches) {
        return false;
      }
    }

    // Status filtering - depends on which section we're in
    if (isActiveTicket(complaint.status)) {
      return ticketFilter === "all" || complaint.status === ticketFilter;
    } else if (isRecord(complaint.status)) {
      return recordFilter === "all" || complaint.status === recordFilter;
    }

    return false;
  };

  // Filter complaints for active tickets section
  const filteredActiveTickets = recentComplaints
    .filter((complaint) => isActiveTicket(complaint.status))
    .filter(filterComplaint);

  // Filter complaints for records section
  const filteredRecords = recentComplaints
    .filter((complaint) => isRecord(complaint.status))
    .filter(filterComplaint);

  // Debug monitoring for filters
  useEffect(() => {
    console.log("Search Query:", searchQuery);
    console.log("Ticket Filter:", ticketFilter);
    console.log("Record Filter:", recordFilter);
    console.log("Active Tickets:", filteredActiveTickets.length);
    console.log("Records:", filteredRecords.length);
  }, [searchQuery, ticketFilter, recordFilter, recentComplaints]);

  const fetchComplaintTypes = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/ComplaintController/getComplaintTypes",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.status && Array.isArray(data.types)) {
        setComplaintTypes(data.types);
      } else {
        console.log("Using default complaint types");
        setComplaintTypes(DEFAULT_COMPLAINT_TYPES);
      }
    } catch (error) {
      console.error("Error fetching complaint types:", error);
      console.log("Using default complaint types due to error");
      setComplaintTypes(DEFAULT_COMPLAINT_TYPES);
    }
  };

  // Helper function to get complaint type name from ID or direct string
  const getComplaintTypeName = (complaint: Complaint): string => {
    if (!complaint.complaint_type) return "Unknown Type";

    // First check if complaint_type is already a name (string)
    if (isNaN(Number(complaint.complaint_type))) {
      return complaint.complaint_type;
    }

    // Otherwise, look it up from the complaint types array by ID
    const typeId = parseInt(complaint.complaint_type);
    const foundType = complaintTypes.find((type) => type.id === typeId);
    return foundType?.name || "Unknown Type";
  };

  return (
    <div className="ticket-container">
      <IonCardHeader>
        <IonCardTitle
          style={{
            padding: "16px",
            fontSize: "24px",
            color: "#0066cc",
            marginBottom: "16px",
            fontWeight: "bold",
          }}
        >
          Your Recent Complaints
        </IonCardTitle>
        <div className="filter-container">
          <IonLabel position="stacked" color="primary">
            <strong>Search Complaints</strong>
          </IonLabel>
          <IonInput
            className="search-input"
            value={searchQuery}
            onIonChange={(e) => {
              const value = e.detail.value || "";
              setSearchQuery(value);
            }}
            placeholder="Type to search by complaint type or date..."
            debounce={300}
            clearInput={true}
          />
        </div>
      </IonCardHeader>

      {/* Tabs to switch between tickets and records */}
      <div className="tab-container">
        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as string)}
        >
          <IonSegmentButton value="tickets" className="tab-button">
            <IonLabel>Active Tickets</IonLabel>
            {filteredActiveTickets.length > 0 && (
              <IonBadge color="primary">
                {filteredActiveTickets.length}
              </IonBadge>
            )}
          </IonSegmentButton>
          <IonSegmentButton value="records" className="tab-button">
            <IonLabel>Records</IonLabel>
            {filteredRecords.length > 0 && (
              <IonBadge color="medium">{filteredRecords.length}</IonBadge>
            )}
          </IonSegmentButton>
        </IonSegment>
      </div>

      {/* Active Tickets Tab Content */}
      {activeTab === "tickets" && (
        <>
          <div className="section-header">
            <h2>Active Tickets</h2>
            <small>New, Under Review, and In Progress complaints</small>
          </div>

          <IonSegment
            scrollable={true}
            value={ticketFilter}
            className="status-segment"
            onIonChange={(e: CustomEvent) => {
              const value = e.detail.value as
                | "all"
                | "New"
                | "Under review"
                | "In progress";
              setTicketFilter(value);
            }}
          >
            <IonSegmentButton value="all" className="segment-btn">
              <IonLabel className="segment-label">All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="New" className="segment-btn">
              <IonLabel className="segment-label">New</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Under review" className="segment-btn">
              <IonLabel className="segment-label">Under Review</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="In progress" className="segment-btn">
              <IonLabel className="segment-label">In Progress</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <>
            {filteredActiveTickets.length > 0 ? (
              filteredActiveTickets.map((complaint: Complaint) => (
                <IonItem
                  key={complaint.id}
                  button
                  onClick={() => handleComplaintClick(complaint)}
                  style={{
                    "--background": "white",
                    "--background-hover": "rgba(0, 47, 167, 0.05)",
                    "--background-activated": "rgba(0, 47, 167, 0.08)",
                    "--background-focused": "white",
                    "--border-color": "rgba(0, 47, 167, 0.1)",
                    "--padding-start": "16px",
                    "--padding-end": "16px",
                    "--padding-top": "12px",
                    "--padding-bottom": "12px",
                    "--inner-padding-end": "8px",
                    marginBottom: "4px",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <IonLabel>
                    <h2>{getComplaintTypeName(complaint)}</h2>
                    <p className="respondent-text">
                      Respondent: {complaint.respondent || "Not specified"}
                    </p>
                    <p>
                      <IonChip
                        color={
                          complaint.status === "New"
                            ? "primary"
                            : complaint.status === "Under review"
                            ? "warning"
                            : "tertiary"
                        }
                        outline={true}
                      >
                        {complaint.status}
                      </IonChip>
                    </p>
                    <p>
                      Date:{" "}
                      {new Date(complaint.incident_date).toLocaleDateString()}
                    </p>
                  </IonLabel>
                </IonItem>
              ))
            ) : (
              <IonItem
                style={{
                  "--background": "white",
                  "--background-hover": "rgba(0, 47, 167, 0.05)",
                  "--background-activated": "rgba(0, 47, 167, 0.08)",
                  "--background-focused": "white",
                  "--border-color": "rgba(0, 47, 167, 0.1)",
                  "--padding-start": "16px",
                  "--padding-end": "16px",
                  "--padding-top": "12px",
                  "--padding-bottom": "12px",
                  "--inner-padding-end": "8px",
                  marginBottom: "4px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <IonLabel className="ion-text-center" style={{ color: "#000" }}>
                  No records found
                </IonLabel>
              </IonItem>
            )}
          </>
        </>
      )}

      {/* Records Tab Content */}
      {activeTab === "records" && (
        <>
          <div className="section-header">
            <h2>Records</h2>
            <small>Closed, Resolved, and Rejected complaints</small>
          </div>

          <IonSegment
            scrollable={true}
            value={recordFilter}
            className="status-segment"
            onIonChange={(e: CustomEvent) => {
              const value = e.detail.value as
                | "all"
                | "Resolved"
                | "Closed"
                | "Rejected";
              setRecordFilter(value);
            }}
          >
            <IonSegmentButton value="all" className="segment-btn">
              <IonLabel className="segment-label">All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Resolved" className="segment-btn">
              <IonLabel className="segment-label">Resolved</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Closed" className="segment-btn">
              <IonLabel className="segment-label">Closed</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="Rejected" className="segment-btn">
              <IonLabel className="segment-label">Rejected</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((complaint: Complaint) => (
                <IonItem
                  key={complaint.id}
                  button
                  onClick={() => handleComplaintClick(complaint)}
                  style={{
                    "--background": "white",
                    "--background-hover": "rgba(0, 47, 167, 0.05)",
                    "--background-activated": "rgba(0, 47, 167, 0.08)",
                    "--background-focused": "white",
                    "--border-color": "rgba(0, 47, 167, 0.1)",
                    "--padding-start": "16px",
                    "--padding-end": "16px",
                    "--padding-top": "12px",
                    "--padding-bottom": "12px",
                    "--inner-padding-end": "8px",
                    marginBottom: "4px",
                    borderRadius: "8px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <IonLabel>
                    <h2>{getComplaintTypeName(complaint)}</h2>
                    <p className="respondent-text">
                      Respondent: {complaint.respondent || "Not specified"}
                    </p>
                    <p>
                      <IonChip
                        color={
                          complaint.status === "Resolved"
                            ? "success"
                            : complaint.status === "Closed"
                            ? "medium"
                            : "danger"
                        }
                        outline={true}
                      >
                        {complaint.status}
                      </IonChip>
                    </p>
                    <p>
                      Date:{" "}
                      {new Date(complaint.incident_date).toLocaleDateString()}
                    </p>
                  </IonLabel>
                </IonItem>
              ))
            ) : (
              <IonItem
                style={{
                  "--background": "white",
                  "--background-hover": "rgba(0, 47, 167, 0.05)",
                  "--background-activated": "rgba(0, 47, 167, 0.08)",
                  "--background-focused": "white",
                  "--border-color": "rgba(0, 47, 167, 0.1)",
                  "--padding-start": "16px",
                  "--padding-end": "16px",
                  "--padding-top": "12px",
                  "--padding-bottom": "12px",
                  "--inner-padding-end": "8px",
                  marginBottom: "4px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                <IonLabel className="ion-text-center" style={{ color: "#000" }}>
                  No records found
                </IonLabel>
              </IonItem>
            )}
          </>
        </>
      )}

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
            <IonButton slot="end" onClick={() => setSelectedComplaint(null)}>
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedComplaint && (
            <div className="complaint-details-section">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle
                    style={{ color: "#0066cc", fontWeight: "bold" }}
                  >
                    {getComplaintTypeName(selectedComplaint)}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div
                    className="complaint-header-info"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <IonChip
                      color={
                        selectedComplaint.status === "New"
                          ? "primary"
                          : selectedComplaint.status === "Under review"
                          ? "warning"
                          : selectedComplaint.status === "In progress"
                          ? "tertiary"
                          : selectedComplaint.status === "Resolved"
                          ? "success"
                          : selectedComplaint.status === "Closed"
                          ? "medium"
                          : "danger"
                      }
                      outline={true}
                    >
                      {selectedComplaint.status}
                    </IonChip>
                    <span
                      className="complaint-id"
                      style={{
                        fontSize: "0.9em",
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      Ref #: {selectedComplaint.id}
                    </span>
                  </div>

                  <div
                    className="complaint-timeline"
                    style={{
                      background: "#f9f9f9",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "16px",
                        color: "#444",
                      }}
                    >
                      Complaint Timeline
                    </h3>
                    <div
                      className="timeline-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <IonIcon
                        icon={timeOutline}
                        style={{ color: "#0066cc", marginRight: "8px" }}
                      />
                      <div>
                        <div style={{ fontWeight: "bold" }}>Filed on</div>
                        <div>
                          {new Date(
                            selectedComplaint.incident_date
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            selectedComplaint.incident_date
                          ).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="complaint-detail-item">
                    <strong>Status:</strong>
                    <div style={{ margin: "8px 0" }}>
                      <IonChip
                        color={
                          selectedComplaint.status === "New"
                            ? "primary"
                            : selectedComplaint.status === "Under review"
                            ? "warning"
                            : selectedComplaint.status === "In progress"
                            ? "tertiary"
                            : selectedComplaint.status === "Resolved"
                            ? "success"
                            : selectedComplaint.status === "Closed"
                            ? "medium"
                            : "danger"
                        }
                        outline={true}
                      >
                        {selectedComplaint.status}
                      </IonChip>
                      {selectedComplaint.status === "Under review" && (
                        <small
                          style={{
                            display: "block",
                            color: "#666",
                            marginTop: "4px",
                          }}
                        >
                          Your complaint is being reviewed by our staff
                        </small>
                      )}
                      {selectedComplaint.status === "In progress" && (
                        <small
                          style={{
                            display: "block",
                            color: "#666",
                            marginTop: "4px",
                          }}
                        >
                          We're actively working to address your complaint
                        </small>
                      )}
                      {selectedComplaint.status === "Resolved" && (
                        <small
                          style={{
                            display: "block",
                            color: "#666",
                            marginTop: "4px",
                          }}
                        >
                          Your complaint has been successfully addressed
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="complaint-detail-item">
                    <strong>Complainant:</strong>
                    <span>{user?.name || "You"}</span>
                  </div>

                  <div className="complaint-detail-item">
                    <strong>Respondent:</strong>
                    <span>
                      {selectedComplaint.respondent || "Not specified"}
                    </span>
                  </div>

                  <div className="complaint-detail-item">
                    <strong>Complaint Type:</strong>
                    <span>{getComplaintTypeName(selectedComplaint)}</span>
                  </div>

                  {selectedComplaint.description && (
                    <div className="complaint-detail-item">
                      <strong>Description:</strong>
                      <p
                        style={{
                          background: "#f5f5f5",
                          padding: "10px",
                          borderRadius: "8px",
                          whiteSpace: "pre-wrap",
                          margin: "8px 0",
                        }}
                      >
                        {selectedComplaint.description}
                      </p>
                    </div>
                  )}

                  {/* Add the details field here */}
                  {selectedComplaint.details && (
                    <div className="complaint-detail-item">
                      <strong>Additional Details:</strong>
                      <p
                        style={{
                          background: "#f5f5f5",
                          padding: "10px",
                          borderRadius: "8px",
                          whiteSpace: "pre-wrap",
                          margin: "8px 0",
                        }}
                      >
                        {selectedComplaint.details}
                      </p>
                    </div>
                  )}

                 

                  {selectedComplaint.resolution && (
                    <div
                      className="complaint-detail-item resolution-info"
                      style={{
                        background: "#e6f3ff",
                        padding: "12px",
                        borderRadius: "8px",
                        marginTop: "16px",
                      }}
                    >
                      
                    </div>
                  )}

                  {selectedComplaint.admin_notes &&
                    ["Resolved", "Closed", "Rejected"].includes(
                      selectedComplaint.status
                    ) && (
                      <div className="complaint-detail-item">
                        <strong>Admin Notes:</strong>
                        <p style={{ fontStyle: "italic" }}>
                          {selectedComplaint.admin_notes}
                        </p>
                      </div>
                    )}
                </IonCardContent>
              </IonCard>

              <div className="chat-header">
                <h2 style={{ color: " #ffffff" }}>Conversation </h2>
                <small style={{ color: " #ffffff" }}> Messages related to this complaint</small>
              </div>
            </div>
          )}

          <div className="chat-container">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === "user" ? "user-message" : "admin-message"
                  }`}
                >
                  <p>{msg.text}</p>
                  <small>{msg.timestamp}</small>
                </div>
              ))
            ) : (
              <div className="no-messages">
                <p>No messages yet. Start a conversation!</p>
              </div>
            )}

            {/* Show a notice when chat is disabled */}
            {selectedComplaint &&
              ["Resolved", "Closed", "Rejected"].includes(
                selectedComplaint.status
              ) && (
                <div
                  style={{
                    background: "#f4f4f4",
                    padding: "10px",
                    borderRadius: "8px",
                    textAlign: "center",
                    margin: "20px 0",
                    color: "#666",
                  }}
                >
                  This complaint is {selectedComplaint.status.toLowerCase()}.
                  Chat functionality has been disabled.
                </div>
              )}
          </div>
        </IonContent>
        <IonFooter>
          <IonItem>
            <IonInput
              placeholder={
                selectedComplaint &&
                ["Resolved", "Closed", "Rejected"].includes(
                  selectedComplaint.status
                )
                  ? "Chat disabled for this complaint"
                  : "Type your message..."
              }
              value={newMessage}
              onIonChange={(e) => setNewMessage(e.detail.value!)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={
                selectedComplaint &&
                ["Resolved", "Closed", "Rejected"].includes(
                  selectedComplaint.status
                )
              }
            />
            <IonButton
              onClick={handleSendMessage}
              disabled={
                !selectedComplaint ||
                ["Resolved", "Closed", "Rejected"].includes(
                  selectedComplaint.status
                )
              }
            >
              <IonIcon icon={sendOutline} />
            </IonButton>
          </IonItem>
        </IonFooter>
      </IonModal>

      <IonToast
        isOpen={!!showToast}
        message={showToast?.message}
        duration={3000}
        color={showToast?.success ? "success" : "danger"}
        onDidDismiss={() => setShowToast(null)}
      />
    </div>
  );
};

export default TicketContainer;
