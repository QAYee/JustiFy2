"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonModal,
  IonIcon,
  IonItem,
  IonLabel,
  IonText,
  IonImg,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonFooter,
} from "@ionic/react";
import {
  close,
  informationCircle,
  chevronForward,
  chevronBack,
} from "ionicons/icons";
import HomeContainer from "../../components/user/HomeContainer";
import "./Home.css";

interface NewsItem {
  title: string;
  description: string;
  created_at: string;
  image?: string;
}

const Home: React.FC = () => {
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsItem | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]); // New state for all news
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Simulate login - replace with your actual login logic
  useEffect(() => {
    // This simulates a login - replace with your actual authentication check
    const checkLoginStatus = () => {
      // For demo purposes, we're setting logged in to true after 1 second
      // Replace this with your actual login check
      setTimeout(() => {
        setIsLoggedIn(true);
      }, 1000);
    };

    checkLoginStatus();
  }, []);

  // Fetch news when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchNewsData();
    }
  }, [isLoggedIn]);

  const fetchNewsData = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/NewsController/getNews",
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();

      if (data.status && data.news.length > 0) {
        // Store all news items
        setAllNews(data.news);

        // Still get the most recent for the modal
        const mostRecent = data.news[0];
        setLatestNews(mostRecent);

        // Show modal on login
        setIsNewsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  // Function to navigate through news items (optional)
  const showNextNews = () => {
    if (currentNewsIndex < allNews.length - 1) {
      const nextIndex = currentNewsIndex + 1;
      setCurrentNewsIndex(nextIndex);
      setLatestNews(allNews[nextIndex]);
    }
  };

  const showPreviousNews = () => {
    if (currentNewsIndex > 0) {
      const prevIndex = currentNewsIndex - 1;
      setCurrentNewsIndex(prevIndex);
      setLatestNews(allNews[prevIndex]);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="centered-title">JustiFy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar></IonToolbar>
        </IonHeader>
        <HomeContainer name="Home" />

        {/* Alert-Style News Card (without modal) */}
        {isNewsModalOpen && (
          <IonModal
            isOpen={isNewsModalOpen}
            onDidDismiss={() => setIsNewsModalOpen(false)}
            style={{
              "--width": "100%",
              "--height": "100%",
              "--border-radius": "0",
              "--box-shadow": "none",
            }}
          >
            <IonHeader>
              <IonToolbar
                style={{
                  "--background": "#002fa7",
                  "--color": "white",
                  "--border-style": "none",
                }}
              >
                <IonButtons slot="start">
                  <IonButton
                    onClick={() => setIsNewsModalOpen(false)}
                    style={{ color: "white" }}
                  >
                    <IonIcon slot="icon-only" icon={close} />
                  </IonButton>
                </IonButtons>
                <IonTitle
                  style={{
                    fontSize: "16px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  NEWS & ANNOUNCEMENTS
                </IonTitle>
              </IonToolbar>
            </IonHeader>

            <IonContent>
              <div
                style={{ padding: "16px", maxWidth: "800px", margin: "0 auto" }}
              >
                <h1
                  style={{
                    fontSize: "22px",
                    fontWeight: "600",
                    margin: "16px 0",
                    color: "#002fa7",
                  }}
                >
                  {latestNews?.title}
                </h1>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "16px",
                  }}
                >
                  <IonIcon
                    icon={informationCircle}
                    style={{ marginRight: "6px", color: "#002fa7" }}
                  />
                  Posted:{" "}
                  {latestNews?.created_at &&
                    new Date(latestNews.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                </div>

                {latestNews?.image && (
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "16px",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <IonImg
                      src={`${latestNews.image}`}
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "cover",
                        backgroundColor: "#f4f4f4",
                      }}
                      onIonError={(e) => {
                        const target = e.target as HTMLIonImgElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "16px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <p
                    style={{
                      margin: "0",
                      lineHeight: "1.6",
                      fontSize: "16px",
                      color: "#333",
                    }}
                  >
                    {latestNews?.description &&
                      (latestNews.description.length > 150 &&
                      !showFullDescription
                        ? `${latestNews.description.substring(0, 150)}...`
                        : latestNews.description)}
                  </p>

                  {latestNews?.description &&
                    latestNews.description.length > 150 && (
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() =>
                          setShowFullDescription(!showFullDescription)
                        }
                        style={{
                          "--color": "#002fa7",
                          margin: "8px 0 0 -10px",
                        }}
                      >
                        {showFullDescription ? "Show Less" : "See More"}
                      </IonButton>
                    )}
                </div>
              </div>

              {/* Navigation and dismiss controls */}
              {allNews.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "0 16px 16px 16px",
                    padding: "12px",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  <IonButton
                    fill="clear"
                    disabled={currentNewsIndex === 0}
                    onClick={showPreviousNews}
                    style={{
                      "--color": currentNewsIndex === 0 ? "#ccc" : "#002fa7",
                      "--background-hover": "rgba(0, 47, 167, 0.05)",
                    }}
                  >
                    <IonIcon slot="icon-only" icon={chevronBack} />
                  </IonButton>

                  <div
                    style={{
                      padding: "0 10px",
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {currentNewsIndex + 1} of {allNews.length}
                  </div>

                  <IonButton
                    fill="clear"
                    disabled={currentNewsIndex === allNews.length - 1}
                    onClick={showNextNews}
                    style={{
                      "--color":
                        currentNewsIndex === allNews.length - 1
                          ? "#ccc"
                          : "#002fa7",
                      "--background-hover": "rgba(0, 47, 167, 0.05)",
                    }}
                  >
                    <IonIcon slot="icon-only" icon={chevronForward} />
                  </IonButton>
                </div>
              )}
            </IonContent>

            <IonFooter
              style={{ background: "#f4f4f8", padding: "16px 16px 32px 16px" }}
            >
              <IonButton
                expand="block"
                onClick={() => setIsNewsModalOpen(false)}
                style={{
                  "--background": "#002fa7",
                  "--border-radius": "28px",
                  "--box-shadow": "0 4px 16px rgba(0, 47, 167, 0.3)",
                  margin: "0 auto",
                  maxWidth: "400px",
                  height: "48px",
                }}
              >
                Got it
              </IonButton>
            </IonFooter>
          </IonModal>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
