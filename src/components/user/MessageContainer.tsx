"use client";

import { useState, useEffect, useRef } from "react";
import {
  IonContent,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonAvatar,
  IonTextarea,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import {
  sendOutline,
  checkmarkOutline,
  checkmarkDoneOutline,
  timeOutline,
  personCircleOutline,
} from "ionicons/icons";
import "./MessageContainer.css";

// Base URL for API calls
const API_BASE_URL = "http://localhost/justify/index.php";

interface Message {
  id: number;
  text: string;
  senderId: number;
  isAdmin: boolean;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

const MessageContainer: React.FC<{ name: string }> = ({ name }) => {
  // State declarations
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  /**
   * Gets the current user ID from various storage locations and authentication methods
   * @returns The user ID if found, or null if not authenticated
   */
  const getCurrentUserId = (): number | null => {
    try {
      // 1. Check localStorage for common user data patterns
      const storageKeys = ["userData", "user", "authUser", "currentUser"];
      for (const key of storageKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          // Check for ID in various property names
          if (parsed.id) return parsed.id;
          if (parsed.userId) return parsed.userId;
          if (parsed.user_id) return parsed.user_id;
          // Check if user info is nested
          if (parsed.user && parsed.user.id) return parsed.user.id;
          if (parsed.data && parsed.data.id) return parsed.data.id;
        }
      }

      // 2. Check sessionStorage as fallback
      for (const key of storageKeys) {
        const data = sessionStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.id) return parsed.id;
          if (parsed.userId) return parsed.userId;
          if (parsed.user_id) return parsed.user_id;
          if (parsed.user && parsed.user.id) return parsed.user.id;
          if (parsed.data && parsed.data.id) return parsed.data.id;
        }
      }

      // 3. Check for direct ID storage
      const directId =
        localStorage.getItem("userId") ||
        localStorage.getItem("user_id") ||
        sessionStorage.getItem("userId") ||
        sessionStorage.getItem("user_id");
      if (directId) return parseInt(directId, 10);

      // 4. Check for JWT tokens and decode if found
      const tokenKeys = ["token", "accessToken", "jwt", "authToken"];
      for (const key of tokenKeys) {
        const token = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (token) {
          try {
            // JWT format: header.payload.signature
            const parts = token.split(".");
            if (parts.length === 3) {
              const payload = parts[1];
              const decodedPayload = JSON.parse(atob(payload));

              // Common JWT user ID fields
              if (decodedPayload.sub) return parseInt(decodedPayload.sub, 10);
              if (decodedPayload.id) return decodedPayload.id;
              if (decodedPayload.userId) return decodedPayload.userId;
              if (decodedPayload.user_id) return decodedPayload.user_id;
            }
          } catch (e) {
            console.warn("Failed to decode JWT token:", e);
            // Continue checking other tokens
          }
        }
      }

      // 5. Look for user ID in URL parameters (some systems pass it this way)
      const urlParams = new URLSearchParams(window.location.search);
      const urlUserId = urlParams.get("userId") || urlParams.get("user_id");
      if (urlUserId) return parseInt(urlUserId, 10);

      // No user ID found
      console.log("No user ID found in any storage location");
      return null;
    } catch (e) {
      console.error("Error getting current user ID:", e);
      return null;
    }
  };

  // Get current user ID once (not on every render)
  const currentUserId = getCurrentUserId();

  // Fetch conversation and messages
  const fetchMessages = async () => {
    if (!currentUserId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/MessageController/getConversation/${currentUserId}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        setConversationId(data.conversation_id);
        setMessages(data.messages);
        setError(null);
      } else {
        setError(data.message || "Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || sending) {
      return;
    }

    setSending(true);

    try {
      const messageData = {
        user_id: currentUserId,
        message: newMessage.trim(),
        is_admin: 0, // 0 for regular user
      };

      const response = await fetch(
        `${API_BASE_URL}/MessageController/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        // Add the new message to the list
        setMessages((prevMessages) => [...prevMessages, data.data]);
        setNewMessage("");

        // Scroll to bottom
        setTimeout(() => scrollToBottom(), 100);
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setToastMessage("Failed to send message. Please try again.");
      setShowToast(true);
    } finally {
      setSending(false);
    }
  };

  // Update message status
  const updateMessageStatus = async (messageId: number, status: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/MessageController/updateMessageStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message_id: messageId,
            status: status,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to update message status: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();

    // Set up polling for new messages every 10 seconds
    const intervalId = setInterval(() => {
      if (!loading && conversationId) {
        fetchMessages();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = () => {
    if (!currentUserId) {
      setToastMessage("You must be logged in to send messages");
      setShowToast(true);
      return;
    }

    sendMessage();
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <IonIcon icon={checkmarkOutline} color="medium" />;
      case "delivered":
        return <IonIcon icon={checkmarkDoneOutline} color="medium" />;
      case "read":
        return <IonIcon icon={checkmarkDoneOutline} color="primary" />;
      default:
        return <IonIcon icon={timeOutline} color="medium" />;
    }
  };

  return (
    <div className="chat-container-wrapper">
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="top"
      />

      <div className="chat-content-area">
        <IonCardHeader>
          <IonCardTitle>Chat with Admin</IonCardTitle>
        </IonCardHeader>

        <IonCardContent>
          {loading ? (
            <div className="loading-container">
              <IonSpinner />
              <p>Loading conversation...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
              <IonButton onClick={fetchMessages}>Try Again</IonButton>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-container">
              <p>No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <div className="message-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-wrapper ${
                    message.isAdmin ? "admin" : "user"
                  }`}
                >
                  <div className="message-content">
                    {message.isAdmin && (
                      <IonAvatar className="message-avatar">
                        <IonIcon
                          icon={personCircleOutline}
                          size="large"
                          color="primary"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </IonAvatar>
                    )}
                    <div className="message-bubble">
                      {message.isAdmin && <strong>Admin</strong>}
                      <div>{message.text}</div>
                    </div>
                  </div>
                  <div className="message-meta">
                    {formatMessageTime(message.timestamp)}
                    {!message.isAdmin && getMessageStatusIcon(message.status)}
                  </div>
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>
          )}
        </IonCardContent>
      </div>

      <div className="fixed-input-container">
        <div className="message-input-container">
          <IonTextarea
            className="message-input"
            placeholder="Type a message..."
            value={newMessage}
            onIonChange={(e) => setNewMessage(e.detail.value!)}
            autoGrow={true}
            rows={1}
            maxlength={500}
            disabled={loading || !currentUserId || sending}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <IonButton
            className="send-button"
            fill="clear"
            onClick={handleSendMessage}
            disabled={
              !newMessage.trim() || loading || !currentUserId || sending
            }
          >
            <IonIcon slot="icon-only" icon={sendOutline} />
          </IonButton>
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
