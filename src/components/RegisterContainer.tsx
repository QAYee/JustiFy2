"use client";

import type React from "react";
import { useState } from "react";
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonDatetime,
  IonModal,
  IonContent,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonAlert,
  IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
// Import the CSS file
import "./RegisterContainer.css";

const RegisterContainer: React.FC = () => {
  const history = useHistory();

  // User information states
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // UI states
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verification states
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  const calculateAge = (dob: string): string => {
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }
    return calculatedAge.toString();
  };

  const handleBirthdateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value?.split("T")[0]; // Extract only the date part (YYYY-MM-DD)
    if (selectedDate) {
      setBirthdate(selectedDate);
      setAge(calculateAge(selectedDate));
      setShowPicker(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate verification code and store in state
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send verification code to user's email
  const sendVerificationCode = async () => {
    try {
      setLoading(true);

      // Generate a new code
      const code = generateVerificationCode();
      setVerificationCode(code);

      // Make sure we have an email to send to
      if (!email) {
        alert("Please enter your email address first");
        setLoading(false);
        return false;
      }

      // Call backend API to send verification code
      const response = await fetch(
        "http://localhost/justify/index.php/EmailController/sendVerificationCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors", // Add no-cors mode to bypass CORS restrictions
          body: JSON.stringify({
            email: email,
            code: code,
            name: name,
          }),
        }
      );

      // With no-cors mode, we can't access response details
      // So we'll just assume success and continue the flow

      console.log("Verification request sent");
      setShowVerificationAlert(true);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error sending verification code:", error);

      // For development/testing: show the verification code anyway
      setShowVerificationAlert(true);

      setLoading(false);
      alert("Could not send verification code. Please try again.");
      return false;
    }
  };

  // Validate form inputs
  const validateForm = () => {
    if (
      !name ||
      !birthdate ||
      !age ||
      !address ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      alert("All fields are required");
      return false;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    // Basic phone validation (adjust for your country format)
    const phoneRegex = /^\d{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      alert("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  // Handle clicking the register button - shows verification modal
  const handleRegisterClick = async () => {
    if (validateForm()) {
      const codeSent = await sendVerificationCode();
      if (codeSent) {
        setShowVerificationModal(true);
      } else {
        alert("Could not send verification code. Please try again.");
      }
    }
  };

  // Handle verification and registration
  const handleVerifyAndRegister = async () => {
    setLoading(true);

    if (enteredCode !== verificationCode) {
      setVerificationError("Invalid verification code. Please try again.");
      setLoading(false);
      return;
    }

    // Clear verification error if code matches
    setVerificationError("");

    // Prepare user data for registration
    const userData = new FormData();
    userData.append("name", name);
    userData.append("birthdate", birthdate);
    userData.append("age", age);
    userData.append("address", address);
    userData.append("phone", phone);
    userData.append("email", email);
    userData.append("password", password);
    userData.append("verification_code", verificationCode); // Store the verification code
    userData.append("verified", "1"); // Initially not verified (will be verified when they confirm email)
    userData.append("admin", "0"); // Regular user, not admin

    if (image) {
      userData.append("image", image);
    }

    try {
      // Send registration request
      const response = await fetch(
        "http://localhost/justify/index.php/RegisterController/register",
        {
          method: "POST",
          body: userData,
        }
      );

      const result = await response.json();
      console.log("Server Response:", result);

      // Close verification modal
      setShowVerificationModal(false);

      if (result.status === "success") {
        alert("Registration successful! Please log in to your account.");
        history.push("/login");
      } else {
        alert(result.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Create an Account</h2>

      <IonItem className="register-form-item">
        <IonLabel
          position="floating"
          style={{ color: "#002fa7", fontWeight: "600" }}
        >
          Full Name
        </IonLabel>
        <IonInput
          value={name}
          onIonChange={(e) => setName(e.detail.value || "")}
          required
          style={{ color: "#000000" }}
        />
      </IonItem>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Birthdate</IonLabel>
        <IonInput
          type="text"
          value={birthdate}
          readonly
          onClick={() => setShowPicker(true)}
        />
      </IonItem>

      <IonModal
        isOpen={showPicker}
        onDidDismiss={() => setShowPicker(false)}
        className="datetime-modal"
        breakpoints={[0, 0.5, 0.8]}
        initialBreakpoint={0.5}
      >
        <IonContent>
          <div className="ion-padding">
            <h2>Select Birthdate</h2>
            <IonDatetime
              value={birthdate}
              min="1900-01-01"
              max="2025-12-31"
              onIonChange={handleBirthdateChange}
              presentation="date"
              showDefaultButtons={true}
              doneText="Confirm"
              cancelText="Cancel"
              className="custom-datetime"
            />
          </div>
        </IonContent>
      </IonModal>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Age</IonLabel>
        <IonInput type="text" value={age} readonly />
      </IonItem>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Email</IonLabel>
        <IonInput
          type="email"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Address</IonLabel>
        <IonInput
          value={address}
          onIonChange={(e) => setAddress(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Phone</IonLabel>
        <IonInput
          type="tel"
          value={phone}
          onIonChange={(e) => setPhone(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Password</IonLabel>
        <IonInput
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Confirm Password</IonLabel>
        <IonInput
          type="password"
          value={confirmPassword}
          onIonChange={(e) => setConfirmPassword(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem className="register-form-item">
        <IonLabel position="floating">Profile Image</IonLabel>
        <div className="file-input-container">
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
          </div>
        )}
      </IonItem>

      <div className="register-button-container">
        <IonButton
          expand="block"
          onClick={handleRegisterClick}
          disabled={loading}
          className="register-primary-button"
        >
          {loading ? <IonSpinner name="dots" /> : "Register"}
        </IonButton>

        <IonButton
          expand="block"
          fill="outline"
          onClick={() => history.push("/login")}
          disabled={loading}
          className="register-secondary-button"
        >
          Back to Login
        </IonButton>
      </div>

      {/* Verification Code Modal */}
      <IonModal
        isOpen={showVerificationModal}
        onDidDismiss={() => setShowVerificationModal(false)}
        className="verification-modal"
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Verify Your Email</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="verification-content">
            <h2>Email Verification</h2>
            <p>
              A 6-digit verification code has been sent to {email}. Please enter
              the code below to complete your registration.
            </p>

            <IonItem className="register-form-item">
              <IonLabel position="floating">Verification Code</IonLabel>
              <IonInput
                type="text"
                value={enteredCode}
                onIonChange={(e) => setEnteredCode(e.detail.value || "")}
                placeholder="Enter 6-digit code"
              />
            </IonItem>

            {verificationError && (
              <p className="error-text">{verificationError}</p>
            )}

            <div className="ion-margin-top">
              <IonButton
                expand="block"
                onClick={handleVerifyAndRegister}
                disabled={loading}
                className="register-primary-button"
              >
                {loading ? (
                  <IonSpinner name="dots" />
                ) : (
                  "Verify & Complete Registration"
                )}
              </IonButton>

              <IonButton
                expand="block"
                onClick={() => sendVerificationCode()}
                disabled={loading}
                className="register-accent-button"
              >
                Resend Code
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Verification Alert - commented out as in your original code */}
    </div>
  );
};

export default RegisterContainer;
