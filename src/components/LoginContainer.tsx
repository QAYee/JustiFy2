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
  IonContent,
  IonPage,
  IonLoading,
  IonText,
  IonRow,
  IonCol,
  IonRouterLink
} from "@ionic/react";
import { useHistory } from "react-router-dom";

const LoginContainer: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch("http://127.0.0.1/justify/index.php/LoginController/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server error occurred");
      }
  
      const result = await response.json();
      console.log("Login Response:", result); // Debugging
  
      if (result.status === "success") {
        // Ensure admin value is treated as an integer
        const isAdmin = parseInt(result.user.admin) === 1;
        
        // Store user data
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("userInfo", JSON.stringify({ ...result.user, isAdmin }));
  
        // Debugging log
        console.log("Redirecting as admin:", isAdmin);
  
        // Redirect based on role
        if (isAdmin) {
          history.push("/admin/home");
        } else {
          history.push("/home");
        }
      } else {
        setError(result.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred while logging in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <IonPage>
    <IonContent className="ion-justify-content-center ion-align-items-center" fullscreen={true}>
      <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: "100%" }}>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  required 
                />
              </IonItem>
  
              <IonItem className="ion-margin-bottom">
                <IonLabel position="floating">Password</IonLabel>
                <IonInput 
                  type="password" 
                  value={password} 
                  onIonChange={(e) => setPassword(e.detail.value!)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
                  Don't have an account?{' '}
                  <IonRouterLink onClick={() => history.push("/register")}>
                    Register
                  </IonRouterLink>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </IonCol>
      </IonRow>
    </IonContent>
  
    <IonLoading 
      isOpen={isLoading} 
      message="Logging in..." 
    />
  </IonPage>
  );
};

export default LoginContainer;