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
  IonChip,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react"
import {
  mailOutline,
  mailOpenOutline,
  trashOutline,
  timeOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
} from "ionicons/icons"

interface Message {
  id: number
  sender: string
  subject: string
  preview: string
  date: string
  read: boolean
  avatar?: string
  type: "notification" | "update" | "alert" | "info"
  important?: boolean
}

interface ContainerProps {
  name: string
}

const InboxContainer: React.FC<ContainerProps> = ({ name }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [searchText, setSearchText] = useState("")
  const [loading, setLoading] = useState(true)

  // Dummy messages data
  const dummyMessages: Message[] = [
    {
      id: 1,
      sender: "Barangay Office",
      subject: "Complaint Status Update",
      preview: "Your complaint #1001 regarding noise disturbance has been received and is now being processed.",
      date: "2023-10-16",
      read: false,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "update",
      important: true,
    },
    {
      id: 2,
      sender: "Community Services",
      subject: "Free Medical Mission",
      preview:
        "Join us for the free medical mission on November 12, 2023. Services include general check-up, dental, and eye examination.",
      date: "2023-10-15",
      read: true,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "notification",
    },
    {
      id: 3,
      sender: "Barangay Captain",
      subject: "Important: Community Meeting",
      preview:
        "All residents are invited to attend the quarterly general assembly on November 5, 2023 at the Barangay Hall.",
      date: "2023-10-14",
      read: false,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "alert",
      important: true,
    },
    {
      id: 4,
      sender: "Water District Office",
      subject: "Water Service Interruption",
      preview:
        "Please be advised that there will be a scheduled water service interruption on October 20, 2023 from 10 AM to 3 PM.",
      date: "2023-10-13",
      read: true,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "info",
    },
    {
      id: 5,
      sender: "Barangay Office",
      subject: "Document Request Approved",
      preview: "Your request for a Barangay Clearance has been approved. You may claim it at the Barangay Hall.",
      date: "2023-10-12",
      read: true,
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      type: "update",
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
    if (!searchText) return messages

    const searchLower = searchText.toLowerCase()
    return messages.filter(
      (message) =>
        message.subject.toLowerCase().includes(searchLower) ||
        message.sender.toLowerCase().includes(searchLower) ||
        message.preview.toLowerCase().includes(searchLower),
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "notification":
        return informationCircleOutline
      case "update":
        return checkmarkCircleOutline
      case "alert":
        return alertCircleOutline
      case "info":
        return timeOutline
      default:
        return mailOutline
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "notification":
        return "primary"
      case "update":
        return "success"
      case "alert":
        return "danger"
      case "info":
        return "tertiary"
      default:
        return "medium"
    }
  }

  return (
    <>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

     
        <IonCardHeader>
          <IonCardTitle>
            Inbox
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

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", marginBottom: "16px" }}>
            <IonChip outline={true} color="primary">
              All Messages
            </IonChip>
            <IonChip outline={true}>
              Unread
              <IonBadge color="primary" style={{ marginLeft: "8px" }}>
                {messages.filter((m) => !m.read).length}
              </IonBadge>
            </IonChip>
            <IonChip outline={true}>
              Important
              <IonBadge color="danger" style={{ marginLeft: "8px" }}>
                {messages.filter((m) => m.important).length}
              </IonBadge>
            </IonChip>
          </div>
        </IonCardContent>
    

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
                  <h3>{message.sender}</h3>
                  <p>{message.preview}</p>
                  <p style={{ fontSize: "12px", color: "#666" }}>{message.date}</p>
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
                <IonItemOption color={message.read ? "primary" : "success"} onClick={() => markAsRead(message.id)}>
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
    </>
  )
}

export default InboxContainer

