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
  IonAlert,
} from "@ionic/react";
import { newspaperOutline, timeOutline, pencil, trash } from "ionicons/icons";
import "./NewsContainer.css";

const NewsContainer: React.FC = () => {
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ title: "", description: "" });
  const [updateImageFile, setUpdateImageFile] = useState<File | null>(null);
  const [updatePreviewUrl, setUpdatePreviewUrl] = useState<string | null>(null);

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

    if (editMode) {
      updateNews();
      return;
    }

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

  const handleEdit = (news: any) => {
    setEditMode(true);
    setEditId(news.id);
    setFormData({
      title: news.title,
      description: news.description,
    });
    if (news.image) {
      setPreviewUrl(news.image);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setFormData({ title: "", description: "" });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const updateNews = async () => {
    if (!formData.title || !formData.description) {
      setToastMessage("Title and description are required");
      setShowToast(true);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("id", String(editId));
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);

    if (imageFile) {
      formDataToSend.append("image", imageFile);
    }

    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/NewsController/updateNews",
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setToastMessage("News updated successfully");
        setShowToast(true);
        // Reset form and exit edit mode
        setFormData({ title: "", description: "" });
        setImageFile(null);
        setPreviewUrl(null);
        setEditMode(false);
        setEditId(null);
        fetchNews(); // Refresh news list
      } else {
        setToastMessage(data.message || "Failed to update news");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to update news");
      setShowToast(true);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };

  const deleteNews = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/NewsController/deleteNews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: deleteId }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        setToastMessage("News deleted successfully");
        setShowToast(true);
        fetchNews(); // Refresh news list
      } else {
        setToastMessage(data.message || "Failed to delete news");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("Failed to delete news");
      setShowToast(true);
    } finally {
      setShowDeleteAlert(false);
      setDeleteId(null);
    }
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
              <IonCardTitle>
                {editMode ? "Update News" : "Create News"}
              </IonCardTitle>
              <IonCardSubtitle>
                {editMode
                  ? "Edit existing news article"
                  : "Add a new news article"}
              </IonCardSubtitle>
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

                  <div className="form-buttons">
                    <IonButton
                      className="ion-margin-top"
                      expand="block"
                      type="submit"
                      color={editMode ? "warning" : "primary"}
                    >
                      {editMode ? "Update News" : "Create News"}
                    </IonButton>

                    {editMode && (
                      <IonButton
                        className="ion-margin-top"
                        expand="block"
                        type="button"
                        color="medium"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </IonButton>
                    )}
                  </div>
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

                    <div className="news-actions">
                      <IonButton
                        fill="clear"
                        color="primary"
                        onClick={() => handleEdit(item)}
                      >
                        <IonIcon slot="icon-only" icon={pencil} />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={() => confirmDelete(item.id)}
                      >
                        <IonIcon slot="icon-only" icon={trash} />
                      </IonButton>
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

      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        cssClass="delete-alert"
        header="Confirm Delete"
        message="Are you sure you want to delete this news article? This action cannot be undone."
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "cancel-button",
            handler: () => {
              setShowDeleteAlert(false);
              setDeleteId(null);
            },
          },
          {
            text: "Delete",
            cssClass: "delete-button",
            handler: deleteNews,
          },
        ]}
      />
    </IonContent>
  );
};

export default NewsContainer;
