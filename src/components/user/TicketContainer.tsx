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
  status: "pending" | "processing" | "resolved" | "rejected";
  user_id: number;
}

const complaintTypes: ComplaintType[] = [
  { id: 1, name: "General Complaint", description: "General issues" },
  { id: 2, name: "Technical Issue", description: "Technical problems" },
  { id: 3, name: "Service Complaint", description: "Service related issues" },
];

const TicketContainer: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showToast, setShowToast] = useState<ShowToast | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        setShowToast({
          message: "Failed to load user information",
          success: false,
        });
      }
    }
  }, []);

  // Keep only the essential functions
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

  const handleComplaintClick = (complaint: ComplaintType & { id: number }) => {
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

  // Replace the existing filteredComplaints function with this:
  const filteredComplaints = recentComplaints.filter((complaint: any) => {
    // Convert search query to lowercase for case-insensitive comparison
    const query = searchQuery.toLowerCase().trim();

    // Check if the complaint type exists and matches search
    const complaintType = complaintTypes.find(
      (t) => t.id === parseInt(complaint.complaint_type)
    );
    const typeMatches = complaintType?.name.toLowerCase().includes(query);

    // Check if the date matches search
    const dateMatches = complaint.incident_date?.toLowerCase().includes(query);

    // Check if the status matches filter
    const statusMatches =
      statusFilter === "all" ||
      complaint.status?.toLowerCase() === statusFilter.toLowerCase();

    // Debug logging (remove in production)
    console.log({
      complaint,
      typeMatches,
      dateMatches,
      statusMatches,
      query,
      status: complaint.status,
      filterStatus: statusFilter,
    });

    // Return true if either type or date matches search AND status matches filter
    return (typeMatches || dateMatches) && statusMatches;
  });

  // Add this useEffect to monitor filter changes
  useEffect(() => {
    console.log("Search Query:", searchQuery);
    console.log("Status Filter:", statusFilter);
    console.log("Filtered Complaints:", filteredComplaints);
  }, [searchQuery, statusFilter, recentComplaints]);

  if (!user) {
    return <div className="dashboard-content">Loading user profile...</div>;
  }

  return (
    <>
      <IonCardHeader>
        <IonCardTitle>Your Recent Complaints</IonCardTitle>
        <div className="filter-container">
          <IonItem>
            <IonLabel position="stacked">Search</IonLabel>
            <IonInput
              value={searchQuery}
              onIonChange={(e) => {
                const value = e.detail.value || "";
                console.log("Search value:", value);
                setSearchQuery(value);
              }}
              placeholder="Search by type or date..."
              debounce={300}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Status</IonLabel>
            <IonSelect
              value={statusFilter}
              onIonChange={(e) => {
                const value = e.detail.value;
                console.log("Status value:", value);
                setStatusFilter(value);
              }}
            >
              <IonSelectOption value="all">All Status</IonSelectOption>
              <IonSelectOption value="pending">Pending</IonSelectOption>
              <IonSelectOption value="processing">Processing</IonSelectOption>
              <IonSelectOption value="resolved">Resolved</IonSelectOption>
              <IonSelectOption value="rejected">Rejected</IonSelectOption>
            </IonSelect>
          </IonItem>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint: any) => (
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
                          : complaint.status === "rejected"
                          ? "danger"
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
              <IonLabel>
                {recentComplaints.length > 0
                  ? "No complaints match your filters"
                  : "No complaints found"}
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

      <IonToast
        isOpen={!!showToast}
        message={showToast?.message}
        duration={3000}
        color={showToast?.success ? "success" : "danger"}
        onDidDismiss={() => setShowToast(null)}
      />
    </>
  );
};

export default TicketContainer;
