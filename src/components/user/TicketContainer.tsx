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
} from "@ionic/react";
import { sendOutline } from "ionicons/icons";

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
  complaint_type: string;
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
  const [ticketFilter, setTicketFilter] = useState<"all" | "New" | "Under review" | "In progress">("all");
  const [recordFilter, setRecordFilter] = useState<"all" | "Resolved" | "Closed" | "Rejected">("all");
  
  const [complaintTypes, setComplaintTypes] = useState<ComplaintType[]>([]);

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
      const dateMatches = complaint.incident_date?.toLowerCase().includes(query);
      
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
    .filter(complaint => isActiveTicket(complaint.status))
    .filter(filterComplaint);

  // Filter complaints for records section
  const filteredRecords = recentComplaints
    .filter(complaint => isRecord(complaint.status))
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

  

  return (
    <div>
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
          <IonItem>
            <IonLabel position="floating">Search Complaints</IonLabel>
            <IonInput
              className="search-input"
              value={searchQuery}
              onIonChange={(e) => {
                const value = e.detail.value || "";
                setSearchQuery(value);
              }}
              debounce={300}
            />
          </IonItem>
        </div>
      </IonCardHeader>
      
      {/* Active Tickets Section */}
      <IonCardContent>
        <div className="section-header">
          <h2>Active Tickets</h2>
          <small>New, Under Review, and In Progress complaints</small>
        </div>
        
        <IonItem lines="none" className="status-filter">
          <IonSegment
            scrollable={true}
            value={ticketFilter}
            className="status-segment"
            onIonChange={(e: CustomEvent) => {
              const value = e.detail.value as "all" | "New" | "Under review" | "In progress";
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
        </IonItem>
        
        <IonList>
          {filteredActiveTickets.length > 0 ? (
            filteredActiveTickets.map((complaint: Complaint) => (
              <IonItem
                key={complaint.id}
                button
                onClick={() => handleComplaintClick(complaint)}
              >
                <IonLabel>
                  <h2>
                    {complaintTypes.find(
                      (t) => t.id === parseInt(complaint.complaint_type)
                    )?.name || "Unknown Type"}
                  </h2>
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
            <IonItem>
              <IonLabel className="ion-text-center">
                No active tickets found
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      </IonCardContent>

      {/* Records Section */}
      <IonCardContent>
        <div className="section-header">
          <h2>Records</h2>
          <small>Closed, Resolved, and Rejected complaints</small>
        </div>
        
        <IonItem lines="none" className="status-filter">
          <IonSegment
            scrollable={true}
            value={recordFilter}
            className="status-segment"
            onIonChange={(e: CustomEvent) => {
              const value = e.detail.value as "all" | "Resolved" | "Closed" | "Rejected";
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
        </IonItem>
        
        <IonList>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((complaint: Complaint) => (
              <IonItem
                key={complaint.id}
                button
                onClick={() => handleComplaintClick(complaint)}
              >
                <IonLabel>
                  <h2>
                    {complaintTypes.find(
                      (t) => t.id === parseInt(complaint.complaint_type)
                    )?.name || "Unknown Type"}
                  </h2>
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
            <IonItem>
              <IonLabel className="ion-text-center">
                No records found
              </IonLabel>
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
            <IonButton slot="end" onClick={() => setSelectedComplaint(null)}>
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
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