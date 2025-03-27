"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonToast,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonSearchbar,
  IonIcon,
  IonChip,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonAvatar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonFooter,
  IonInput,
  IonButton,
} from "@ionic/react";
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  mailOutline,
  sendOutline,
} from "ionicons/icons";

const ComplainContainer: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [selectedComplaint, setSelectedComplaint] =
    useState<SelectedComplaint | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://127.0.0.1/justify/index.php/ComplaintController/getAllComplaints`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status && Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      } else {
        setComplaints([]);
        setError(data.message || "No complaints found");
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch complaints"
      );
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRefresh = async (event: CustomEvent) => {
    try {
      await fetchComplaints();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh complaints"
      );
    } finally {
      event.detail.complete();
    }
  };

  const handleInfiniteScroll = async (event: CustomEvent) => {
    // Simulate loading more data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    event.detail.complete();
  };

  const handleStatusUpdate = async (
    complaintId: number,
    newStatus: Complaint["status"]
  ) => {
    try {
      const response = await fetch(
        `http://127.0.0.1/justify/index.php/ComplaintController/updateStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            complaint_id: complaintId,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (data.status) {
        // Update the complaint in the local state
        setComplaints((prevComplaints) =>
          prevComplaints.map((complaint) =>
            complaint.id === complaintId
              ? { ...complaint, status: newStatus }
              : complaint
          )
        );

        setToast({
          message: `Status updated to ${newStatus}`,
          color: "success",
        });
      } else {
        throw new Error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to update status",
        color: "danger",
      });
    }
  };

  const getFilteredComplaints = () => {
    try {
      let filtered = [...complaints];

      // Apply status filter
      if (filter && filter !== "all") {
        filtered = filtered.filter((complaint) => {
          // Handle potential undefined or null status
          if (!complaint.status) return false;
          return complaint.status.toLowerCase() === filter.toLowerCase();
        });
      }

      // Apply search filter
      if (searchText) {
        const searchTerms = searchText.toLowerCase().split(" ");
        filtered = filtered.filter((complaint) => {
          const searchableFields = [
            complaint.complainant || "",
            complaint.respondent || "",
            complaint.details || "",
            complaint.type || "",
            complaint.id?.toString() || "",
            formatDate(complaint.incident_date) || "",
          ].map((field) => field.toLowerCase());

          // Match all search terms (AND search)
          return searchTerms.every((term) =>
            searchableFields.some((field) => field.includes(term))
          );
        });
      }

      // Apply sorting with error handling
      if (sortBy) {
        filtered.sort((a, b) => {
          try {
            switch (sortBy) {
              case "date":
                const dateA = new Date(a.created_at || "").getTime();
                const dateB = new Date(b.created_at || "").getTime();
                return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA;

              case "name":
                return (a.complainant || "").localeCompare(b.complainant || "");

              case "status":
                return (a.status || "").localeCompare(b.status || "");

              default:
                return 0;
            }
          } catch (error) {
            console.error("Sorting error:", error);
            return 0;
          }
        });
      }

      return filtered;
    } catch (error) {
      console.error("Error filtering complaints:", error);
      return [];
    }
  };

  const getStatusChip = (status: Complaint["status"]) => {
    switch (status) {
      case "pending":
        return <IonBadge color="warning">Pending</IonBadge>;
      case "processing":
        return <IonBadge color="primary">Processing</IonBadge>;
      case "resolved":
        return <IonBadge color="success">Resolved</IonBadge>;
      case "rejected":
        return <IonBadge color="danger">Rejected</IonBadge>;
      default:
        return <IonBadge color="medium">{status}</IonBadge>;
    }
  };

  // Add this helper function after your imports
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  // Add this function after the formatDate function
  const getComplaintCounts = () => {
    const counts = {
      pending: 0,
      processing: 0,
      resolved: 0,
      rejected: 0,
      total: complaints.length,
    };

    complaints.forEach((complaint) => {
      switch (complaint.status) {
        case "pending":
          counts.pending++;
          break;
        case "processing":
          counts.processing++;
          break;
        case "resolved":
          counts.resolved++;
          break;
        case "rejected":
          counts.rejected++;
          break;
      }
    });

    return counts;
  };

  const fetchMessages = async (complaintId: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1/justify/index.php/ChatController/getMessages/${complaintId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.status) {
        setMessages(data.messages);
      } else {
        throw new Error(data.message || "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setToast({
        message: "Failed to load messages",
        color: "danger",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedComplaint) return;

    try {
      const response = await fetch(
        `http://127.0.0.1/justify/index.php/ChatController/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            complaint_id: selectedComplaint.id,
            user_id: 1, // Replace with actual admin ID
            message: newMessage,
            sender: "admin",
          }),
        }
      );

      const data = await response.json();
      if (data.status) {
        setMessages([...messages, data.data]);
        setNewMessage("");
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setToast({
        message: "Failed to send message",
        color: "danger",
      });
    }
  };

  // Update the interface to match backend data
  interface Complaint {
    id: number;
    complainant: string;
    respondent: string;
    details: string;
    incident_date: string;
    status: "pending" | "processing" | "resolved" | "rejected";
    type: string;
    user_id: number;
    created_at: string;
  }

  interface ToastMessage {
    message: string;
    color?: string;
  }

  interface Message {
    message: string;
    id?: number;
    text: string;
    sender: "user" | "admin";
    timestamp: string;
    complaint_id?: number;
    user_id?: number;
  }

  interface SelectedComplaint extends Complaint {
    messages?: Message[];
  }

  useEffect(() => {
    if (selectedComplaint) {
      fetchMessages(selectedComplaint.id);
    } else {
      setMessages([]);
    }
  }, [selectedComplaint]);

  return (
    <IonContent className="ion-padding" color="light">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonCardHeader>
        <IonCardTitle>Complaints Dashboard</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {Object.entries(getComplaintCounts()).map(
            ([status, count]) =>
              status !== "total" && (
                <IonChip
                  key={status}
                  color={
                    status === "pending"
                      ? "warning"
                      : status === "processing"
                      ? "primary"
                      : status === "resolved"
                      ? "success"
                      : "danger"
                  }
                >
                  <IonLabel>
                    {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                  </IonLabel>
                </IonChip>
              )
          )}
        </div>

        <IonSearchbar
          value={searchText}
          onIonChange={(e) => setSearchText(e.detail.value!)}
          placeholder="Search complaints"
          animated
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <IonSegment
            value={filter}
            onIonChange={(e) => setFilter(e.detail.value as string)}
          >
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pending">
              <IonLabel>Pending</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="processing">
              <IonLabel>Processing</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="resolved">
              <IonLabel>Resolved</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "16px",
          }}
        >
          <IonSelect
            interface="popover"
            value={sortBy}
            onIonChange={(e) => setSortBy(e.detail.value)}
            placeholder="Sort by"
          >
            <IonSelectOption value="date">Date (Newest)</IonSelectOption>
            <IonSelectOption value="name">Complainant Name</IonSelectOption>
            <IonSelectOption value="status">Status</IonSelectOption>
          </IonSelect>
        </div>
      </IonCardContent>

      {loading && (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="dots" />
        </div>
      )}

      <IonToast
        isOpen={!!error}
        message={error || ""}
        duration={3000}
        color="danger"
        onDidDismiss={() => setError(null)}
      />

      {!loading && !error && (
        <IonList>
          {getFilteredComplaints().length > 0 ? (
            getFilteredComplaints().map((complaint) => (
              <IonItemSliding key={complaint.id}>
                <IonItem
                  detail
                  button
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    fetchMessages(complaint.id);
                  }}
                >
                  <IonLabel>
                    <h2>
                      {complaint.type}{" "}
                      <IonBadge color="medium">#{complaint.id}</IonBadge>
                    </h2>
                    <h3>Complainant: {complaint.complainant}</h3>
                    <p>
                      <strong>Respondent:</strong> {complaint.respondent}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      <IonChip color="medium" outline={true}>
                        <IonIcon icon={timeOutline} />
                        {formatDate(complaint.incident_date)}
                      </IonChip>
                    </p>
                    <p>
                      <strong>Status:</strong> {getStatusChip(complaint.status)}
                    </p>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  {complaint.status === "pending" && (
                    <IonItemOption
                      color="primary"
                      onClick={() =>
                        handleStatusUpdate(complaint.id, "processing")
                      }
                    >
                      <IonIcon slot="icon-only" icon={timeOutline} />
                    </IonItemOption>
                  )}
                  {(complaint.status === "pending" ||
                    complaint.status === "processing") && (
                    <>
                      <IonItemOption
                        color="success"
                        onClick={() =>
                          handleStatusUpdate(complaint.id, "resolved")
                        }
                      >
                        <IonIcon
                          slot="icon-only"
                          icon={checkmarkCircleOutline}
                        />
                      </IonItemOption>
                      <IonItemOption
                        color="danger"
                        onClick={() =>
                          handleStatusUpdate(complaint.id, "rejected")
                        }
                      >
                        <IonIcon slot="icon-only" icon={closeCircleOutline} />
                      </IonItemOption>
                    </>
                  )}
                  <IonItemOption color="primary">
                    <IonIcon slot="icon-only" icon={mailOutline} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))
          ) : (
            <IonItem>
              <IonLabel className="ion-text-center">
                No complaints found matching your criteria.
              </IonLabel>
            </IonItem>
          )}
        </IonList>
      )}

      <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
        <IonInfiniteScrollContent loadingText="Loading more complaints..."></IonInfiniteScrollContent>
      </IonInfiniteScroll>

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
                key={msg.id || index}
                className={`message ${
                  msg.sender === "user" ? "user-message" : "admin-message"
                }`}
              >
                <p>{msg.message || msg.text}</p>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
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
    </IonContent>
  );
};

export default ComplainContainer;
