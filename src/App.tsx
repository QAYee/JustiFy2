"use client";

import type React from "react";

import { Redirect, Route, useLocation } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  home,
  person,
  documentText,
  mail,
  ticket,
  newspaper,
  logOut,
  statsChart,
  megaphone,
  helpCircle,
} from "ionicons/icons";
import { useState, useEffect } from "react";

/* Import Pages */
import LoginContainer from "./pages/Login";
import RegisterContainer from "./pages/Register";
import DashboardContainer from "./pages/user/Dashboard";
import Home from "./pages/user/Home";
import Complain from "./pages/user/Complain";
import Inbox from "./pages/user/Inbox";
import Record from "./pages/user/Record";
import Ticket from "./pages/user/Ticket";
import AHome from "./pages/admin/Home";
import AComplain from "./pages/admin/Complain";
import AInbox from "./pages/admin/Statistics";
import ARecord from "./pages/admin/Record";
import AStatistics from "./pages/admin/Statistics";
import ADashboard from "./pages/admin/Dashboard";
import TicketContainer from "./components/admin/TicketContainer";
import News from "./pages/admin/News";
import Message from "./pages/user/Message";
import AMessage from "./pages/admin/Message";

/* Core CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";

/* Theme */
import "./theme/variables.css";

// Custom CSS for app-wide styles
import "./App.css";

// Configure Ionic with custom colors
setupIonicReact({
  mode: "md",
  animated: true,
});

// Custom CSS to inject our color scheme
const injectCustomStyles = () => {
  const style = document.createElement("style");
  style.innerHTML = `
    :root {
      --ion-color-primary: #002fa7;
      --ion-color-primary-rgb: 0, 47, 167;
      --ion-color-primary-contrast: #ffffff;
      --ion-color-primary-contrast-rgb: 255, 255, 255;
      --ion-color-primary-shade: #002993;
      --ion-color-primary-tint: #1a44b0;
      
      --ion-color-secondary: #9be368;
      --ion-color-secondary-rgb: 155, 227, 104;
      --ion-color-secondary-contrast: #002fa7;
      --ion-color-secondary-contrast-rgb: 0, 47, 167;
      --ion-color-secondary-shade: #88c85c;
      --ion-color-secondary-tint: #a5e678;
      
      --ion-background-color: #f0f4ff;
      --ion-background-color-rgb: 240, 244, 255;
      
      --ion-text-color: #333333;
      --ion-text-color-rgb: 51, 51, 51;
      
      --ion-tab-bar-background: #002fa7;
      --ion-tab-bar-color: rgba(255, 255, 255, 0.7);
      --ion-tab-bar-color-selected: #9be368;
    }
  `;
  document.head.appendChild(style);
};

const App: React.FC = () => {
  useEffect(() => {
    // Inject custom styles
    injectCustomStyles();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <AppRouter />
      </IonReactRouter>
    </IonApp>
  );
};

// Function to check if user is admin
const isUserAdmin = (): boolean => {
  try {
    // First check the new format in userInfo
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      if (parsedInfo.isAdmin === 1) return true;
    }

    // Check the original user object format as fallback
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.admin === 1) return true;
    }

    return false;
  } catch (e) {
    console.error("Error checking admin status:", e);
    return false;
  }
};

// Check if user is logged in
const isLoggedIn = (): boolean => {
  return (
    localStorage.getItem("user") !== null ||
    localStorage.getItem("userInfo") !== null
  );
};

// Logout function
const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("userInfo");
  window.location.href = "/login";
};

// Main router component to decide between admin or user app
const AppRouter: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(isUserAdmin());
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn());
  const location = useLocation();

  // Update states when location changes (like after login)
  useEffect(() => {
    setIsAdmin(isUserAdmin());
    setLoggedIn(isLoggedIn());
  }, [location.pathname]);

  // Auth routes (login, register)
  if (
    !loggedIn &&
    (location.pathname === "/login" ||
      location.pathname === "/register" ||
      location.pathname === "/")
  ) {
    return (
      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
        <Route exact path="/login" component={LoginContainer} />
        <Route exact path="/register" component={RegisterContainer} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    );
  }

  // If logged in, route to the appropriate interface based on admin status
  return isAdmin ? <AdminApp /> : <UserApp />;
};

// Admin interface component
const AdminApp: React.FC = () => {
  const location = useLocation();

  return (
    <IonTabs>
      <IonHeader>
        <IonToolbar style={{ "--background": "#002fa7", "--color": "white" }}>
          <IonTitle>JustiFy Admin Portal</IonTitle>
          <IonButtons slot="end">
            <IonButton href="/admin/dashboard" style={{ "--color": "#9be368" }}>
              <IonIcon icon={person} />
            </IonButton>
            <IonButton onClick={handleLogout} style={{ "--color": "#9be368" }}>
              <IonIcon icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect to="login" />
        </Route>
        <Route
          exact
          path="/admin/dashboard"
          component={ADashboard || DashboardContainer}
        />
        <Route exact path="/admin/home" component={AHome} />
        <Route exact path="/admin/complain" component={AComplain} />
        <Route exact path="/admin/inbox" component={AInbox} />
        <Route exact path="/admin/statistics" component={AStatistics} />
        <Route exact path="/admin/news" component={News} />
        <Route exact path="/admin/message" component={AMessage} />
        <Route>
          <Redirect to="/admin/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar
        slot="bottom"
        style={{
          "--background": "#002fa7",
          "--color": "rgba(255,255,255,0.7)",
          "--color-selected": "#9be368",
        }}
      >
        <IonTabButton tab="admin-complain" href="/admin/complain">
          <IonIcon icon={newspaper} />
          <IonLabel>Complaints</IonLabel>
        </IonTabButton>
        <IonTabButton tab="admin-news" href="/admin/news">
          <IonIcon icon={megaphone} />
          <IonLabel>News</IonLabel>
        </IonTabButton>
        <IonTabButton tab="admin-home" href="/admin/home">
          <IonIcon icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="admin-statistics" href="/admin/statistics">
          <IonIcon icon={statsChart} />
          <IonLabel>Reports</IonLabel>
        </IonTabButton>
        <IonTabButton tab="admin-message" href="/admin/message">
          <IonIcon icon={mail} />
          <IonLabel>Message</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

// User interface component
const UserApp: React.FC = () => {
  const location = useLocation();

  return (
    <IonTabs>
      <IonHeader>
        <IonToolbar style={{ "--background": "#002fa7", "--color": "white" }}>
          <IonTitle className="centered-title">JustiFy</IonTitle>
          <IonButtons slot="end">
            <IonButton href="/dashboard" style={{ "--color": "#9be368" }}>
              <IonIcon icon={person} />
            </IonButton>
            <IonButton onClick={handleLogout} style={{ "--color": "#9be368" }}>
              <IonIcon icon={logOut} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonRouterOutlet>
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
        <Route exact path="/dashboard" component={DashboardContainer} />
        <Route exact path="/home" component={Home} />
        <Route exact path="/complain" component={Complain} />
        <Route exact path="/inbox" component={Inbox} />
        <Route exact path="/ticket" component={Ticket} />
        <Route exact path="/message" component={Message} />
        <Route>
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>

      <IonTabBar
        slot="bottom"
        style={{
          "--background": "#002fa7",
          "--color": "rgba(255,255,255,0.7)",
          "--color-selected": "#9be368",
        }}
      >
        <IonTabButton tab="complain" href="/complain">
          <IonIcon icon={newspaper} />
          <IonLabel>Complain</IonLabel>
        </IonTabButton>
        <IonTabButton tab="ticket" href="/ticket">
          <IonIcon icon={ticket} />
          <IonLabel>Ticket</IonLabel>
        </IonTabButton>
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="inbox" href="/inbox">
          <IonIcon icon={mail} />
          <IonLabel>Inbox</IonLabel>
        </IonTabButton>
        <IonTabButton tab="message" href="/message">
          <IonIcon icon={helpCircle} />
          <IonLabel>Ask</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default App;
