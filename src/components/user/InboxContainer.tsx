"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  IonImg,
  IonSkeletonText,
  IonButton,
  IonToast,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonText,
} from "@ionic/react";
import {
  mailOutline,
  mailOpenOutline,
  timeOutline,
  megaphone,
  refreshOutline,
} from "ionicons/icons";

import "./InboxContainer.css";

interface Announcement {
  target_all: any;
  recipient_ids: boolean;
  id: number;
  title: string;
  description: string;
  image?: string;
  created_at: string;
  is_read: number;
  contentType: string;
}

// Improve the getCurrentUserId function for better auth integration
const getCurrentUserId = (): number | undefined => {
  try {
    // First check for user in authUser - most common auth pattern
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      const parsed = JSON.parse(authUser);
      return parsed.id || parsed.userId || parsed.user_id;
    }

    // Check for a user object directly
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      return parsed.id || parsed.userId || parsed.user_id;
    }

    // Check for session storage if local storage was unsuccessful
    const sessionUser =
      sessionStorage.getItem("authUser") || sessionStorage.getItem("user");
    if (sessionUser) {
      const parsed = JSON.parse(sessionUser);
      return parsed.id || parsed.userId || parsed.user_id;
    }

    // Check for a JWT token and decode it
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("jwt") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("jwt");
    if (token) {
      const payload = token.split(".")[1];
      if (payload) {
        const decoded = JSON.parse(atob(payload));
        return decoded.id || decoded.userId || decoded.sub;
      }
    }

    // Direct user ID storage
    const userId =
      localStorage.getItem("userId") ||
      localStorage.getItem("user_id") ||
      sessionStorage.getItem("userId") ||
      sessionStorage.getItem("user_id");
    if (userId) {
      return parseInt(userId, 10);
    }

    console.warn("No authenticated user found - using default ID for testing");
    return undefined; // Return undefined instead of defaulting to 1
  } catch (e) {
    console.error("Error getting current user ID:", e);
    return undefined;
  }
};

const InboxContainer: React.FC<ContainerProps> = ({
  name,
  userId: propUserId,
}) => {
  // Initialize userId with the getCurrentUserId function
  const [userId, setUserId] = useState<number | undefined>(
    propUserId || getCurrentUserId()
  );
  const [needsLogin, setNeedsLogin] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Add this state variable at the top of your component
  const [isFetching, setIsFetching] = useState(false);

  // Add these state variables inside your component
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  // Make the getUnreadCount function more robust
  const getUnreadCount = () => {
    return announcements.filter((a) => a.is_read === 0).length;
  };

  // Update the useEffect to handle authentication better
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      // Try to get user ID from props or local storage
      const currentUserId = propUserId || getCurrentUserId();

      if (currentUserId) {
        setUserId(currentUserId);
        await fetchAnnouncements();
      } else {
        // Try to fetch the current user from your auth API endpoint
        try {
          const response = await fetch(
            "https://ivory-swallow-404351.hostingersite.com/Justify/index.php/UserController/getCurrentUser",
            {
              credentials: "include", // Include cookies if using cookie-based auth
              headers: {
                Authorization: `Bearer ${
                  localStorage.getItem("token") ||
                  sessionStorage.getItem("token") ||
                  ""
                }`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            if (userData && userData.id) {
              setUserId(userData.id);
              await fetchAnnouncements();
              return;
            }
          }
          // If we reach here, user is not authenticated
          setNeedsLogin(true);
        } catch (error) {
          console.error("Error fetching current user:", error);
          setError("Failed to authenticate user. Please login again.");
          setNeedsLogin(true);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, []);

  // Fetch user-specific announcements
  const fetchAnnouncements = async () => {
    if (!userId || isFetching) {
      // Skip if we're already fetching or don't have a userId
      return;
    }

    setIsFetching(true);
    setLoading(true);
    setError(null);

    try {
      // Make sure the endpoint includes user_id parameter
      const endpoint = `https://ivory-swallow-404351.hostingersite.com/Justify/index.php/AnnouncementController/getUserAnnouncements?user_id=${userId}`;

      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // Explicitly make this a GET request (default)
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Invalid JSON response from server");
      }

      if (data.status && Array.isArray(data.announcements)) {
        // Process announcements as returned by the backend
        const validAnnouncements = data.announcements
          .filter((announcement: any) => {
            // Additional safety check - make sure announcements are meant for this user
            return (
              announcement &&
              typeof announcement === "object" &&
              announcement.id &&
              announcement.title &&
              announcement.description
              // We trust the backend to only return announcements for this user
            );
          })
          .map((announcement: any) => ({
            ...announcement,
            is_read: announcement.is_read === 1 ? 1 : 0,
            created_at: announcement.created_at || new Date().toISOString(),
          }));

        setAnnouncements(validAnnouncements);
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      // Error handling
      setError(`Failed to fetch announcements: ${(error as Error).message}`);
      setToastMessage(`Error: ${(error as Error).message}`);
      setShowToast(true);
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await fetchAnnouncements();
    event.detail.complete();
  };

  // Update to align with your backend implementation

  // Fix the markAsRead function to prevent loops
  const markAsRead = async (announcementId: number) => {
    // Add a check to prevent marking items that are already read
    const announcement = announcements.find((a) => a.id === announcementId);
    if (announcement && announcement.is_read === 1) {
      // Already read, nothing to do
      return;
    }

    try {
      // First update UI optimistically (for responsiveness)
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === announcementId ? { ...item, is_read: 1 } : item
        )
      );

      const response = await fetch(
        "https://ivory-swallow-404351.hostingersite.com/Justify/index.php/AnnouncementController/markAsRead",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            announcement_id: announcementId,
            user_id: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // Only show success toast if successful
      if (data.status === "success") {
        setToastMessage("Announcement marked as read");
        setShowToast(true);
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error marking as read:", error);
      setToastMessage(`Failed to mark as read: ${(error as Error).message}`);
      setShowToast(true);

      // Instead of re-fetching, just revert the optimistic update
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === announcementId ? { ...item, is_read: 0 } : item
        )
      );
    }
  };

  const getFilteredAnnouncements = () => {
    if (!searchText) return announcements;

    const searchLower = searchText.toLowerCase();
    return announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(searchLower) ||
        announcement.description.toLowerCase().includes(searchLower)
    );
  };

  // Optional: Add a function to manually set a test user for debugging
  const useTestUser = () => {
    const testId = 1; // Change this to a valid user ID in your system
    setUserId(testId);
    localStorage.setItem("userId", testId.toString());
    fetchAnnouncements();
  };

  return (
    <>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
      />

      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonCardHeader>
        <IonCardTitle className="ion-text-wrap">
          Announcements
          <IonBadge color="primary" style={{ marginLeft: "8px" }}>
            {getUnreadCount()}
          </IonBadge>
          <IonButton
            fill="clear"
            size="small"
            onClick={fetchAnnouncements}
            style={{ float: "right" }}
          >
            <IonIcon icon={refreshOutline} />
          </IonButton>
        </IonCardTitle>
      </IonCardHeader>

      <IonSearchbar
        value={searchText}
        onIonChange={(e) => setSearchText(e.detail.value!)}
        placeholder="Search announcements"
        animated
        color={"primary"}
        style={{ borderRadius: "8px" }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "16px",
          marginBottom: "16px",
        }}
      >
        <IonChip outline={true} color="primary">
          All Announcements
        </IonChip>
        <IonChip outline={true}>
          Unread
          <IonBadge color="primary" style={{ marginLeft: "8px" }}>
            {announcements.filter((a) => a.is_read === 0).length}
          </IonBadge>
        </IonChip>
      </div>

      <>
        {loading ? (
          // Show skeletons when loading
          Array(3)
            .fill(null)
            .map((_, index) => (
              <IonItem key={`skeleton-${index}`}>
                <IonAvatar slot="start">
                  <IonSkeletonText animated />
                </IonAvatar>
                <IonLabel>
                  <h2>
                    <IonSkeletonText animated style={{ width: "70%" }} />
                  </h2>
                  <p>
                    <IonSkeletonText animated style={{ width: "90%" }} />
                  </p>
                  <p>
                    <IonSkeletonText animated style={{ width: "30%" }} />
                  </p>
                </IonLabel>
              </IonItem>
            ))
        ) : needsLogin ? (
          <IonItem>
            <IonLabel className="ion-text-center ion-text-wrap">
              <h2>Login Required</h2>
              <p>Please login to view your announcements</p>
              {/* Uncomment this for testing purposes */}
              {/*
              <IonButton 
                size="small" 
                onClick={useTestUser}
                style={{ marginTop: "16px" }}
              >
                Use Test User
              </IonButton>
              */}
            </IonLabel>
          </IonItem>
        ) : getFilteredAnnouncements().length > 0 ? (
          getFilteredAnnouncements().map((announcement) => (
            <IonItemSliding key={announcement.id}>
              <IonItem
                button
                className={announcement.is_read === 0 ? "unread" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnnouncement(announcement);
                  setShowModal(true);
                  if (announcement.is_read === 0) {
                    markAsRead(announcement.id);
                  }
                }}
                style={{
                  "--background": "white",
                  "--background-hover": "rgba(0, 47, 167, 0.05)",
                  "--background-activated": "rgba(0, 47, 167, 0.08)",
                  "--background-focused": "white",
                  "--border-color": "rgba(0, 47, 167, 0.1)",
                  "--padding-start": "16px",
                  "--padding-end": "16px",
                  "--padding-top": "12px",
                  "--padding-bottom": "12px",
                  "--inner-padding-end": "8px",
                  marginBottom: "4px",
                  borderRadius: "8px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  overflow: "hidden",
                }}
              >
                {/* Add an avatar based on content type */}
                <IonAvatar slot="start">
                  <IonIcon
                    icon={megaphone}
                    style={{ fontSize: "24px", color: "#002fa7" }}
                  />
                </IonAvatar>

                <IonLabel>
                  <h2
                    style={{
                      fontWeight:
                        announcement.is_read === 1 ? "normal" : "bold",
                      marginBottom: "6px",
                      color: "#222",
                    }}
                  >
                    {announcement.title}
                  </h2>
                  <p
                    className="announcement-preview"
                    style={{
                      margin: "4px 0",
                      color: "#666",
                    }}
                  >
                    {announcement.description.substring(0, 60)}...
                  </p>
                  <p
                    style={{ fontSize: "12px", color: "#666", margin: "4px 0" }}
                  >
                    <IonIcon
                      icon={timeOutline}
                      style={{ verticalAlign: "middle", marginRight: "4px" }}
                    />
                    {new Date(announcement.created_at).toLocaleString()}
                  </p>
                </IonLabel>
                {announcement.is_read === 0 && (
                  <IonBadge
                    color="primary"
                    slot="end"
                    style={{
                      borderRadius: "12px",
                      padding: "4px 8px",
                    }}
                  >
                    New
                  </IonBadge>
                )}
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                  color={announcement.is_read === 1 ? "primary" : "success"}
                  onClick={() => markAsRead(announcement.id)}
                >
                  <IonIcon
                    slot="icon-only"
                    icon={
                      announcement.is_read === 1 ? mailOutline : mailOpenOutline
                    }
                  />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))
        ) : (
          <IonItem>
            {error ? (
              <IonLabel
                className="ion-text-center ion-text-wrap"
                color="danger"
              >
                {error}
                <p>
                  <IonButton size="small" onClick={fetchAnnouncements}>
                    Retry
                  </IonButton>
                </p>
              </IonLabel>
            ) : (
              <IonLabel className="ion-text-center">
                No announcements found
              </IonLabel>
            )}
          </IonItem>
        )}
      </>

      <IonModal
        isOpen={showModal}
        onDidDismiss={() => setShowModal(false)}
        style={{ "--background": "transparent" }}
      >
        {selectedAnnouncement && (
          <>
            <IonHeader>
              <IonToolbar color="primary">
                <IonTitle>{selectedAnnouncement.title}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent
              className="ion-padding"
              style={{ "--background": "white" }}
            >
              <div style={{ padding: "16px" }}>
                {selectedAnnouncement.image && (
                  <div style={{ textAlign: "center", margin: "16px 0" }}>
                    <img
                      src={selectedAnnouncement.image}
                      alt="Announcement"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "300px",
                        borderRadius: "8px",
                      }}
                      onError={(e) => {
                        // Handle broken images
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <IonText>
                  <h2>{selectedAnnouncement.title}</h2>

                  <div
                    style={{
                      color: "#666",
                      marginBottom: "16px",
                      fontSize: "14px",
                    }}
                  >
                    <IonIcon
                      icon={timeOutline}
                      style={{ verticalAlign: "middle", marginRight: "4px" }}
                    />
                    {new Date(selectedAnnouncement.created_at).toLocaleString()}

                    {/* Always show as "Read" in the modal since we mark it when opening */}
                    <span style={{ marginLeft: "10px", color: "#888" }}>
                      <IonIcon
                        icon={mailOpenOutline}
                        style={{
                          verticalAlign: "middle",
                          marginRight: "4px",
                        }}
                      />
                      Read
                    </span>
                  </div>

                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.6",
                      fontSize: "16px",
                      margin: "16px 0",
                      color: "#333", // Added for better readability
                    }}
                  >
                    {selectedAnnouncement.description ||
                      "No description available"}
                  </p>
                </IonText>
              </div>
            </IonContent>
            <div style={{ padding: "16px", background: "white" }}>
              {/* Removed the "Mark as Read" button */}
              <IonButton
                expand="block"
                color="medium"
                onClick={() => setShowModal(false)}
              >
                Close
              </IonButton>
            </div>
          </>
        )}
      </IonModal>
    </>
  );
};

export default InboxContainer;
