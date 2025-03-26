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
  IonPage,
  IonContent,
  IonLoading,
} from "@ionic/react";
import { useHistory } from "react-router-dom";

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
    <IonPage>
      <IonContent
        className="ion-justify-content-center ion-align-items-center"
        fullscreen={true}
      >
        <IonRow
          className="ion-justify-content-center ion-align-items-center"
          style={{ height: "100%" }}
        >
          <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle className="ion-text-center">
                  <h1>JustiFy</h1>
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <h2 className="ion-text-center">Login</h2>

                {error && (
                  <IonText color="danger">
                    <p className="ion-text-center">{error}</p>
                  </IonText>
                )}

                <IonItem className="ion-margin-bottom">
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value!)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    required
                  />
                </IonItem>

                <IonItem className="ion-margin-bottom">
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value!)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    required
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  className="ion-margin-top"
                  onClick={handleLogin}
                >
                  Login
                </IonButton>

                <div className="ion-text-center ion-margin-top">
                  <IonText>
                    Don't have an account?{" "}
                    <IonRouterLink onClick={() => history.push("/register")}>
                      Register
                    </IonRouterLink>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>

        {/* Loading Indicator */}
        <IonLoading isOpen={isLoading} message="Logging in..." />
      </IonContent>
    </IonPage>
  );
};

export default LoginContainer;
