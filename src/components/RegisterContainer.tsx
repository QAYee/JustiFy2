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
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const RegisterContainer: React.FC = () => {
  const history = useHistory();

  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [age, setAge] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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

  const handleRegister = async () => {
    console.log("User Data:", {
      name,
      birthdate,
      age,
      address,
      phone,
      email,
      password,
      confirmPassword,
    });

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
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const userData = new FormData();
    userData.append("name", name);
    userData.append("birthdate", birthdate);
    userData.append("age", age);
    userData.append("address", address);
    userData.append("phone", phone);
    userData.append("email", email);
    userData.append("password", password);
    userData.append("confirm_password", confirmPassword);
    if (image) {
      userData.append("image", image);
    }

    // Update the fetch call
    const response = await fetch(
      "http://localhost/justify/index.php/RegisterController/register",
      {
        method: "POST",
        body: userData, // FormData object
      }
    );

    const result = await response.json();
    console.log("Server Response:", result); // Log server response
    alert(result.message);

    if (result.status === "success") {
      history.push("/login");
    }
  };

  return (
    <div className="container">
      <IonItem>
        <IonLabel position="floating">Full Name</IonLabel>
        <IonInput
          value={name}
          onIonChange={(e) => setName(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem>
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

      <IonItem>
        <IonLabel position="floating">Age</IonLabel>
        <IonInput type="text" value={age} readonly />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Address</IonLabel>
        <IonInput
          value={address}
          onIonChange={(e) => setAddress(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Phone</IonLabel>
        <IonInput
          type="tel"
          value={phone}
          onIonChange={(e) => setPhone(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Email</IonLabel>
        <IonInput
          type="email"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Password</IonLabel>
        <IonInput
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Confirm Password</IonLabel>
        <IonInput
          type="password"
          value={confirmPassword}
          onIonChange={(e) => setConfirmPassword(e.detail.value || "")}
          required
        />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Profile Image</IonLabel>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginTop: "16px" }}
        />
        {imagePreview && (
          <div style={{ marginTop: "10px" }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
        )}
      </IonItem>

      <IonButton expand="full" onClick={handleRegister}>
        Register
      </IonButton>

      <IonButton
        expand="full"
        fill="outline"
        onClick={() => history.push("/login")}
      >
        Back to Login
      </IonButton>
    </div>
  );
};

export default RegisterContainer;
