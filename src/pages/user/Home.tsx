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
          <div className="alert-overlay">
            <div
              className="alert-backdrop"
              onClick={() => setIsNewsModalOpen(false)}
            ></div>
            <div className="alert-container">
              <IonCard className="alert-news-card">
                <div className="card-header-container">
                  <IonCardHeader>
                    <IonCardTitle className="news-card-title">
                      NEWS & ANNOUNCEMENTS
                    </IonCardTitle>
                      
                    <IonCardSubtitle className="news-card-subtitle">
                      {latestNews?.title}   
                    </IonCardSubtitle>

                    
                    <IonButtons slot="end" className="close-button-container">
                      <IonButton
                        onClick={() => setIsNewsModalOpen(false)}
                        className="card-close-button"
                      >
                        <IonIcon icon={close} />
                      </IonButton>
                    </IonButtons>
                  </IonCardHeader>
                </div>

                {latestNews?.image && (
                  <div className="card-image-container">
                    <IonImg
                      src={`${latestNews.image}`}
                      className="news-card-image"
                      onIonError={(e) => {
                        const target = e.target as HTMLIonImgElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                )}

                <IonCardContent className="news-card-content">
                  <p className="news-card-description">
                    {latestNews?.description}
                  </p>

                  <div className="news-card-footer">
                    <p className="news-card-timestamp">
                      <IonIcon
                        icon={informationCircle}
                        className="timestamp-icon"
                      />{" "}
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
                    </p>

                    {/* Optional: Add navigation buttons if you have multiple news items */}
                    {allNews.length > 1 && (
                      <div className="news-navigation">
                        <div className="navigation-controls">
                          <IonButton
                            fill="clear"
                            disabled={currentNewsIndex === 0}
                            onClick={showPreviousNews}
                            className="nav-button"
                          >
                            <IonIcon icon={chevronBack} />
                          </IonButton>

                          <p className="news-counter">
                            {currentNewsIndex + 1} of {allNews.length}
                          </p>

                          <IonButton
                            fill="clear"
                            disabled={currentNewsIndex === allNews.length - 1}
                            onClick={showNextNews}
                            className="nav-button"
                          >
                            <IonIcon icon={chevronForward} />
                          </IonButton>
                        </div>
                      </div>
                    )}

                    <IonButton
                      expand="block"
                      onClick={() => setIsNewsModalOpen(false)}
                      shape="round"
                      className="card-dismiss-button"
                    >
                      Got it
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
