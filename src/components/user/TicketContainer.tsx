"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonInput,
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
  IonFab,
  IonFabButton,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonAvatar,
} from "@ionic/react"
import {
  ticketOutline,
  addOutline,
  closeOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
  sendOutline,
} from "ionicons/icons"

interface Ticket {
  id: number
  title: string
  description: string
  date: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  category: string
  assignedTo?: string
  messages: {
    sender: string
    message: string
    timestamp: string
    isAdmin?: boolean
  }[]
}

const TicketContainer: React.FC<{ name: string }> = ({ name }) => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchText, setSearchText] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [showNewTicketModal, setShowNewTicketModal] = useState(false)
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)

  // New ticket form state
  const [newTicketTitle, setNewTicketTitle] = useState("")
  const [newTicketDescription, setNewTicketDescription] = useState("")
  const [newTicketCategory, setNewTicketCategory] = useState("")
  const [newTicketPriority, setNewTicketPriority] = useState<"low" | "medium" | "high">("medium")

  // Dummy tickets data
  const dummyTickets: Ticket[] = [
    {
      id: 2001,
      title: "Water Service Interruption",
      description: "No water supply in our area for 3 days now. Please advise when this will be resolved.",
      date: "2023-10-15",
      status: "in-progress",
      priority: "high",
      category: "Utilities",
      assignedTo: "Water Services Department",
      messages: [
        {
          sender: "Juan Dela Cruz",
          message: "No water supply in our area for 3 days now. Please advise when this will be resolved.",
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
          message: "Thank you for the update. Please keep me informed of any changes.",
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
      description: "The street light near our house has been out for a week, making the area unsafe at night.",
      date: "2023-10-10",
      status: "open",
      priority: "medium",
      category: "Infrastructure",
      messages: [
        {
          sender: "Maria Garcia",
          message: "The street light near our house has been out for a week, making the area unsafe at night.",
          timestamp: "2023-10-10 06:45 PM",
        },
      ],
    },
    {
      id: 2003,
      title: "Garbage Collection Issue",
      description: "Garbage has not been collected in our street for two weeks now.",
      date: "2023-10-05",
      status: "resolved",
      priority: "high",
      category: "Sanitation",
      assignedTo: "Waste Management Department",
      messages: [
        {
          sender: "Roberto Reyes",
          message: "Garbage has not been collected in our street for two weeks now.",
          timestamp: "2023-10-05 08:20 AM",
        },
        {
          sender: "Barangay Admin",
          message: "We have notified the waste management department about this issue.",
          timestamp: "2023-10-05 09:45 AM",
          isAdmin: true,
        },
        {
          sender: "Barangay Admin",
          message: "The waste management department has scheduled collection for tomorrow morning.",
          timestamp: "2023-10-06 03:30 PM",
          isAdmin: true,
        },
        {
          sender: "Roberto Reyes",
          message: "The garbage has been collected. Thank you for your assistance.",
          timestamp: "2023-10-07 10:15 AM",
        },
        {
          sender: "Barangay Admin",
          message: "You're welcome. We're glad the issue has been resolved. We're marking this ticket as resolved.",
          timestamp: "2023-10-07 11:30 AM",
          isAdmin: true,
        },
      ],
    },
  ]

  useEffect(() => {
    // Simulate API call to fetch tickets
    const fetchTickets = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTickets(dummyTickets)
      setLoading(false)
    }

    fetchTickets()
  }, [])

  const handleOpenTicketDetail = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowTicketDetailModal(true)
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return

    const updatedTicket = {
      ...selectedTicket,
      messages: [
        ...selectedTicket.messages,
        {
          sender: "Juan Dela Cruz", // Hardcoded for demo
          message: newMessage,
          timestamp: new Date().toLocaleString(),
        },
      ],
    }

    setTickets(tickets.map((ticket) => (ticket.id === selectedTicket.id ? updatedTicket : ticket)))

    setSelectedTicket(updatedTicket)
    setNewMessage("")
  }

  const handleCreateTicket = () => {
    if (!newTicketTitle.trim() || !newTicketDescription.trim() || !newTicketCategory) {
      // Show validation error
      return
    }

    const newTicket: Ticket = {
      id: Math.max(...tickets.map((t) => t.id), 0) + 1,
      title: newTicketTitle,
      description: newTicketDescription,
      date: new Date().toISOString().split("T")[0],
      status: "open",
      priority: newTicketPriority,
      category: newTicketCategory,
      messages: [
        {
          sender: "Juan Dela Cruz", // Hardcoded for demo
          message: newTicketDescription,
          timestamp: new Date().toLocaleString(),
        },
      ],
    }

    setTickets([newTicket, ...tickets])
    setShowNewTicketModal(false)

    // Reset form
    setNewTicketTitle("")
    setNewTicketDescription("")
    setNewTicketCategory("")
    setNewTicketPriority("medium")
  }

  const getFilteredTickets = () => {
    let filtered = [...tickets]

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === filter)
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.category.toLowerCase().includes(searchLower),
      )
    }

    return filtered
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case "open":
        return (
          <IonChip color="primary" outline={true}>
            <IonIcon icon={hourglassOutline} />
            Open
          </IonChip>
        )
      case "in-progress":
        return (
          <IonChip color="warning" outline={true}>
            <IonIcon icon={timeOutline} />
            In Progress
          </IonChip>
        )
      case "resolved":
        return (
          <IonChip color="success" outline={true}>
            <IonIcon icon={checkmarkCircleOutline} />
            Resolved
          </IonChip>
        )
      case "closed":
        return (
          <IonChip color="medium" outline={true}>
            <IonIcon icon={closeCircleOutline} />
            Closed
          </IonChip>
        )
      default:
        return <IonChip>Unknown</IonChip>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <IonBadge color="success">Low</IonBadge>
      case "medium":
        return <IonBadge color="warning">Medium</IonBadge>
      case "high":
        return <IonBadge color="danger">High</IonBadge>
      default:
        return <IonBadge color="medium">Unknown</IonBadge>
    }
  }

  return (
    <>
      <IonContent className="ion-padding" color="light">
       
          <IonCardHeader>
            <IonCardTitle>My Tickets</IonCardTitle>
            <IonCardSubtitle>Track and manage your support requests</IonCardSubtitle>
          </IonCardHeader>
            <IonCardContent>
            <IonSearchbar
              value={searchText}
              onIonChange={(e) => setSearchText(e.detail.value!)}
              placeholder="Search tickets"
              animated
              style={{ padding: '0', marginBottom: '10px' }}
            />

            <IonSegment 
              value={filter} 
              onIonChange={(e) => setFilter(e.detail.value!)}
              scrollable={true}
              style={{ width: '100%', minWidth: '100%' }}
            >
              <IonSegmentButton value="all" style={{ minWidth: 'auto' }}>
              <IonLabel>All</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="open" style={{ minWidth: 'auto' }}>
              <IonLabel>Open</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="in-progress" style={{ minWidth: 'auto' }}>
              <IonLabel>In Progress</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="resolved" style={{ minWidth: 'auto' }}>
              <IonLabel>Resolved</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            </IonCardContent>
       

        <IonList>
          {loading ? (
            <IonItem>
              <IonLabel className="ion-text-center">Loading tickets...</IonLabel>
            </IonItem>
          ) : getFilteredTickets().length > 0 ? (
            getFilteredTickets().map((ticket) => (
              <IonCard key={ticket.id} button onClick={() => handleOpenTicketDetail(ticket)}>
                <IonCardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <IonCardTitle style={{ fontSize: "16px" }}>{ticket.title}</IonCardTitle>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <IonCardSubtitle style={{ marginTop: "8px" }}>
                    Ticket #{ticket.id} • {ticket.date}
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ marginBottom: "12px", fontSize: "14px" }}>
                    {ticket.description.length > 100
                      ? `${ticket.description.substring(0, 100)}...`
                      : ticket.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <IonChip outline={true} color="medium">
                      <IonIcon icon={ticketOutline} />
                      <IonLabel>{ticket.category}</IonLabel>
                    </IonChip>
                    {getStatusChip(ticket.status)}
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <IonItem>
              <IonLabel className="ion-text-center">No tickets found matching your criteria.</IonLabel>
            </IonItem>
          )}
        </IonList>

        {/* New Ticket Modal */}
        <IonModal isOpen={showNewTicketModal} onDidDismiss={() => setShowNewTicketModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Create New Ticket</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowNewTicketModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonInput
                value={newTicketTitle}
                onIonChange={(e) => setNewTicketTitle(e.detail.value!)}
                placeholder="Brief description of the issue"
                required
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Category</IonLabel>
              <IonSelect
                value={newTicketCategory}
                onIonChange={(e) => setNewTicketCategory(e.detail.value)}
                placeholder="Select category"
              >
                <IonSelectOption value="Utilities">Utilities</IonSelectOption>
                <IonSelectOption value="Infrastructure">Infrastructure</IonSelectOption>
                <IonSelectOption value="Sanitation">Sanitation</IonSelectOption>
                <IonSelectOption value="Security">Security</IonSelectOption>
                <IonSelectOption value="Other">Other</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Priority</IonLabel>
              <IonSelect value={newTicketPriority} onIonChange={(e) => setNewTicketPriority(e.detail.value)}>
                <IonSelectOption value="low">Low</IonSelectOption>
                <IonSelectOption value="medium">Medium</IonSelectOption>
                <IonSelectOption value="high">High</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={newTicketDescription}
                onIonChange={(e) => setNewTicketDescription(e.detail.value!)}
                placeholder="Detailed description of the issue"
                rows={6}
                required
              />
            </IonItem>

            <IonButton expand="block" className="ion-margin-top" onClick={handleCreateTicket}>
              Submit Ticket
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Ticket Detail Modal */}
        <IonModal isOpen={showTicketDetailModal} onDidDismiss={() => setShowTicketDetailModal(false)}>
          {selectedTicket && (
            <>
              <IonHeader>
                <IonToolbar color="primary">
                  <IonTitle>Ticket #{selectedTicket.id}</IonTitle>
                  <IonButton slot="end" fill="clear" onClick={() => setShowTicketDetailModal(false)}>
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </IonToolbar>
              </IonHeader>
              <IonContent className="ion-padding">
                <IonCard>
                  <IonCardHeader>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                        <strong>Status:</strong> {getStatusChip(selectedTicket.status)}
                      </p>
                      {selectedTicket.assignedTo && (
                        <p>
                          <strong>Assigned To:</strong> {selectedTicket.assignedTo}
                        </p>
                      )}
                    </div>

                    <h3 style={{ borderBottom: "1px solid #eee", paddingBottom: "8px", marginBottom: "16px" }}>
                      Conversation
                    </h3>

                    <div style={{ marginBottom: "16px" }}>
                      {selectedTicket.messages.map((message, index) => (
                        <div
                          key={index}
                          style={{
                            marginBottom: "16px",
                            display: "flex",
                            flexDirection: message.isAdmin ? "row-reverse" : "row",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <IonAvatar style={{ width: "36px", height: "36px" }}>
                            <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="" />
                          </IonAvatar>
                          <div
                            style={{
                              background: message.isAdmin ? "#e1f5fe" : "#f5f5f5",
                              padding: "12px",
                              borderRadius: "12px",
                              maxWidth: "80%",
                            }}
                          >
                            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                              {message.sender}
                              {message.isAdmin && (
                                <IonBadge color="primary" style={{ marginLeft: "8px", fontSize: "10px" }}>
                                  Staff
                                </IonBadge>
                              )}
                            </div>
                            <div style={{ marginBottom: "4px" }}>{message.message}</div>
                            <div style={{ fontSize: "12px", color: "#666", textAlign: "right" }}>
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <IonTextarea
                          placeholder="Type your message here..."
                          value={newMessage}
                          onIonChange={(e) => setNewMessage(e.detail.value!)}
                          rows={2}
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

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowNewTicketModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </>
  )
}

export default TicketContainer

