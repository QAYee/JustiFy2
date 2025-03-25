"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonAvatar,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonSearchbar,
  IonBadge,
  IonButton,
  IonChip,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
} from "@ionic/react"
import {
  mailOutline,
  mailOpenOutline,
  trashOutline,
  alertCircleOutline,
  informationCircleOutline,
  addOutline,
  sendOutline,
  peopleOutline,
  flagOutline,
} from "ionicons/icons"

interface Message {
  id: number
  sender: string
  subject: string
  preview: string
  date: string
  read: boolean
  avatar?: string
  type: "complaint" | "system" | "alert" | "user"
  important?: boolean
  category?: string
}

interface ContainerProps {
  name: string
}

const InboxContainer: React.FC<ContainerProps> = ({ name }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [searchText, setSearchText] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Dummy messages data for admin
  const dummyMessages: Message[] = [
    {
      id: 1,
      sender: "System",
      subject: "New Complaint Submitted",
      preview: "A new noise complaint #1001 has been submitted by Juan Dela Cruz and requires your attention.",
      date: "2023-10-16",
      read: false,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "complaint",
      important: true,
      category: "Noise Complaint",
    },
    {
      id: 2,
      sender: "Maria Garcia",
      subject: "Question about Complaint Status",
      preview: "I submitted a complaint last week but haven't received any updates. Could you please check the status?",
      date: "2023-10-15",
      read: true,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "user",
    },
    {
      id: 3,
      sender: "System",
      subject: "Alert: Multiple Similar Complaints",
      preview: "Multiple complaints about water service interruption have been received in the last 24 hours.",
      date: "2023-10-14",
      read: false,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "alert",
      important: true,
      category: "Utility Issue",
    },
    {
      id: 4,
      sender: "Roberto Reyes",
      subject: "Request for Meeting",
      preview: "I would like to schedule a meeting to discuss the environmental concerns in our area.",
      date: "2023-10-13",
      read: true,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "user",
    },
    {
      id: 5,
      sender: "System",
      subject: "Weekly Report Available",
      preview: "The weekly complaint statistics report is now available for review.",
      date: "2023-10-12",
      read: true,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "system",
    },
    {
      id: 6,
      sender: "System",
      subject: "New User Registration",
      preview: "A new user has registered and requires approval: Elena Santos.",
      date: "2023-10-11",
      read: false,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "system",
    },
    {
      id: 7,
      sender: "Barangay Captain",
      subject: "Upcoming Staff Meeting",
      preview: "Please be reminded of our monthly staff meeting on October 20, 2023 at 9:00 AM.",
      date: "2023-10-10",
      read: true,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "system",
    },
  ]

  useEffect(() => {
    // Simulate API call to fetch messages
    const fetchMessages = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessages(dummyMessages)
      setLoading(false)
    }

    fetchMessages()
  }, [])

  const handleRefresh = async (event: CustomEvent) => {
    // Simulate refreshing data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setMessages(dummyMessages)
    event.detail.complete()
  }

  const markAsRead = (id: number) => {
    setMessages(messages.map((message) => (message.id === id ? { ...message, read: true } : message)))
  }

  const deleteMessage = (id: number) => {
    setMessages(messages.filter((message) => message.id !== id))
  }

  const getFilteredMessages = () => {
    let filtered = [...messages]

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((message) => message.type === filter)
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (message) =>
          message.subject.toLowerCase().includes(searchLower) ||
          message.sender.toLowerCase().includes(searchLower) ||
          message.preview.toLowerCase().includes(searchLower) ||
          (message.category && message.category.toLowerCase().includes(searchLower)),
      )
    }

    return filtered
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "complaint":
        return flagOutline
      case "system":
        return informationCircleOutline
      case "alert":
        return alertCircleOutline
      case "user":
        return peopleOutline
      default:
        return mailOutline
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "complaint":
        return "primary"
      case "system":
        return "tertiary"
      case "alert":
        return "danger"
      case "user":
        return "success"
      default:
        return "medium"
    }
  }

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            Admin Inbox
            <IonBadge color="primary" style={{ marginLeft: "8px" }}>
              {messages.filter((m) => !m.read).length}
            </IonBadge>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonSearchbar
            value={searchText}
            onIonChange={(e) => setSearchText(e.detail.value!)}
            placeholder="Search messages"
            animated
          />

          <IonSegment value={filter} onIonChange={(e) => setFilter(e.detail.value!)}>
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="complaint">
              <IonLabel>Complaints</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="user">
              <IonLabel>Users</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="system">
              <IonLabel>System</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", marginBottom: "16px" }}>
            <IonChip outline={true}>
              Unread
              <IonBadge color="primary" style={{ marginLeft: "8px" }}>
                {messages.filter((m) => !m.read).length}
              </IonBadge>
            </IonChip>
            <IonChip outline={true} color="danger">
              Important
              <IonBadge color="danger" style={{ marginLeft: "8px" }}>
                {messages.filter((m) => m.important).length}
              </IonBadge>
            </IonChip>
            <IonButton size="small" fill="clear">
              Mark All Read
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>

      <IonList>
        {loading ? (
          <IonItem>
            <IonLabel className="ion-text-center">Loading messages...</IonLabel>
          </IonItem>
        ) : getFilteredMessages().length > 0 ? (
          getFilteredMessages().map((message) => (
            <IonItemSliding key={message.id}>
              <IonItem button onClick={() => markAsRead(message.id)}>
                <IonAvatar slot="start">
                  <img alt="" src={message.avatar || "https://ionicframework.com/docs/img/demos/avatar.svg"} />
                </IonAvatar>
                <IonLabel>
                  <h2 style={{ fontWeight: message.read ? "normal" : "bold" }}>
                    {message.subject}
                    {message.important && (
                      <IonBadge color="danger" style={{ marginLeft: "8px", fontSize: "10px" }}>
                        Important
                      </IonBadge>
                    )}
                  </h2>
                  <h3>From: {message.sender}</h3>
                  <p>{message.preview}</p>
                  <p style={{ fontSize: "12px", color: "#666" }}>
                    {message.date}
                    {message.category && (
                      <IonChip
                        size="small"
                        color="medium"
                        outline={true}
                        style={{ marginLeft: "8px", height: "20px", fontSize: "10px" }}
                      >
                        {message.category}
                      </IonChip>
                    )}
                  </p>
                </IonLabel>
                {!message.read && (
                  <IonBadge color="primary" slot="end">
                    New
                  </IonBadge>
                )}
                <IonIcon
                  color={getTypeColor(message.type)}
                  icon={getTypeIcon(message.type)}
                  slot="end"
                  style={{ fontSize: "24px" }}
                />
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption color="success">
                  <IonIcon slot="icon-only" icon={sendOutline} />
                </IonItemOption>
                <IonItemOption color={message.read ? "primary" : "tertiary"} onClick={() => markAsRead(message.id)}>
                  <IonIcon slot="icon-only" icon={message.read ? mailOutline : mailOpenOutline} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={() => deleteMessage(message.id)}>
                  <IonIcon slot="icon-only" icon={trashOutline} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))
        ) : (
          <IonItem>
            <IonLabel className="ion-text-center">No messages found</IonLabel>
          </IonItem>
        )}
      </IonList>

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
    </>
  )
}

export default InboxContainer

