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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./LoginContainer.css";

const LoginContainer: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const history = useHistory();

  // Static user credentials (for testing purposes)
  const staticUsers = [
    { username: "admin", password: "123", admin: 1, name: "Administrator" },
    { username: "user", password: "123", admin: 0, name: "Regular User" },
  ];

  const validateForm = (): boolean => {
    if (!email || !password) {
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
      // Check static users first
      const staticUser = staticUsers.find(
        (user) => user.username === email && user.password === password
      );

      if (staticUser) {
        // Create user data object
        const userData = {
          name: staticUser.name,
          username: staticUser.username,
          admin: staticUser.admin,
          isAdmin: staticUser.admin === 1,
        };

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userInfo", JSON.stringify(userData));

        // Redirect based on role
        history.push(staticUser.admin === 1 ? "/admin/home" : "/home");
        return;
      }

      // If not a static user, proceed with API login
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/LoginController/login",
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
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonContent className="login-container">
      <IonCard className="login-card">
     
        <IonCardTitle>
        <h1 className="login-logo">JustiFy</h1>
        </IonCardTitle>
      
      
     
        <h2 className="login-subtitle">Login</h2>

        {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
        )}

        <IonItem className="login-form-item">
        <IonLabel position="floating" color="primary">Username</IonLabel>
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
        <IonLabel position="floating" color="primary">Password</IonLabel>
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
      className="custom-loading"
      />
    </IonContent>
  );
};

export default LoginContainer;
