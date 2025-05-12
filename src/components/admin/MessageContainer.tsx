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
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFooter,
  IonInput,
} from "@ionic/react";
import {
  sendOutline,
  checkmarkOutline,
  checkmarkDoneOutline,
  timeOutline,
  personCircleOutline,
  arrowBackOutline,
  chatbubbleOutline,
} from "ionicons/icons";
import "./MessageContainer.css"; // Import your CSS styles
import { data } from "cypress/types/jquery";

// Base URL for API calls
const API_BASE_URL = "https://justifi.animal911.me/Justify/index.php";

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
  const messagesAreaRef = useRef<HTMLDivElement>(null);

  // Admin ID (should be set from auth context or localStorage)
  const [adminId, setAdminId] = useState<number | null>(null);

  // Replace your adminId useEffect with this:
  useEffect(() => {
    // Try to get the admin ID from user info in localStorage
    try {
      const userInfoStr =
        localStorage.getItem("userInfo") || localStorage.getItem("user");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && (userInfo.id || userInfo.userId || userInfo.admin_id)) {
          const id = userInfo.id || userInfo.userId || userInfo.admin_id;
          setAdminId(parseInt(id, 10));
        } else {
          // For development purposes - set a default admin ID
          setAdminId(1);
          console.warn("Using default admin ID for development");
        }
      } else {
        console.error("No user info found in localStorage");
      }
    } catch (error) {
      console.error("Error parsing admin user info:", error);
      setError("Failed to get admin information");
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
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Add this effect to save messages in localStorage when they change
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      try {
        localStorage.setItem(
          `messages_${selectedUser.id}`,
          JSON.stringify(messages)
        );
      } catch (error) {
        console.error("Could not save messages to localStorage", error);
      }
    }
  }, [messages, selectedUser]);

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

      const apiUrl = `${API_BASE_URL}/UserController/getAllUsers`;
      console.log("Fetching users from:", apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log("Raw users response:", responseText);

      const data = responseText ? JSON.parse(responseText) : {};
      console.log("Parsed users data:", data);

      if (data.status && Array.isArray(data.users)) {
        const formattedUsers = data.users.map((user: any) => ({
          id: user.id,
          name: user.name || "Unknown User",
          email: user.email || "",
          hasUnreadMessages: user.has_unread_messages === 1,
          lastMessageTime: user.last_message_time || new Date().toISOString(),
        }));

        console.log("Formatted users:", formattedUsers);
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
        setError(null);
      } else {
        setUsers([]);
        setFilteredUsers([]);
        setError(data.message || "Failed to load users");
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      setUsers([]);
      setFilteredUsers([]);
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

  // Fix for the isAdmin determination in fetchConversation function
  const fetchConversation = async (userId: number) => {
    if (!adminId) {
      setError("Admin not logged in");
      return;
    }

    try {
      setLoadingMessages(true);
      setError(null);

      // Use console.log to debug the API URL
      const apiUrl = `${API_BASE_URL}/MessageController/getConversation/${userId}?admin=1`;
      console.log("Fetching conversation from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Debug the raw response
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Parse the response as JSON
      const data = responseText ? JSON.parse(responseText) : {};
      console.log("Parsed data:", data);

      if (data.status) {
        setConversationId(data.conversation_id || null);

        // Format messages to match our interface
        if (Array.isArray(data.messages)) {
          // First, let's log the structure of a message to understand what fields are available
          if (data.messages.length > 0) {
            console.log(
              "Sample message structure:",
              JSON.stringify(data.messages[0], null, 2)
            );
          }

          const formattedMessages: Message[] = data.messages.map(
            (msg: any, index: number) => {
              // Log detailed information about each message for debugging
              console.log(`Message ${index} raw data:`, msg);

              // Try to determine if this is an admin message
              // We need to check multiple potential fields since API responses can vary

              // DEBUGGING THE ADMIN IDENTIFICATION LOGIC
              const hasAdminField =
                msg.is_admin === 1 ||
                msg.is_admin === true ||
                msg.isAdmin === true;
              const senderMatches =
                msg.sender_id === adminId || msg.senderId === adminId;
              const senderIsAdmin =
                msg.sender === "admin" || msg.role === "admin";

              console.log(`Message ${index} debug:`, {
                hasAdminField,
                senderMatches,
                senderIsAdmin,
                msgSenderId: msg.sender_id,
                adminId: adminId,
              });

              // If this is an API response where admin messages are correctly identified
              // by the is_admin field, we should prioritize that.
              // If is_admin is 0 or false, we still need to check if sender_id matches adminId

              // Use a more comprehensive approach to identify admin messages
              let isAdminMessage = false;

              // Check if there's an explicit admin indicator
              if (
                msg.is_admin === 1 ||
                msg.is_admin === true ||
                msg.isAdmin === true
              ) {
                isAdminMessage = true;
              }
              // Check sender ID
              else if (msg.sender_id && adminId && msg.sender_id == adminId) {
                // Note: using == instead of === to handle string/number type differences
                isAdminMessage = true;
              }
              // Check sender role
              else if (msg.sender === "admin" || msg.role === "admin") {
                isAdminMessage = true;
              }
              // If there's an explicit user indicator, it's definitely not an admin
              else if (
                msg.is_admin === 0 ||
                msg.is_admin === false ||
                msg.isAdmin === false
              ) {
                isAdminMessage = false;
              }

              console.log(`Message ${index} final isAdmin:`, isAdminMessage);

              return {
                id: msg.id || index + 1,
                text: msg.message || msg.text || msg.content || "",
                senderId: msg.sender_id || (isAdminMessage ? adminId! : userId),
                isAdmin: isAdminMessage,
                timestamp:
                  msg.timestamp ||
                  msg.created_at ||
                  msg.time ||
                  new Date().toISOString(),
                status: msg.status || "delivered",
              };
            }
          );

          console.log(
            "Final formatted messages with isAdmin:",
            formattedMessages.map((m) => ({
              id: m.id,
              isAdmin: m.isAdmin,
              text: m.text.substring(0, 20),
            }))
          );

          setMessages(formattedMessages);

          // Also save to localStorage with correct isAdmin values
          try {
            localStorage.setItem(
              `messages_${userId}`,
              JSON.stringify(formattedMessages)
            );
          } catch (error) {
            console.error("Could not save messages to localStorage", error);
          }
        } else {
          console.log("No messages in response or invalid format");
          setMessages([]);
        }

        // Mark messages as read if needed
        if (selectedUser?.hasUnreadMessages) {
          updateMessageStatus(userId);
        }
      } else {
        setMessages([]);
        setError(data.message || "No conversation found");
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      setError("Failed to load conversation. Please try again.");

      // Try to load from localStorage as fallback
      try {
        const cachedMessagesStr = localStorage.getItem(`messages_${userId}`);
        if (cachedMessagesStr) {
          const cachedMessages = JSON.parse(cachedMessagesStr);
          console.log("Using cached messages:", cachedMessages);
          setMessages(cachedMessages);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Could not load cached messages", error);
        setMessages([]);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  // Add this function to mark messages as read
  const updateMessageStatus = async (userId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/MessageController/updateMessageStatus`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            status: "read",
            is_admin: 1,
          }),
        }
      );

      if (response.ok) {
        // Update the user's status locally
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, hasUnreadMessages: false } : user
          )
        );
        setFilteredUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, hasUnreadMessages: false } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  // Replace your handleSendMessage function with this:
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !adminId || !selectedUser || sending) {
      return;
    }

    const tempId = Date.now(); // Temporary ID for optimistic UI update
    const tempMessage: Message = {
      id: tempId,
      text: newMessage,
      senderId: adminId,
      isAdmin: true, // Always true for messages sent by admin
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    try {
      setSending(true);

      // Optimistically update UI with admin message (on the right)
      setMessages((prev) => [...prev, tempMessage]);
      const messageText = newMessage; // Store before clearing
      setNewMessage("");

      // Also update localStorage immediately with the optimistic message
      try {
        const updatedMessages = [...messages, tempMessage];
        localStorage.setItem(
          `messages_${selectedUser.id}`,
          JSON.stringify(updatedMessages)
        );
      } catch (error) {
        console.error("Could not save messages to localStorage", error);
      }

      // Rest of your function stays the same...
      // Scroll to bottom immediately
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Debug the request payload
      const payload = {
        user_id: selectedUser.id,
        message: messageText,
        is_admin: 1,
        sender: "admin",
      };
      console.log("Sending message with payload:", payload);

      const apiUrl = `${API_BASE_URL}/MessageController/sendMessage`;
      console.log("Sending to URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Log the raw response
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Parse JSON response
      const data = responseText ? JSON.parse(responseText) : {};
      console.log("Parsed response:", data);

      if (data.status) {
        // Replace optimistic message with actual message from server
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  id: data.data?.id || tempId,
                  text: data.data?.message || messageText,
                  senderId: adminId,
                  isAdmin: true,
                  timestamp: data.data?.timestamp || tempMessage.timestamp,
                  status: "delivered",
                }
              : msg
          )
        );
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
    <div className="message-container-main">
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position={showToast ? "top" : "bottom"}
        color="danger"
      />

      {/* Message Header */}
      <div className="message-header">
        <h2>Messages</h2>
      </div>

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
            <IonButton
              onClick={fetchUsers}
              style={{ "--background": "#002fa7", "--color": "white" }}
            >
              Try Again
            </IonButton>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-container">
            <p>No users found</p>
            {searchQuery && (
              <IonButton
                fill="clear"
                onClick={() => setSearchQuery("")}
                style={{ "--color": "#002fa7" }}
              >
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
                  className={`user-item ${
                    selectedUser?.id === user.id ? "active" : ""
                  }`}
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
                  </IonLabel>
                  {user.hasUnreadMessages && (
                    <IonBadge className="new-badge" slot="end">
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
        onDidDismiss={() => setShowChatModal(false)}
        style={{ "--background": "#f0f4ff" }}
      >
        <IonHeader>
          <IonToolbar style={{ "--background": "#002fa7", "--color": "white" }}>
            <IonTitle>{selectedUser ? selectedUser.name : "Chat"}</IonTitle>
            <IonButton
              slot="end"
              onClick={handleBackToUsers}
              style={{ "--background": "#9be368", "--color": "#002fa7" }}
            >
              Close
            </IonButton>
          </IonToolbar>
        </IonHeader>

        <IonContent
          className="ion-padding"
          style={{ "--background": "#f0f4ff" }}
          scrollEvents={true}
          onIonScrollEnd={() => {
            // Ensure scrolling works properly
            messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {selectedUser && (
            <>
              <div className="chat-container" style={{ padding: "16px" }}>
                {loadingMessages ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <IonSpinner />
                    <p style={{ color: "#666" }}>Loading messages...</p>
                  </div>
                ) : error ? (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <p style={{ color: "#d33" }}>{error}</p>
                    <IonButton
                      onClick={() => fetchConversation(selectedUser.id)}
                      style={{ "--background": "#002fa7", "--color": "white" }}
                    >
                      Try Again
                    </IonButton>
                  </div>
                ) : messages.length > 0 ? (
                  // Add this before mapping messages in your JSX
                  (console.log(
                    "Rendering messages with isAdmin values:",
                    messages.map((msg) => ({
                      id: msg.id,
                      text:
                        msg.text.substring(0, 20) +
                        (msg.text.length > 20 ? "..." : ""),
                      isAdmin: msg.isAdmin,
                    }))
                  ),
                  // Replace your message rendering JSX with this:
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message-wrapper ${
                        message.isAdmin ? "admin" : "user"
                      }`}
                      style={{
                        display: "flex",
                        justifyContent: message.isAdmin
                          ? "flex-end"
                          : "flex-start",
                        width: "100%",
                      }}
                    >
                      <div
                        className={`message-bubble ${
                          message.isAdmin ? "admin" : "user"
                        }`}
                        style={{
                          backgroundColor: message.isAdmin
                            ? "#9be368"
                            : "#f0f0f0",
                          color: message.isAdmin ? "#002fa7" : "#333",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          maxWidth: "70%",
                          wordBreak: "break-word",
                          alignSelf: message.isAdmin
                            ? "flex-end"
                            : "flex-start",
                        }}
                      >
                        <p className="message-text">
                          {message.text || "No message content"}
                        </p>
                        <div
                          className={`message-meta ${
                            message.isAdmin ? "admin" : "user"
                          }`}
                          style={{
                            fontSize: "12px",
                            marginTop: "6px",
                            textAlign: message.isAdmin ? "right" : "left",
                          }}
                        >
                          {formatMessageTime(message.timestamp)}
                          {message.isAdmin &&
                            getMessageStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  )))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    <IonIcon
                      icon={chatbubbleOutline}
                      style={{
                        fontSize: "48px",
                        color: "#002fa7",
                        opacity: 0.5,
                        marginBottom: "16px",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                    <p>No messages yet with this user.</p>
                    <p>Start the conversation!</p>
                  </div>
                )}
                <div ref={messageEndRef} />
              </div>
            </>
          )}
        </IonContent>

        <IonFooter>
          <IonItem style={{ "--background": "#002fa7", "--color": "white" }}>
            <IonInput
              placeholder="Type your message..."
              value={newMessage}
              onIonChange={(e) => setNewMessage(e.detail.value!)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={loadingMessages || !adminId || sending}
              style={{
                "--placeholder-color": "rgba(255,255,255,0.7)",
                "--color": "white",
                "--padding-start": "12px",
              }}
            />
            <IonButton
              onClick={handleSendMessage}
              disabled={
                !newMessage.trim() || loadingMessages || !adminId || sending
              }
              style={{ "--background": "#9be368", "--color": "#002fa7" }}
            >
              <IonIcon icon={sendOutline} />
            </IonButton>
          </IonItem>
        </IonFooter>
      </IonModal>
    </div>
  );
};

export default MessageContainer;
