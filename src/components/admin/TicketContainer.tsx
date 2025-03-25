"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonButton,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonChip,
  IonBadge,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonAvatar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import {
  ticketOutline,
  closeOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
  sendOutline,
} from "ionicons/icons";

interface Ticket {
  id: number;
  title: string;
  description: string;
  date: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  category: string;
  assignedTo?: string;
  createdBy: {
    name: string;
    id: number;
    contact?: string;
  };
  messages: {
    sender: string;
    message: string;
    timestamp: string;
    isAdmin?: boolean;
  }[];
}

const TicketContainer: React.FC<{ name: string }> = ({ name }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<string | number>("all");
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [assignee, setAssignee] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Dummy tickets data for admin
  const dummyTickets: Ticket[] = [
    {
      id: 2001,
      title: "Water Service Interruption",
      description:
        "No water supply in our area for 3 days now. Please advise when this will be resolved.",
      date: "2023-10-15",
      status: "in-progress",
      priority: "high",
      category: "Utilities",
      assignedTo: "Water Services Department",
      createdBy: {
        name: "Juan Dela Cruz",
        id: 1001,
        contact: "+63 912 345 6789",
      },
      messages: [
        {
          sender: "Juan Dela Cruz",
          message:
            "No water supply in our area for 3 days now. Please advise when this will be resolved.",
          timestamp: "2023-10-15 09:30 AM",
        },
        {
          sender: "Barangay Admin",
          message:
            "We have contacted the water district office and they are working on the issue. They estimate it will be fixed by tomorrow.",
          timestamp: "2023-10-15 11:45 AM",
          isAdmin: true,
        },
        {
          sender: "Juan Dela Cruz",
          message:
            "Thank you for the update. Please keep me informed of any changes.",
          timestamp: "2023-10-15 12:30 PM",
        },
        {
          sender: "Barangay Admin",
          message:
            "The water district has informed us that they are still working on the main pipe. They now estimate completion by tomorrow evening.",
          timestamp: "2023-10-16 10:15 AM",
          isAdmin: true,
        },
      ],
    },
    {
      id: 2002,
      title: "Street Light Not Working",
      description:
        "The street light near our house has been out for a week, making the area unsafe at night.",
      date: "2023-10-10",
      status: "open",
      priority: "medium",
      category: "Infrastructure",
      createdBy: {
        name: "Maria Garcia",
        id: 1002,
        contact: "+63 923 456 7890",
      },
      messages: [
        {
          sender: "Maria Garcia",
          message:
            "The street light near our house has been out for a week, making the area unsafe at night.",
          timestamp: "2023-10-10 06:45 PM",
        },
      ],
    },
    {
      id: 2003,
      title: "Garbage Collection Issue",
      description:
        "Garbage has not been collected in our street for two weeks now.",
      date: "2023-10-05",
      status: "resolved",
      priority: "high",
      category: "Sanitation",
      assignedTo: "Waste Management Department",
      createdBy: {
        name: "Roberto Reyes",
        id: 1003,
        contact: "+63 934 567 8901",
      },
      messages: [
        {
          sender: "Roberto Reyes",
          message:
            "Garbage has not been collected in our street for two weeks now.",
          timestamp: "2023-10-05 08:20 AM",
        },
        {
          sender: "Barangay Admin",
          message:
            "We have notified the waste management department about this issue.",
          timestamp: "2023-10-05 09:45 AM",
          isAdmin: true,
        },
        {
          sender: "Barangay Admin",
          message:
            "The waste management department has scheduled collection for tomorrow morning.",
          timestamp: "2023-10-06 03:30 PM",
          isAdmin: true,
        },
        {
          sender: "Roberto Reyes",
          message:
            "The garbage has been collected. Thank you for your assistance.",
          timestamp: "2023-10-07 10:15 AM",
        },
        {
          sender: "Barangay Admin",
          message:
            "You're welcome. We're glad the issue has been resolved. We're marking this ticket as resolved.",
          timestamp: "2023-10-07 11:30 AM",
          isAdmin: true,
        },
      ],
    },
    {
      id: 2004,
      title: "Noise Complaint",
      description:
        "Excessive noise from construction site during early morning hours.",
      date: "2023-10-12",
      status: "open",
      priority: "medium",
      category: "Disturbance",
      createdBy: {
        name: "Elena Santos",
        id: 1004,
        contact: "+63 945 678 9012",
      },
      messages: [
        {
          sender: "Elena Santos",
          message:
            "There is excessive noise from the construction site starting at 5 AM. This is too early and disturbing residents.",
          timestamp: "2023-10-12 08:15 AM",
        },
      ],
    },
    {
      id: 2005,
      title: "Stray Dogs in the Area",
      description:
        "Several stray dogs in our neighborhood posing risk to children.",
      date: "2023-10-08",
      status: "in-progress",
      priority: "high",
      category: "Animal Control",
      assignedTo: "Animal Welfare Department",
      createdBy: {
        name: "Antonio Villanueva",
        id: 1005,
        contact: "+63 956 789 0123",
      },
      messages: [
        {
          sender: "Antonio Villanueva",
          message:
            "There are several stray dogs in our neighborhood that are aggressive and pose a risk to children walking to school.",
          timestamp: "2023-10-08 09:20 AM",
        },
        {
          sender: "Barangay Admin",
          message:
            "We have notified the animal welfare department. They will send a team to assess the situation.",
          timestamp: "2023-10-08 11:30 AM",
          isAdmin: true,
        },
        {
          sender: "Barangay Admin",
          message:
            "The animal welfare team is scheduled to visit your area tomorrow morning.",
          timestamp: "2023-10-09 02:45 PM",
          isAdmin: true,
        },
      ],
    },
  ];

  // Department options for assignment
  const departments = [
    "Water Services Department",
    "Infrastructure Department",
    "Waste Management Department",
    "Public Safety Department",
    "Animal Welfare Department",
    "General Administration",
  ];

  useEffect(() => {
    // Simulate API call to fetch tickets
    const fetchTickets = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTickets(dummyTickets);
      setLoading(false);
    };

    fetchTickets();
  }, []);

  const handleOpenTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setAssignee(ticket.assignedTo || "");
    setShowTicketDetailModal(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          sender: "Barangay Admin", // Hardcoded for demo
          message: newMessage,
          timestamp: new Date().toLocaleString(),
          isAdmin: true,
        },
      ],
    };

    setTickets(
      tickets.map((ticket) =>
        ticket.id === selectedTicket.id ? updatedTicket : ticket
      )
    );

    setSelectedTicket(updatedTicket);
    setNewMessage("");
  };

  const handleUpdateStatus = (
    ticketId: number,
    newStatus: "open" | "in-progress" | "resolved" | "closed"
  ) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );

    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const handleAssignTicket = () => {
    if (!selectedTicket || !assignee) return;

    const updatedTicket = {
      ...selectedTicket,
      assignedTo: assignee,
      status:
        selectedTicket.status === "open"
          ? "in-progress"
          : selectedTicket.status,
      messages: [
        ...selectedTicket.messages,
        {
          sender: "Barangay Admin",
          message: `This ticket has been assigned to ${assignee}.`,
          timestamp: new Date().toLocaleString(),
          isAdmin: true,
        },
      ],
    };

    setTickets(
      tickets.map((ticket) =>
        ticket.id === selectedTicket.id ? updatedTicket : ticket
      )
    );

    setSelectedTicket(updatedTicket);
  };

  const getFilteredTickets = () => {
    let filtered = [...tickets];

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === filter);
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (ticket) => ticket.category === categoryFilter
      );
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.category.toLowerCase().includes(searchLower) ||
          ticket.createdBy.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const getStatusChip = (
    status: "open" | "in-progress" | "resolved" | "closed"
  ) => {
    switch (status) {
      case "open":
        return (
          <IonChip color="primary" outline={true}>
            <IonIcon icon={hourglassOutline} />
            Open
          </IonChip>
        );
      case "in-progress":
        return (
          <IonChip color="warning" outline={true}>
            <IonIcon icon={timeOutline} />
            In Progress
          </IonChip>
        );
      case "resolved":
        return (
          <IonChip color="success" outline={true}>
            <IonIcon icon={checkmarkCircleOutline} />
            Resolved
          </IonChip>
        );
      case "closed":
        return (
          <IonChip color="medium" outline={true}>
            <IonIcon icon={closeCircleOutline} />
            Closed
          </IonChip>
        );
      default:
        return <IonChip>Unknown</IonChip>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <IonBadge color="success">Low</IonBadge>;
      case "medium":
        return <IonBadge color="warning">Medium</IonBadge>;
      case "high":
        return <IonBadge color="danger">High</IonBadge>;
      default:
        return <IonBadge color="medium">Unknown</IonBadge>;
    }
  };

  // Get unique categories from tickets
  const categories = [
    "all",
    ...new Set(tickets.map((ticket) => ticket.category)),
  ];

  return (
    <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Ticket Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" color="light">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Support Tickets</IonCardTitle>
            <IonCardSubtitle>
              Manage and respond to community support requests
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span>Total Tickets</span>
                      <strong>{tickets.length}</strong>
                    </div>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <IonChip color="primary">
                      <IonLabel>
                        Open:{" "}
                        {tickets.filter((t) => t.status === "open").length}
                      </IonLabel>
                    </IonChip>
                    <IonChip color="warning">
                      <IonLabel>
                        In Progress:{" "}
                        {
                          tickets.filter((t) => t.status === "in-progress")
                            .length
                        }
                      </IonLabel>
                    </IonChip>
                    <IonChip color="success">
                      <IonLabel>
                        Resolved:{" "}
                        {tickets.filter((t) => t.status === "resolved").length}
                      </IonLabel>
                    </IonChip>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonSearchbar
              value={searchText}
              onIonChange={(e) => setSearchText(e.detail.value!)}
              placeholder="Search tickets"
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
              <IonSelect
                interface="popover"
                placeholder="Filter by Category"
                value={categoryFilter}
                onIonChange={(e) => setCategoryFilter(e.detail.value)}
                style={{ maxWidth: "200px" }}
              >
                <IonSelectOption value="all">All Categories</IonSelectOption>
                {categories
                  .filter((cat) => cat !== "all")
                  .map((category) => (
                    <IonSelectOption key={category} value={category}>
                      {category}
                    </IonSelectOption>
                  ))}
              </IonSelect>

              <IonSelect
                interface="popover"
                placeholder="Sort by"
                style={{ maxWidth: "150px" }}
              >
                <IonSelectOption value="date-desc">
                  Newest First
                </IonSelectOption>
                <IonSelectOption value="date-asc">Oldest First</IonSelectOption>
                <IonSelectOption value="priority">Priority</IonSelectOption>
              </IonSelect>
            </div>

            <IonSegment
              value={filter}
              onIonChange={(e) => setFilter(String(e.detail.value!))}
            >
              <IonSegmentButton value="all">
                <IonLabel>All</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="open">
                <IonLabel>Open</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="in-progress">
                <IonLabel>In Progress</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="resolved">
                <IonLabel>Resolved</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonCardContent>
        </IonCard>

        <IonList>
          {loading ? (
            <IonItem>
              <IonLabel className="ion-text-center">
                Loading tickets...
              </IonLabel>
            </IonItem>
          ) : getFilteredTickets().length > 0 ? (
            getFilteredTickets().map((ticket) => (
              <IonItemSliding key={ticket.id}>
                <IonItem button onClick={() => handleOpenTicketDetail(ticket)}>
                  <IonIcon
                    icon={ticketOutline}
                    slot="start"
                    color={
                      ticket.priority === "high"
                        ? "danger"
                        : ticket.priority === "medium"
                        ? "warning"
                        : "success"
                    }
                  />
                  <IonLabel>
                    <h2>
                      {ticket.title}{" "}
                      <IonBadge color="medium">#{ticket.id}</IonBadge>
                    </h2>
                    <h3>From: {ticket.createdBy.name}</h3>
                    <p>
                      {ticket.category} • {ticket.date}
                    </p>
                    <p>
                      {getStatusChip(ticket.status)}{" "}
                      {getPriorityBadge(ticket.priority)}
                    </p>
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  {ticket.status === "open" && (
                    <IonItemOption
                      color="warning"
                      onClick={() =>
                        handleUpdateStatus(ticket.id, "in-progress")
                      }
                    >
                      <IonIcon slot="icon-only" icon={timeOutline} />
                    </IonItemOption>
                  )}
                  {(ticket.status === "open" ||
                    ticket.status === "in-progress") && (
                    <IonItemOption
                      color="success"
                      onClick={() => handleUpdateStatus(ticket.id, "resolved")}
                    >
                      <IonIcon slot="icon-only" icon={checkmarkCircleOutline} />
                    </IonItemOption>
                  )}
                  {ticket.status !== "closed" && (
                    <IonItemOption
                      color="medium"
                      onClick={() => handleUpdateStatus(ticket.id, "closed")}
                    >
                      <IonIcon slot="icon-only" icon={closeCircleOutline} />
                    </IonItemOption>
                  )}
                </IonItemOptions>
              </IonItemSliding>
            ))
          ) : (
            <IonItem>
              <IonLabel className="ion-text-center">
                No tickets found matching your criteria.
              </IonLabel>
            </IonItem>
          )}
        </IonList>

        {/* Ticket Detail Modal */}
        <IonModal
          isOpen={showTicketDetailModal}
          onDidDismiss={() => setShowTicketDetailModal(false)}
        >
          {selectedTicket && selectedTicket.status !== "closed" && (
            <>
              <IonHeader>
                <IonToolbar color="primary">
                  <IonTitle>Ticket #{selectedTicket.id}</IonTitle>
                  <IonButton
                    slot="end"
                    fill="clear"
                    onClick={() => setShowTicketDetailModal(false)}
                  >
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </IonToolbar>
              </IonHeader>
              <IonContent className="ion-padding">
                <IonCard>
                  <IonCardHeader>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <IonCardTitle>{selectedTicket.title}</IonCardTitle>
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                    <IonCardSubtitle style={{ marginTop: "8px" }}>
                      {selectedTicket.category} • {selectedTicket.date}
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <div style={{ marginBottom: "16px" }}>
                      <p>
                        <strong>Status:</strong>{" "}
                        {getStatusChip(selectedTicket.status)}
                      </p>
                      <p>
                        <strong>Created By:</strong>{" "}
                        {selectedTicket.createdBy.name}
                      </p>
                      {selectedTicket.createdBy.contact && (
                        <p>
                          <strong>Contact:</strong>{" "}
                          {selectedTicket.createdBy.contact}
                        </p>
                      )}
                      <p>
                        <strong>Description:</strong>{" "}
                        {selectedTicket.description}
                      </p>
                      {selectedTicket.assignedTo && (
                        <p>
                          <strong>Assigned To:</strong>{" "}
                          {selectedTicket.assignedTo}
                        </p>
                      )}
                    </div>

                    {/* Assignment Section */}
                    {(selectedTicket.status === "open" ||
                      selectedTicket.status === "in-progress") && (
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                        }}
                      >
                        <h3 style={{ marginTop: "0", marginBottom: "12px" }}>
                          Assign Ticket
                        </h3>
                        <IonItem>
                          <IonLabel position="stacked">
                            Assign To Department
                          </IonLabel>
                          <IonSelect
                            value={assignee}
                            onIonChange={(e) => setAssignee(e.detail.value)}
                            placeholder="Select department"
                          >
                            {departments.map((dept) => (
                              <IonSelectOption key={dept} value={dept}>
                                {dept}
                              </IonSelectOption>
                            ))}
                          </IonSelect>
                        </IonItem>
                        <IonButton
                          expand="block"
                          className="ion-margin-top"
                          onClick={handleAssignTicket}
                          disabled={
                            !assignee || assignee === selectedTicket.assignedTo
                          }
                        >
                          {selectedTicket.assignedTo
                            ? "Reassign Ticket"
                            : "Assign Ticket"}
                        </IonButton>
                      </div>
                    )}

                    {/* Status Update Section */}
                    {selectedTicket.status !== "closed" && (
                      <div
                        style={{
                          marginBottom: "16px",
                          padding: "12px",
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                        }}
                      >
                        <h3 style={{ marginTop: "0", marginBottom: "12px" }}>
                          Update Status
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {selectedTicket.status !== "open" && (
                            <IonButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleUpdateStatus(selectedTicket.id, "open")
                              }
                            >
                              <IonIcon slot="start" icon={hourglassOutline} />
                              Mark as Open
                            </IonButton>
                          )}
                          {selectedTicket.status !== "in-progress" && (
                            <IonButton
                              size="small"
                              color="warning"
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedTicket.id,
                                  "in-progress"
                                )
                              }
                            >
                              <IonIcon slot="start" icon={timeOutline} />
                              Mark as In Progress
                            </IonButton>
                          )}
                          {selectedTicket.status !== "resolved" && (
                            <IonButton
                              size="small"
                              color="success"
                              onClick={() =>
                                handleUpdateStatus(
                                  selectedTicket.id,
                                  "resolved"
                                )
                              }
                            >
                              <IonIcon
                                slot="start"
                                icon={checkmarkCircleOutline}
                              />
                              Mark as Resolved
                            </IonButton>
                          )}
                          {selectedTicket.status !== "closed" && (
                            <IonButton
                              size="small"
                              color="medium"
                              onClick={() =>
                                handleUpdateStatus(selectedTicket.id, "closed")
                              }
                            >
                              <IonIcon slot="start" icon={closeCircleOutline} />
                              Close Ticket
                            </IonButton>
                          )}
                        </div>
                      </div>
                    )}

                    <h3
                      style={{
                        borderBottom: "1px solid #eee",
                        paddingBottom: "8px",
                        marginBottom: "16px",
                      }}
                    >
                      Conversation
                    </h3>

                    <div style={{ marginBottom: "16px" }}>
                      {selectedTicket.messages.map((message, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: "16px",
                            display: "flex",
                            flexDirection: message.isAdmin
                              ? "row-reverse"
                              : "row",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <IonAvatar style={{ width: "36px", height: "36px" }}>
                            <img
                              src="https://ionicframework.com/docs/img/demos/avatar.svg"
                              alt=""
                            />
                          </IonAvatar>
                          <div
                            style={{
                              background: message.isAdmin
                                ? "#e1f5fe"
                                : "#f5f5f5",
                              padding: "12px",
                              borderRadius: "12px",
                              maxWidth: "80%",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "4px",
                              }}
                            >
                              {message.sender}
                              {message.isAdmin && (
                                <IonBadge
                                  color="primary"
                                  style={{
                                    marginLeft: "8px",
                                    fontSize: "10px",
                                  }}
                                >
                                  Staff
                                </IonBadge>
                              )}
                            </div>
                            <div style={{ marginBottom: "4px" }}>
                              {message.message}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                textAlign: "right",
                              }}
                            >
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedTicket && selectedTicket.status !== "closed" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <IonTextarea
                          placeholder="Type your response here..."
                          value={newMessage}
                          onIonChange={(e) => setNewMessage(e.detail.value!)}
                          rows={3}
                          style={{ flex: 1 }}
                        />
                        <IonButton onClick={handleSendMessage}>
                          <IonIcon icon={sendOutline} />
                        </IonButton>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonContent>
            </>
          )}
        </IonModal>
      </IonContent>
    </>
  );
};

export default TicketContainer;
