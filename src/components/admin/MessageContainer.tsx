"use client";

import { useState, useEffect, useRef } from "react";
import {
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonAvatar,
  IonTextarea,
  IonSpinner,
  IonToast,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonBadge,
  IonContent,
  IonModal,
} from "@ionic/react";
import {
  sendOutline,
  checkmarkOutline,
  checkmarkDoneOutline,
  timeOutline,
  personCircleOutline,
  arrowBackOutline,
} from "ionicons/icons";
import "./MessageContainer.css"; // Import your CSS styles

// Base URL for API calls
const API_BASE_URL = "http://localhost/justify/index.php";

interface User {
  id: number;
  name: string;
  email: string;
  hasUnreadMessages: boolean;
  lastMessageTime?: string;
}

interface Message {
  id: number;
  text: string;
  senderId: number;
  isAdmin: boolean;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

const MessageContainer: React.FC = () => {
  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  // State for messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showChatModal, setShowChatModal] = useState(false);

  // References
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Admin ID (should be set from auth context or localStorage)
  const [adminId, setAdminId] = useState<number | null>(null);

  // Get admin ID on component mount
  useEffect(() => {
    // In a real app, you'd get this from your auth system
    const storedAdminId = parseInt(localStorage.getItem("adminId") || "0");
    if (storedAdminId) {
      setAdminId(storedAdminId);
    } else {
      // For demo purposes - set a default admin ID
      setAdminId(1);
      localStorage.setItem("adminId", "1");
    }
  }, []);

  // Fetch users when component mounts or adminId changes
  useEffect(() => {
    if (adminId) {
      fetchUsers();
    }
  }, [adminId]);

  // Filter users when searchQuery changes
  useEffect(() => {
    if (users.length > 0) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format timestamps for last user activity
  const formatLastActivity = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? "minute" : "minutes"
      } ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Format message timestamps
  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get appropriate icon for message status
  const getMessageStatusIcon = (status: "sent" | "delivered" | "read") => {
    switch (status) {
      case "sent":
        return <IonIcon icon={timeOutline} color="medium" />;
      case "delivered":
        return <IonIcon icon={checkmarkOutline} color="primary" />;
      case "read":
        return <IonIcon icon={checkmarkDoneOutline} color="success" />;
      default:
        return null;
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    if (!adminId) {
      setError("Admin not logged in");
      setLoadingUsers(false);
      return;
    }

    try {
      setLoadingUsers(true);

      const response = await fetch(
        `${API_BASE_URL}/UserController/getAllUsers`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        setUsers(data.users);
        setFilteredUsers(data.users);
        setError(null);
      } else {
        setError(data.message || "Failed to load users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");

      // For demo purposes - create some sample users
      const sampleUsers: User[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          hasUnreadMessages: true,
          lastMessageTime: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          hasUnreadMessages: false,
          lastMessageTime: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 3,
          name: "Bob Johnson",
          email: "bob@example.com",
          hasUnreadMessages: true,
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
      setUsers(sampleUsers);
      setFilteredUsers(sampleUsers);
      setError(null);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Handle user selection to open chat
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setMessages([]);
    setConversationId(null);
    setShowChatModal(true);
    fetchConversation(user.id);
  };

  // Go back to user list from chat view
  const handleBackToUsers = () => {
    setShowChatModal(false);
  };

  // Fetch conversation with a specific user
  const fetchConversation = async (userId: number) => {
    if (!adminId) {
      setError("Admin not logged in");
      return;
    }

    try {
      setLoadingMessages(true);
      setError(null);

      // First, try the direct endpoint if available
      const response = await fetch(
        `${API_BASE_URL}/MessageController/getConversation/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!response.ok) {
        // Fall back to the POST method if direct endpoint fails
        const postResponse = await fetch(
          `${API_BASE_URL}/MessageController/getConversation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
            body: JSON.stringify({
              adminId,
              userId,
            }),
          }
        );

        if (!postResponse.ok) {
          throw new Error(
            `Error ${postResponse.status}: ${postResponse.statusText}`
          );
        }

        const data = await postResponse.json();

        if (data.status) {
          // Handle different API response formats
          const messages = data.messages || data.data;
          const conversationId = data.conversationId || data.conversation_id;

          setMessages(messages);
          setConversationId(conversationId);
        } else {
          setError(data.message || "Failed to load conversation");
        }
      } else {
        // Handle successful direct endpoint response
        const data = await response.json();

        if (data.status) {
          const messages = data.messages || data.data;
          const conversationId = data.conversationId || data.conversation_id;

          setMessages(messages);
          setConversationId(conversationId);
        } else {
          setError(data.message || "Failed to load conversation");
        }
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setError("Failed to load conversation. Please try again.");

      // For demo purposes - create some sample messages
      const sampleMessages: Message[] = [
        {
          id: 1,
          text: "Hello, I need help with my account",
          senderId: selectedUser?.id || 0,
          isAdmin: false,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: "read",
        },
        {
          id: 2,
          text: "Hi there! How can I assist you today?",
          senderId: adminId || 0,
          isAdmin: true,
          timestamp: new Date(Date.now() - 3500000).toISOString(),
          status: "read",
        },
        {
          id: 3,
          text: "I can't access my dashboard",
          senderId: selectedUser?.id || 0,
          isAdmin: false,
          timestamp: new Date(Date.now() - 3400000).toISOString(),
          status: "read",
        },
      ];
      setMessages(sampleMessages);
      setConversationId(1);
      setError(null);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !adminId || !selectedUser || sending) {
      return;
    }

    const tempId = Date.now(); // Temporary ID for optimistic UI update
    const tempMessage: Message = {
      id: tempId,
      text: newMessage,
      senderId: adminId,
      isAdmin: true,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    try {
      setSending(true);

      // Optimistically update UI
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");

      // Scroll to bottom immediately
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Prepare message data in both formats to ensure compatibility
      const messageData = {
        adminId,
        userId: selectedUser.id,
        text: tempMessage.text,
        conversationId,
        // Additional fields for alternative API format
        user_id: selectedUser.id,
        message: tempMessage.text,
        is_admin: 1, // 1 for admin
      };

      const response = await fetch(
        `${API_BASE_URL}/MessageController/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        // Handle both response formats
        const serverMessage = data.data;
        const newConversationId = data.data.id;

        // Replace temp message with real message from server
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...(serverMessage || msg),
                  isAdmin: true,
                }
              : msg
          )
        );

        // If this is the first message in a conversation, store the new conversation ID
        if (!conversationId && newConversationId) {
          setConversationId(newConversationId);
        }
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove the optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(tempMessage.text); // Restore the message text

      setToastMessage("Failed to send message. Please try again.");
      setShowToast(true);
    } finally {
      setSending(false);
    }
  };

  // Admin view (see all users and chat with them)
  return (
    <>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="top"
      />

      {/* Always show the user list view */}
      <div className="user-list-container">
        <div className="search-container">
          <IonSearchbar
            value={searchQuery}
            onIonChange={(e) => setSearchQuery(e.detail.value!)}
            placeholder="Search users..."
            debounce={300}
            className="user-searchbar"
          />
        </div>

        {loadingUsers ? (
          <div className="loading-container">
            <IonSpinner />
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
            <IonButton onClick={fetchUsers}>Try Again</IonButton>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-container">
            <p>No users found</p>
            {searchQuery && (
              <IonButton fill="clear" onClick={() => setSearchQuery("")}>
                Clear Search
              </IonButton>
            )}
          </div>
        ) : (
          <div className="user-list-wrapper">
            <p className="users-count">{filteredUsers.length} users</p>
            <IonList className="user-list">
              {filteredUsers.map((user) => (
                <IonItem
                  key={user.id}
                  button
                  detail={true}
                  onClick={() => handleUserSelect(user)}
                  className="user-item"
                >
                  <IonAvatar slot="start" className="user-avatar">
                    <IonIcon
                      icon={personCircleOutline}
                      color={user.hasUnreadMessages ? "primary" : "medium"}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </IonAvatar>
                  <IonLabel>
                    <h2>{user.name}</h2>
                    <p>{user.email}</p>
                    <p className="last-activity">
                      {user.lastMessageTime
                        ? `Last active: ${formatLastActivity(
                            user.lastMessageTime
                          )}`
                        : "No activity yet"}
                    </p>
                  </IonLabel>
                  {user.hasUnreadMessages && (
                    <IonBadge color="primary" slot="end">
                      NEW
                    </IonBadge>
                  )}
                </IonItem>
              ))}
            </IonList>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      <IonModal
        isOpen={showChatModal}
        onDidDismiss={() => {
          setShowChatModal(false);
          // Optional: reset states when modal is fully closed
          // setSelectedUser(null);
          // setMessages([]);
          // setConversationId(null);
        }}
        className="chat-modal"
      >
        {selectedUser && (
          <div className="chat-view-container">
            <div className="chat-header">
              <IonButton
                fill="clear"
                onClick={handleBackToUsers}
                className="back-button"
              >
                <IonIcon slot="icon-only" icon={arrowBackOutline} />
              </IonButton>
              <div className="user-info">
                <h2>{selectedUser.name}</h2>
                <p>{selectedUser.email}</p>
              </div>
            </div>

            <div className="messages-area">
              {loadingMessages ? (
                <div className="loading-container">
                  <IonSpinner />
                  <p>Loading conversation...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p>{error}</p>
                  <IonButton onClick={() => fetchConversation(selectedUser.id)}>
                    Try Again
                  </IonButton>
                </div>
              ) : messages.length === 0 ? (
                <div className="empty-container">
                  <p>No messages yet with this user.</p>
                  <p>Type below to start a conversation!</p>
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
                        {!message.isAdmin && (
                          <IonAvatar className="message-avatar">
                            <IonIcon
                              icon={personCircleOutline}
                              color="medium"
                              style={{ width: "100%", height: "100%" }}
                            />
                          </IonAvatar>
                        )}
                        <div className="message-bubble">
                          <div className="message-text">{message.text}</div>
                        </div>
                      </div>
                      <div className="message-meta">
                        {formatMessageTime(message.timestamp)}
                        {message.isAdmin &&
                          getMessageStatusIcon(message.status)}
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            <div className="input-area">
              <div className="message-input-container">
                <IonTextarea
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onIonChange={(e) => setNewMessage(e.detail.value!)}
                  autoGrow={true}
                  rows={1}
                  maxlength={500}
                  disabled={loadingMessages || !adminId || sending}
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
                    !newMessage.trim() || loadingMessages || !adminId || sending
                  }
                >
                  <IonIcon slot="icon-only" icon={sendOutline} />
                </IonButton>
              </div>
            </div>
          </div>
        )}
      </IonModal>
    </>
  );
};

export default MessageContainer;
