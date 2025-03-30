import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonCard,
  IonCardContent,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonImg,
} from "@ionic/react";
import { newspaperOutline, timeOutline } from "ionicons/icons";
import "./NewsContainer.css";

const NewsContainer: React.FC = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !imageFile) {
      setToastMessage("All fields are required");
      setShowToast(true);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("image", imageFile); // Use imageFile instead of formData.image

    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/NewsController/addNews",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setToastMessage(data.message);
        setShowToast(true);
        // Reset form
        setFormData({
          title: "",
          description: "",
        });
        setImageFile(null);
        setPreviewUrl(null);
        fetchNews(); // Refresh news list
      } else {
        setToastMessage(data.message || "Failed to create news");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to create news");
      setShowToast(true);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/NewsController/getNews",
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (data.status) {
        setNews(data.news);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await fetchNews();
    event.detail.complete();
  };

  return (
    <IonContent className="ion-padding" color="light">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonGrid>
        <IonRow>
          <IonCol sizeMd="6" offsetMd="3">
            <IonCardHeader>
              <IonCardTitle>Create News</IonCardTitle>
              <IonCardSubtitle>Add a new news article</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonList>
                  <IonItem>
                    <IonLabel position="floating">Title</IonLabel>
                    <IonInput
                      value={formData.title}
                      onIonChange={(e) =>
                        setFormData({
                          ...formData,
                          title: e.detail.value || "",
                        })
                      }
                      required
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="floating">Description</IonLabel>
                    <IonTextarea
                      value={formData.description}
                      onIonChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.detail.value || "",
                        })
                      }
                      rows={6}
                      required
                    />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">Upload Image</IonLabel>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </IonItem>

                  {previewUrl && (
                    <IonItem>
                      <IonImg
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxHeight: "200px" }}
                      />
                    </IonItem>
                  )}

                  <IonButton
                    className="ion-margin-top"
                    expand="block"
                    type="submit"
                  >
                    Create News
                  </IonButton>
                </IonList>
              </form>
            </IonCardContent>

            <div className="news-list">
              {news.map((item, index) => (
                <IonCard key={index} className="news-card">
                  <IonCardHeader>
                    <IonCardTitle>{item.title}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{item.description}</p>
                    {item.image && <IonImg src={item.image} alt="News Image" />}
                    <div className="news-timestamp">
                      <IonIcon icon={timeOutline} />
                      <small>
                        {new Date(item.created_at).toLocaleString()}
                      </small>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
      />
    </IonContent>
  );
};

export default NewsContainer;
