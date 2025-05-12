"use client";

import type React from "react";

import { useEffect, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonChip,
  IonLabel,
  IonItem,
  IonList,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonText,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonDatetime,
  IonButtons,
  IonBackButton,
  IonTextarea,
  IonItemDivider,
  IonToast,
  IonToggle,
} from "@ionic/react";
import {
  logOutOutline,
  personCircleOutline,
  documentTextOutline,
  notificationsOutline,
  homeOutline,
  mailOutline,
  callOutline,
  locationOutline,
  calendarOutline,
  peopleOutline,
  createOutline,
  saveOutline,
  closeCircleOutline,
  cameraOutline,
  refreshOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./DashboardContainer.css";

// Update the API_BASE_URL to match the correct path for your controller
const API_BASE_URL = "https://justifi.animal911.me/Justify/index.php"; // Define the API base URL

// Add this function to get the authentication token
const getAuthToken = () => {
  return localStorage.getItem("userToken");
};

interface UserData {
  name: string;
  email: string;
  address: string;
  phone?: string;
  birthdate?: string;
  age?: string;
  image?: string;
  [key: string]: any;
}

const DashboardContainer: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    complaints: 3,
    pendingTickets: 2,
    notifications: 5,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastColor, setToastColor] = useState("success");
  const [submitting, setSubmitting] = useState(false);

  // Add a new dependency to refresh user data
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");

    if (!loggedInUser) {
      history.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(loggedInUser);

      // Enhanced user data with dummy values if missing
      const enhancedUser: UserData = {
        name: parsedUser.name || "John Doe",
        email: parsedUser.email || "john.doe@example.com",
        address: parsedUser.address || "123 Main St, Anytown, PH",
        phone: parsedUser.phone || "+63 912 345 6789",
        birthdate: parsedUser.birthdate || "1990-01-01",
        age: parsedUser.age || "33",
        image: parsedUser.image || "",
        ...parsedUser,
      };

      // Remove sensitive or unnecessary fields
      const { ID, created_at, admin, password, ...filteredUser } = enhancedUser;
      setUser(filteredUser);
      setLoading(false);
    } catch (error) {
      console.error("Error parsing user data:", error);
      history.replace("/login");
    }
  }, []);

  useEffect(() => {
    if (user?.image) {
      console.log(
        "Image URL:",
        `https://justifi.animal911.me/Justify/uploads/${user.image}`
      );
      // Test image availability
      fetch(`https://justifi.animal911.me/Justify/uploads/${user.image}`)
        .then((response) => {
          if (!response.ok) {
            console.error("Image not found or server error:", response.status);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch image:", error);
        });
    }
  }, [user]);

  useEffect(() => {
    // Existing user loading code...

    // Add this API call to get the latest user data
    if (refreshTrigger > 0) {
      const token = localStorage.getItem("userToken");

      fetch(`${API_BASE_URL}/UserDashboardController/getUserDetails`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status) {
            const updatedUser = data.data;

            // Remove sensitive fields
            const { password, ...filteredUser } = updatedUser;

            // Update localStorage
            localStorage.setItem("user", JSON.stringify(filteredUser));

            // Update state
            setUser(filteredUser);
          }
        })
        .catch((error) => {
          console.error("Failed to refresh user data:", error);
        });
    }
  }, [refreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userInfo");
    history.replace("/login");
  };

  const openEditModal = () => {
    if (user) {
      setEditedUser({ ...user });
    }
    setShowEditModal(true);
  };

  const handleInputChange = (e: CustomEvent, field: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: e.detail.value,
      });
    }
  };

  const validateForm = (): { isValid: boolean; message: string } => {
    if (!editedUser) {
      return { isValid: false, message: "No user data to update" };
    }

    if (!editedUser.name || editedUser.name.trim() === "") {
      return { isValid: false, message: "Full name is required" };
    }

    if (
      editedUser.phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        editedUser.phone
      )
    ) {
      return { isValid: false, message: "Please enter a valid phone number" };
    }

    if (!editedUser.address || editedUser.address.trim() === "") {
      return { isValid: false, message: "Address is required" };
    }

    return { isValid: true, message: "" };
  };

  const handleSubmit = async () => {
    try {
      // Validate form first
      const { isValid, message } = validateForm();
      if (!isValid) {
        setToastColor("warning");
        setToastMessage(message);
        setShowToast(true);
        return;
      }

      // Show loading while updating
      setLoading(true);

      // Skip the update if no changes were made
      if (JSON.stringify(editedUser) === JSON.stringify(user)) {
        setToastColor("warning");
        setToastMessage("No changes were made to your profile.");
        setShowToast(true);
        setShowEditModal(false);
        setLoading(false);
        return;
      }

      // Prepare the data for API
      const updateData = {
        id: user?.id,
        name: editedUser?.name,
        address: editedUser?.address,
        phone: editedUser?.phone,
        birthdate: editedUser?.birthdate,
        age: editedUser?.age,
        // Exclude email as it can't be changed
      };

      // Get the JWT token from localStorage
      const token = localStorage.getItem("userToken");

      // Make API call to update user information
      const response = await fetch(
        `${API_BASE_URL}/UserDashboardController/updateUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (result.status) {
        // Update was successful

        // Update localStorage with the new data
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user") || "{}"),
            ...updateData,
            // Don't update these fields:
            image: user?.image,
            email: user?.email, // Keep original email
          })
        );

        // Update the user state
        setUser({
          ...user!,
          name: editedUser?.name || user!.name,
          address: editedUser?.address || user!.address,
          phone: editedUser?.phone || user!.phone,
          birthdate: editedUser?.birthdate || user!.birthdate,
          age: editedUser?.age || user!.age,
        });

        // Trigger refresh of user data
        setRefreshTrigger((prev) => prev + 1);

        // Show success message
        setToastColor("success");
        setToastMessage(result.message || "Profile updated successfully!");
        setShowToast(true);

        // Close the modal
        setShowEditModal(false);
      } else {
        // Update failed
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastColor("danger");

      // Handle different types of errors
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        setToastMessage(
          "Network error. Please check your internet connection."
        );
      } else if (error instanceof SyntaxError) {
        setToastMessage(
          "Invalid response from server. Please try again later."
        );
      } else {
        setToastMessage(
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again."
        );
      }

      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ion-padding ion-text-center">
        <IonSpinner name="crescent" />
        <IonText color="medium">
          <p>Loading user profile...</p>
        </IonText>
      </div>
    );
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonAvatar
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto 16px auto",
          }}
        >
          {user?.image ? (
            <img
              src={`https://justifi.animal911.me/Justify/uploads/images/${user.image}`}
              alt={user?.name}
              onError={(e) => {
                console.log("Image failed to load:", e.currentTarget.src);
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector("ion-icon")) {
                  parent.innerHTML = `<ion-icon name="person-circle-outline" style="font-size: 100px; color: var(--ion-color-medium)"></ion-icon>`;
                }
              }}
            />
          ) : (
            <IonIcon
              icon={personCircleOutline}
              style={{
                fontSize: "100px",
                color: "var(--ion-color-medium)",
              }}
            />
          )}
        </IonAvatar>
        <IonCardTitle>{user?.name}</IonCardTitle>
        <IonCardSubtitle>Citizen Account</IonCardSubtitle>
      </IonCardHeader>

      <IonCardContent>
        <IonList lines="full">
          <IonItem>
            <IonIcon slot="start" icon={personCircleOutline} color="primary" />
            <IonLabel>
              <h3>Full Name</h3>
              <p>{user?.name}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={mailOutline} color="primary" />
            <IonLabel>
              <h3>Email</h3>
              <p>{user?.email}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={locationOutline} color="primary" />
            <IonLabel>
              <h3>Address</h3>
              <p>{user?.address}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={callOutline} color="primary" />
            <IonLabel>
              <h3>Phone</h3>
              <p>{user?.phone}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={calendarOutline} color="primary" />
            <IonLabel>
              <h3>Birthdate</h3>
              <p>{user?.birthdate}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon slot="start" icon={peopleOutline} color="primary" />
            <IonLabel>
              <h3>Age</h3>
              <p>{user?.age}</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <div className="ion-padding-top">
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton
                  expand="block"
                  color="primary"
                  onClick={openEditModal}
                >
                  <IonIcon slot="start" icon={createOutline} />
                  Update Profile
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton expand="block" color="danger" onClick={handleLogout}>
                  <IonIcon slot="start" icon={logOutOutline} />
                  Logout
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonCardContent>

      <IonModal
        isOpen={showEditModal}
        onDidDismiss={() => setShowEditModal(false)}
      >
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonButton onClick={() => setShowEditModal(false)}>
                <IonIcon icon={closeCircleOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>Update Profile</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSubmit} disabled={submitting}>
                {submitting ? (
                  <>
                    <IonSpinner name="dots" slot="start" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IonIcon icon={saveOutline} slot="start" />
                    Save
                  </>
                )}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList lines="full">
            <IonItemDivider color="light">Personal Information</IonItemDivider>

            <IonItem>
              <IonLabel position="stacked">Full Name</IonLabel>
              <IonInput
                value={editedUser?.name}
                onIonChange={(e) => handleInputChange(e, "name")}
                placeholder="Enter your full name"
                required
              ></IonInput>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Email</IonLabel>
              <IonInput
                value={editedUser?.email}
                readonly={true}
                disabled={true}
                placeholder="Enter your email address"
                type="email"
                className="disabled-input"
              ></IonInput>
              <small
                className="ion-padding-start"
                style={{
                  color: "var(--ion-color-medium)",
                  display: "block",
                  marginTop: "5px",
                }}
              >
                Email address cannot be changed
              </small>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Phone Number</IonLabel>
              <IonInput
                value={editedUser?.phone}
                onIonChange={(e) => handleInputChange(e, "phone")}
                placeholder="Enter your phone number"
                type="tel"
              ></IonInput>
            </IonItem>

            <IonItemDivider color="light">Address Information</IonItemDivider>

            <IonItem>
              <IonLabel position="stacked">Address</IonLabel>
              <IonTextarea
                value={editedUser?.address}
                onIonChange={(e) => handleInputChange(e, "address")}
                placeholder="Enter your address"
                autoGrow={true}
                rows={3}
              ></IonTextarea>
            </IonItem>

            <IonItemDivider color="light">
              Additional Information
            </IonItemDivider>

            <IonItem>
              <IonLabel position="stacked">Birthdate</IonLabel>
              <IonInput
                value={editedUser?.birthdate}
                onIonChange={(e) => handleInputChange(e, "birthdate")}
                placeholder="YYYY-MM-DD"
                type="date"
              ></IonInput>
            </IonItem>

            <IonItem lines="none">
              <IonLabel position="stacked">Age</IonLabel>
              <IonInput
                value={editedUser?.age}
                onIonChange={(e) => handleInputChange(e, "age")}
                placeholder="Enter your age"
                type="number"
              ></IonInput>
            </IonItem>
          </IonList>
        </IonContent>
      </IonModal>

      {/* Toast notification */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage || ""}
        duration={3000}
        color={toastColor}
        position="bottom"
      />
    </IonCard>
  );
};

export default DashboardContainer;
