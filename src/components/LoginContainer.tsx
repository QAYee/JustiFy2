import { useState } from "react";
import {
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonRow,
  IonCol,
  IonRouterLink,
  IonContent,
  IonLoading,
  IonImg,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./LoginContainer.css";

// Define base URL for API requests
const BASE_URL = "https://justifi.animal911.me/Justify";

const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();

  const validateForm = (): boolean => {
    if (!email?.trim() || !password?.trim()) {
      setError("Both username and password are required.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError(null);
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      // Proceed with API login
      const response = await fetch(
        `${BASE_URL}/index.php/LoginController/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const result = await response.json();

      if (result.status === "success") {
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...result.user,
            isAdmin: parseInt(result.user.admin) === 1,
          })
        );

        history.push(
          parseInt(result.user.admin) === 1 ? "/admin/home" : "/home"
        );
      } else {
        setError(result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid Email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonContent className="login-container">
      <IonCard className="login-card">
        <IonImg
          src="https://justifi.animal911.me/Justify/uploads/1-removebg-preview.png"
          alt="JustiFy Logo"
          className="login-logo-image"
          style={{ width: "120px", maxWidth: "70%", margin: "0 auto" }}
        />
        <IonCardTitle className="ion-text-center">
          <h1 className="login-logo">JustiFi</h1>
        </IonCardTitle>

        <h2 className="login-subtitle">Login</h2>

        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        )}

        <IonItem className="login-form-item">
          <IonLabel position="floating" color="primary">
            Email
          </IonLabel>
          <IonInput
            type="text"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            required
            className="input-text"
          />
        </IonItem>

        <IonItem className="login-form-item">
          <IonLabel position="floating" color="primary">
            Password
          </IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            required
            className="input-text"
          />
        </IonItem>

        <IonButton
          expand="block"
          className="login-button"
          onClick={handleLogin}
          color="primary"
        >
          Login
        </IonButton>

        <div className="register-link-container">
          <IonText color="primary">
            Don't have an account?{" "}
            <IonRouterLink
              className="register-link"
              onClick={() => history.push("/register")}
              color="primary"
            >
              Register
            </IonRouterLink>
          </IonText>
        </div>
      </IonCard>

      {/* Loading Indicator */}
      <IonLoading
        isOpen={isLoading}
        message="Logging in..."
        spinner="circular"
        cssClass="accessible-loading"
        backdropDismiss={false}
      />
    </IonContent>
  );
};

export default LoginContainer;
