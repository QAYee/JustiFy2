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
  imageOutline,
} from "ionicons/icons";

// Add these interfaces before the component
// Types and Interfaces
interface Complaint {
  id: number;
  complainant: string;
  respondent: string;
  details: string;
  incident_date: string;
  status:
    | "New"
    | "Under review"
    | "In progress"
    | "Resolved"
    | "Closed"
    | "Rejected";
  type: string;
  user_id: number;
  created_at: string;
  image?: string;
}

interface SelectedComplaint extends Complaint {
  messages?: Message[];
}

interface StatusOption {
  value: Complaint["status"];
  label: string;
  color: string;
  icon: string;
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

// Status Options Configuration
const STATUS_OPTIONS: StatusOption[] = [
  { value: "New", label: "New", color: "warning", icon: timeOutline },
  {
    value: "In progress",
    label: "In Progress",
    color: "tertiary",
    icon: timeOutline,
  },
  {
    value: "Under review",
    label: "Under Review",
    color: "primary",
    icon: timeOutline,
  },
  {
    value: "Resolved",
    label: "Resolved",
    color: "success",
    icon: checkmarkCircleOutline,
  },
  {
    value: "Closed",
    label: "Closed",
    color: "medium",
    icon: checkmarkCircleOutline,
  },
  {
    value: "Rejected",
    label: "Rejected",
    color: "danger",
    icon: closeCircleOutline,
  },
];

// Complaint Details Component
const ComplaintDetails: React.FC<{
  selectedComplaint: SelectedComplaint | null;
  handleStatusUpdate: (id: number, status: Complaint["status"]) => void;
  getStatusChip: (status: Complaint["status"]) => JSX.Element;
  formatDate: (date: string) => string;
}> = ({ selectedComplaint, handleStatusUpdate, getStatusChip, formatDate }) => {
  if (!selectedComplaint) return null;

  const renderStatusActions = () => {
    // Only show status updates for complaints that aren't Resolved, Closed, or Rejected
    if (["Resolved", "Closed", "Rejected"].includes(selectedComplaint.status)) {
      return null;
    }

    // Find available next statuses based on current status
    const currentStatusIndex = STATUS_OPTIONS.findIndex(
      (option) => option.value === selectedComplaint.status
    );

    return (
      <div className="status-update-container">
        <h3 className="status-update-title">Update Status</h3>
        <div className="status-buttons-container">
          {STATUS_OPTIONS.map((status) => {
            // Don't show the current status
            if (status.value === selectedComplaint.status) {
              return null;
            }

            // Skip "New" as an option since it's the initial state
            if (status.value === "New") {
              return null;
            }

            return (
              <IonButton
                key={status.value}
                size="small"
                color={status.color}
                className="status-button"
                onClick={() =>
                  handleStatusUpdate(selectedComplaint.id, status.value)
                }
              >
                <IonIcon slot="start" icon={status.icon} />
                {status.label}
              </IonButton>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <IonCardHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <IonCardTitle>Complaint #{selectedComplaint.id}</IonCardTitle>
          {getStatusChip(selectedComplaint.status)}
        </div>
      </IonCardHeader>
      <IonCardContent>
        <div className="complaint-details">
          <p>
            <strong>Type:</strong> {selectedComplaint.type}
          </p>
          <p>
            <strong>Complainant:</strong> {selectedComplaint.complainant}
          </p>
          <p>
            <strong>Respondent:</strong> {selectedComplaint.respondent}
          </p>
          <p>
            <strong>Details:</strong> {selectedComplaint.details}
          </p>
          <p>
            <strong>Incident Date:</strong>{" "}
            {formatDate(selectedComplaint.incident_date)}
          </p>

          {selectedComplaint.image && (
            <div className="attachment-container">
              <p>
                <strong>Attachment:</strong>
              </p>
              <div className="image-container">
                <img
                  src={`http://127.0.0.1/justify/uploads/complaints/${selectedComplaint.image}`}
                  alt="Complaint attachment"
                  className="complaint-image"
                />
              </div>
            </div>
          )}
        </div>

        {renderStatusActions()}
      </IonCardContent>
    </>
  );
};

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
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusComplaint, setSelectedStatusComplaint] =
    useState<Complaint | null>(null);

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

        // Also update the selected complaint if it's the one being updated
        if (selectedComplaint && selectedComplaint.id === complaintId) {
          setSelectedComplaint({
            ...selectedComplaint,
            status: newStatus,
          });
        }

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

          // Convert filter and status to lowercase for case-insensitive comparison
          const filterLower = filter.toLowerCase();
          const statusLower = complaint.status.toLowerCase();

          // Handle mapping for specific statuses
          if (filterLower === "new" && statusLower === "new") return true;
          if (filterLower === "under review" && statusLower === "under review")
            return true;
          if (filterLower === "in progress" && statusLower === "in progress")
            return true;
          if (filterLower === "resolved" && statusLower === "resolved")
            return true;
          if (filterLower === "closed" && statusLower === "closed") return true;
          if (filterLower === "rejected" && statusLower === "rejected")
            return true;

          return false;
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

  // Improved getStatusChip function using STATUS_OPTIONS
  const getStatusChip = (status: Complaint["status"]) => {
    const statusOption = STATUS_OPTIONS.find(
      (option) => option.value.toLowerCase() === status?.toLowerCase()
    );

    if (statusOption) {
      return (
        <IonBadge color={statusOption.color}>{statusOption.label}</IonBadge>
      );
    }

    // Default fallback
    return <IonBadge color="medium">{status || "Unknown"}</IonBadge>;
  };

  // Helper function for formatting dates
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

  // Get complaint counts by status
  const getComplaintCounts = () => {
    const counts: Record<string, number> = {
      New: 0,
      "Under review": 0,
      "In progress": 0,
      Resolved: 0,
      Closed: 0,
      Rejected: 0,
      total: complaints.length,
    };

    complaints.forEach((complaint) => {
      if (complaint.status && counts.hasOwnProperty(complaint.status)) {
        counts[complaint.status]++;
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

    // Don't allow sending messages if complaint is resolved, closed, or rejected
    if (["Resolved", "Closed", "Rejected"].includes(selectedComplaint.status)) {
      setToast({
        message:
          "Cannot send messages to resolved, closed, or rejected complaints",
        color: "warning",
      });
      return;
    }

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
            user_id: 2, // Replace with actual admin ID
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

  useEffect(() => {
    if (selectedComplaint) {
      fetchMessages(selectedComplaint.id);
    } else {
      setMessages([]);
    }
  }, [selectedComplaint]);

  // Add this effect to auto-update status when a "New" complaint is selected
  useEffect(() => {
    if (selectedComplaint && selectedComplaint.status === "New") {
      handleStatusUpdate(selectedComplaint.id, "In progress");
    }
  }, [selectedComplaint?.id]);

  return (
    <IonContent className="ion-padding" color="light">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      {toast && (
        <IonToast
          isOpen={!!toast}
          message={toast.message}
          duration={3000}
          color={toast.color || "primary"}
          onDidDismiss={() => setToast(null)}
        />
      )}

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
          {Object.entries(getComplaintCounts())
            .filter(([status]) => status !== "total")
            .map(([status, count]) => {
              const statusOption = STATUS_OPTIONS.find(
                (option) => option.value === status
              );

              return statusOption ? (
                <IonChip key={status} color={statusOption.color}>
                  <IonIcon icon={statusOption.icon} />
                  <IonLabel>
                    {statusOption.label}: {count}
                  </IonLabel>
                </IonChip>
              ) : null;
            })}
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
            style={{ width: "100%" }}
            className="status-segment"
            scrollable={true}
            value={filter}
            onIonChange={(e) => setFilter(e.detail.value as string)}
          >
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            {STATUS_OPTIONS.map((option) => (
              <IonSegmentButton key={option.value} value={option.value}>
                <IonLabel>{option.label}</IonLabel>
              </IonSegmentButton>
            ))}
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
              <IonItemSliding key={complaint.id} className="complaint-item">
                <IonItem
                  detail
                  button
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    fetchMessages(complaint.id);
                  }}
                  className="complaint-content"
                >
                  <IonLabel className="ion-text-wrap">
                    <h2
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "4px",
                      }}
                    >
                      <span style={{ wordBreak: "break-word" }}>
                        {complaint.type}
                      </span>
                      <IonBadge color="medium">#{complaint.id}</IonBadge>
                      {complaint.image && (
                        <IonIcon
                          icon={imageOutline}
                          style={{
                            marginLeft: "8px",
                            fontSize: "1.1em",
                            verticalAlign: "middle",
                          }}
                        />
                      )}
                    </h2>
                    <h3 style={{ whiteSpace: "normal", overflow: "visible" }}>
                      Complainant: {complaint.complainant}
                    </h3>
                    <p style={{ whiteSpace: "normal", overflow: "visible" }}>
                      <strong>Respondent:</strong> {complaint.respondent}
                    </p>
                    <p style={{ whiteSpace: "normal", overflow: "visible" }}>
                      <strong>Date:</strong>
                      <IonChip
                        color="medium"
                        outline={true}
                        style={{ margin: "2px 0" }}
                      >
                        <IonIcon icon={timeOutline} />
                        <span style={{ padding: "0 4px" }}>
                          {formatDate(complaint.incident_date)}
                        </span>
                      </IonChip>
                    </p>
                    <p style={{ whiteSpace: "normal", overflow: "visible" }}>
                      <strong>Status:</strong> {getStatusChip(complaint.status)}
                    </p>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  {!["Resolved", "Closed", "Rejected"].includes(
                    complaint.status
                  ) && (
                    <IonItemOption
                      color="primary"
                      onClick={() =>
                        handleStatusUpdate(complaint.id, "Under review")
                      }
                      title="Under Review"
                    >
                      <div className="ion-item-option-content">
                        <IonIcon icon={timeOutline} />
                        <span className="ion-hide-sm-down">Review</span>
                      </div>
                    </IonItemOption>
                  )}
                  {!["Closed", "Rejected"].includes(complaint.status) && (
                    <IonItemOption
                      color="tertiary"
                      onClick={() =>
                        handleStatusUpdate(complaint.id, "In progress")
                      }
                      title="In Progress"
                    >
                      <div className="ion-item-option-content">
                        <IonIcon icon={timeOutline} />
                        <span className="ion-hide-sm-down">Progress</span>
                      </div>
                    </IonItemOption>
                  )}
                  {!["Closed", "Rejected"].includes(complaint.status) && (
                    <>
                      <IonItemOption
                        color="success"
                        onClick={() =>
                          handleStatusUpdate(complaint.id, "Resolved")
                        }
                        title="Resolve"
                      >
                        <div className="ion-item-option-content">
                          <IonIcon icon={checkmarkCircleOutline} />
                          <span className="ion-hide-sm-down">Resolve</span>
                        </div>
                      </IonItemOption>
                      <IonItemOption
                        color="danger"
                        onClick={() =>
                          handleStatusUpdate(complaint.id, "Rejected")
                        }
                        title="Reject"
                      >
                        <div className="ion-item-option-content">
                          <IonIcon icon={closeCircleOutline} />
                          <span className="ion-hide-sm-down">Reject</span>
                        </div>
                      </IonItemOption>
                    </>
                  )}
                  {complaint.status === "Resolved" && (
                    <IonItemOption
                      color="medium"
                      onClick={() => handleStatusUpdate(complaint.id, "Closed")}
                      title="Close"
                    >
                      <div className="ion-item-option-content">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <span className="ion-hide-sm-down">Close</span>
                      </div>
                    </IonItemOption>
                  )}
                  <IonItemOption color="primary" title="Email">
                    <div className="ion-item-option-content">
                      <IonIcon icon={mailOutline} />
                      <span className="ion-hide-sm-down">Email</span>
                    </div>
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

        <IonContent className="ion-padding">
          <IonCard>
            <ComplaintDetails
              selectedComplaint={selectedComplaint}
              handleStatusUpdate={handleStatusUpdate}
              getStatusChip={getStatusChip}
              formatDate={formatDate}
            />
          </IonCard>

          <div className="chat-container" style={{ padding: "16px" }}>
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      msg.sender === "admin" ? "flex-end" : "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor:
                        msg.sender === "admin" ? "#007aff" : "#333",
                      color: msg.sender === "admin" ? "#fff" : "#e4e4e4",
                      borderRadius: "12px",
                      padding: "8px 12px",
                      maxWidth: "70%",
                      wordBreak: "break-word",
                    }}
                  >
                    <p style={{ margin: "0 0 4px 0" }}>
                      {msg.message || msg.text || ""}
                    </p>
                    <small
                      style={{
                        fontSize: "0.75rem",
                        color: "#666",
                        display: "block",
                        textAlign: "right",
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                No messages yet. Start the conversation!
              </div>
            )}

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
                ["Resolved", "Closed", "Rejected"].includes(
                  selectedComplaint?.status || ""
                )
                  ? "Chat disabled for this complaint"
                  : "Type your message..."
              }
              value={newMessage}
              onIonChange={(e) => setNewMessage(e.detail.value!)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={["Resolved", "Closed", "Rejected"].includes(
                selectedComplaint?.status || ""
              )}
            />
            <IonButton
              onClick={handleSendMessage}
              disabled={
                ["Resolved", "Closed", "Rejected"].includes(
                  selectedComplaint?.status || ""
                ) || !newMessage.trim()
              }
            >
              <IonIcon icon={sendOutline} />
            </IonButton>
          </IonItem>
        </IonFooter>
      </IonModal>
    </IonContent>
  );
};

export default ComplainContainer;
