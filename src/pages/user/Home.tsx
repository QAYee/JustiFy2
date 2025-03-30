"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useIonAlert } from "@ionic/react";
import HomeContainer from "../../components/user/HomeContainer";

interface NewsItem {
  title: string;
  description: string;
  created_at: string;
}

const Home: React.FC = () => {
  const [presentAlert] = useIonAlert();
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

          presentAlert({
            header: mostRecent.title,
            message: mostRecent.description,
            buttons: ["Close"],
            htmlAttributes: {
              "aria-label": "news alert dialog",
            },
          });
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchLatestNews();
  }, [presentAlert]);

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
      </IonContent>
    </IonPage>
  );
};

export default Home;
