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
} from "@ionic/react";
import { close } from "ionicons/icons";
import HomeContainer from "../../components/user/HomeContainer";



interface NewsItem {
  title: string;
  description: string;
  created_at: string;
  image?: string;
}

const Home: React.FC = () => {
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [latestNews, setLatestNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1/justify/index.php/NewsController/getNews",
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const data = await response.json();

        if (data.status && data.news.length > 0) {
          // Get the most recent news item
          const mostRecent = data.news[0];
          setLatestNews(mostRecent);

          // Show modal instead of alert
          setIsNewsModalOpen(true);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchLatestNews();
  }, []);

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

        {/* News Modal */}
        <IonModal
          isOpen={isNewsModalOpen}
          onDidDismiss={() => setIsNewsModalOpen(false)}
          className="news-modal"
          presentingElement={undefined}
          initialBreakpoint={0.75}
          breakpoints={[0, 0.75, 1]}
        >
          <IonHeader className="ion-no-border">
            <IonToolbar color="light">
              <IonTitle size="large" className="ion-text-wrap">
                {latestNews?.title}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsNewsModalOpen(false)}>
                  <IonIcon icon={close} size="large" />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding news-content">
            {latestNews?.image && (
              <div className="news-image-container">
                <IonImg
                  src={`${latestNews.image}`}
                  style={{
                    width: "100%",
                    maxHeight: "250px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  onIonError={(e) => {
                    const target = e.target as HTMLIonImgElement;
                    target.style.display = "none";
                  }}
                />
              </div>
            )}

            <div className="news-content-container">
              <IonText>
                <p className="news-description">{latestNews?.description}</p>
                <p className="news-timestamp">
                  <small>
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
                  </small>
                </p>
              </IonText>
            </div>

            <div className="modal-actions">
              <IonButton
                expand="block"
                onClick={() => setIsNewsModalOpen(false)}
                shape="round"
                className="close-button"
              >
                Close
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
