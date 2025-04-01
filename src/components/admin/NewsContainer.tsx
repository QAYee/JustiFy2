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
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonListHeader,
  IonCheckbox,
} from "@ionic/react";
import {
  newspaperOutline,
  timeOutline,
  pencil,
  trash,
  megaphone,
  people,
} from "ionicons/icons";
import "./NewsContainer.css";

const NewsContainer: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentType: "news",
  });
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
  const [updateFormData, setUpdateFormData] = useState({
    title: "",
    description: "",
  });
  const [updateImageFile, setUpdateImageFile] = useState<File | null>(null);
  const [updatePreviewUrl, setUpdatePreviewUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"news" | "announcement">(
    "news"
  );
  const [contentFilter, setContentFilter] = useState<
    "all" | "news" | "announcement"
  >("all");

  // Add these new states for recipient handling
  const [users, setUsers] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [targetAll, setTargetAll] = useState(true);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);

  useEffect(() => {
    fetchAllContent();
    fetchUsers(); // Fetch users for recipient selection
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleContentTypeChange = (e: CustomEvent) => {
    const newType = e.detail.value as "news" | "announcement";
    setContentType(newType);
    setFormData({
      ...formData,
      contentType: newType,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editMode) {
      updateContent();
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
    formDataToSend.append("contentType", formData.contentType); // Add content type

    // Add recipient information for announcements
    if (formData.contentType === "announcement") {
      formDataToSend.append("target_all", targetAll ? "1" : "0");
      if (!targetAll && selectedRecipients.length > 0) {
        formDataToSend.append(
          "recipient_ids",
          JSON.stringify(selectedRecipients)
        );
      } else if (!targetAll && selectedRecipients.length === 0) {
        setToastMessage("Please select recipients or target all users");
        setShowToast(true);
        return;
      }
    }

    // Determine which endpoint to use based on content type
    const endpoint =
      formData.contentType === "news"
        ? "http://127.0.0.1/justify/index.php/NewsController/addNews"
        : "http://127.0.0.1/justify/index.php/AnnouncementController/addAnnouncement";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.status === "success") {
        setToastMessage(
          `${
            formData.contentType === "news" ? "News" : "Announcement"
          } created successfully`
        );
        setShowToast(true);
        // Reset form
        setFormData({
          title: "",
          description: "",
          contentType: "news",
        });
        setImageFile(null);
        setPreviewUrl(null);
        fetchAllContent(); // Refresh content list
      } else {
        setToastMessage(
          data.message || `Failed to create ${formData.contentType}`
        );
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage(`Failed to create ${formData.contentType}`);
      setShowToast(true);
    }
  };

  const fetchAllContent = async () => {
    try {
      // Fetch news
      const newsResponse = await fetch(
        "http://127.0.0.1/justify/index.php/NewsController/getNews",
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Check if the response is valid
      if (!newsResponse.ok) {
        console.error("News API returned error:", newsResponse.status);
        return;
      }

      const newsData = await newsResponse.json();

      // Fetch announcements
      const announcementResponse = await fetch(
        "http://127.0.0.1/justify/index.php/AnnouncementController/getAnnouncements",
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Check if the response is valid
      if (!announcementResponse.ok) {
        console.error(
          "Announcements API returned error:",
          announcementResponse.status
        );
        return;
      }

      const announcementData = await announcementResponse.json();

      // Combined content array with more flexible extraction
      let allContent: React.SetStateAction<any[]> = [];

      // More flexible extraction of news
      if (newsData) {
        let extractedNews = [];

        // Handle different possible response formats
        if (newsData.status === true && Array.isArray(newsData.news)) {
          // Format: { status: true, news: [...] }
          extractedNews = newsData.news;
        } else if (newsData.news && Array.isArray(newsData.news)) {
          // Format: { news: [...] }
          extractedNews = newsData.news;
        } else if (Array.isArray(newsData)) {
          // Format: [...]
          extractedNews = newsData;
        }

        // Map each news item to ensure it has contentType
        extractedNews = extractedNews.map((item: { contentType: any; }) => ({
          ...item,
          contentType: item.contentType || "news",
        }));

        allContent = [...extractedNews];
      }

      // More flexible extraction of announcements
      if (announcementData) {
        let extractedAnnouncements = [];

        // Handle different possible response formats
        if (
          announcementData.status === true &&
          Array.isArray(announcementData.announcements)
        ) {
          // Format: { status: true, announcements: [...] }
          extractedAnnouncements = announcementData.announcements;
        } else if (
          announcementData.announcements &&
          Array.isArray(announcementData.announcements)
        ) {
          // Format: { announcements: [...] }
          extractedAnnouncements = announcementData.announcements;
        } else if (Array.isArray(announcementData)) {
          // Format: [...]
          extractedAnnouncements = announcementData;
        }

        // Map each announcement to ensure it has contentType
        extractedAnnouncements = extractedAnnouncements.map((item: { contentType: any; }) => ({
          ...item,
          contentType: item.contentType || "announcement",
        }));

        allContent = [...allContent, ...extractedAnnouncements];
      }

      // Only sort if we have items
      if (allContent.length > 0) {
        try {
          allContent.sort((a, b) => {
            // Ensure created_at exists and is a valid date
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
        } catch (sortError) {
          console.error("Error sorting content:", sortError);
        }
      }

      // Update state with the combined content
      setNews(allContent);
    } catch (error) {
      console.error("Error fetching content:", error);
      // Set empty array to avoid undefined errors
      setNews([]);
    }
  };

  // Add this function to fetch users for recipient selection
  const fetchUsers = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1/justify/index.php/AnnouncementController/getUsers",
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch users");
        return;
      }

      const data = await response.json();
      if (data.status && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await fetchAllContent();
    event.detail.complete();
  };

  const handleEdit = (news: any) => {
    setEditMode(true);
    setEditId(news.id);
    setFormData({
      title: news.title,
      description: news.description,
      contentType: news.contentType,
    });
    if (news.image) {
      setPreviewUrl(news.image);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setFormData({ title: "", description: "", contentType: "news" });
    setImageFile(null);
    setPreviewUrl(null);
  };

  const updateContent = async () => {
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

    // Determine which endpoint to use based on content type
    const endpoint =
      formData.contentType === "news"
        ? "http://127.0.0.1/justify/index.php/NewsController/updateNews"
        : "http://127.0.0.1/justify/index.php/AnnouncementController/updateAnnouncement";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.status === "success") {
        setToastMessage(
          `${
            formData.contentType === "news" ? "News" : "Announcement"
          } updated successfully`
        );
        setShowToast(true);
        // Reset form and exit edit mode
        setFormData({ title: "", description: "", contentType: "news" });
        setImageFile(null);
        setPreviewUrl(null);
        setEditMode(false);
        setEditId(null);
        fetchAllContent(); // Refresh content list
      } else {
        setToastMessage(
          data.message || `Failed to update ${formData.contentType}`
        );
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage(`Failed to update ${formData.contentType}`);
      setShowToast(true);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteAlert(true);
  };

  const deleteNews = async () => {
    if (!deleteId) return;

    // Get the content type of the item being deleted
    const contentToDelete = news.find((item) => item.id === deleteId);
    const isAnnouncement = contentToDelete?.contentType === "announcement";

    const endpoint = isAnnouncement
      ? "http://127.0.0.1/justify/index.php/AnnouncementController/deleteAnnouncement"
      : "http://127.0.0.1/justify/index.php/NewsController/deleteNews";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: deleteId }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setToastMessage(
          `${isAnnouncement ? "Announcement" : "News"} deleted successfully`
        );
        setShowToast(true);
        fetchAllContent(); // Refresh content list
      } else {
        setToastMessage(
          data.message ||
            `Failed to delete ${isAnnouncement ? "announcement" : "news"}`
        );
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setToastMessage(`Failed to delete content`);
      setShowToast(true);
    } finally {
      setShowDeleteAlert(false);
      setDeleteId(null);
    }
  };

  const getFilteredContent = () => {
    if (contentFilter === "all") {
      return news;
    }
    return news.filter((item) => item.contentType === contentFilter);
  };

  // Add function to toggle recipient selector visibility
  const toggleRecipientSelector = () => {
    setShowRecipientSelector(!showRecipientSelector);
    if (!showRecipientSelector && users.length === 0) {
      fetchUsers();
    }
  };

  // Add function to handle recipient selection
  const handleRecipientSelection = (userId: number) => {
    setSelectedRecipients((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  return (
    <IonContent className="ion-padding" color="light">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonGrid>
        {/* Remove the debug panel that was here */}

        {/* Rest of your existing code */}
        <IonRow>
          <IonCol sizeMd="6" offsetMd="3">
            <IonCardHeader>
              <IonCardTitle>
                {editMode ? "Update Content" : "Create Content"}
              </IonCardTitle>
              <IonCardSubtitle>
                {editMode
                  ? "Edit existing content"
                  : "Add new content to the system"}
              </IonCardSubtitle>
            </IonCardHeader>

            <div className="content-type-tabs">
              <IonSegment
                value={contentType}
                onIonChange={handleContentTypeChange}
              >
                <IonSegmentButton value="news">
                  <IonIcon icon={newspaperOutline} />
                  <IonLabel>News</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="announcement">
                  <IonIcon icon={megaphone} />
                  <IonLabel>Announcement</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>

            <IonCardContent>
              <form onSubmit={handleSubmit}>
                <IonList>
                  <IonItem>
                    <IonLabel position="floating">
                      {contentType === "news"
                        ? "News Title"
                        : "Announcement Title"}
                    </IonLabel>
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
                    <IonLabel position="floating">
                      {contentType === "news"
                        ? "News Details"
                        : "Announcement Message"}
                    </IonLabel>
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

                  {/* Only show recipient selection for announcements */}
                  {contentType === "announcement" && (
                    <>
                      <IonItem>
                        <IonLabel>Target Recipients</IonLabel>
                        <IonSelect
                          value={targetAll ? "all" : "specific"}
                          onIonChange={(e) =>
                            setTargetAll(e.detail.value === "all")
                          }
                          interface="popover"
                        >
                          <IonSelectOption value="all">
                            All Users
                          </IonSelectOption>
                          <IonSelectOption value="specific">
                            Select Specific Users
                          </IonSelectOption>
                        </IonSelect>
                      </IonItem>

                      {!targetAll && (
                        <IonItem>
                          <IonButton
                            expand="block"
                            fill="outline"
                            onClick={toggleRecipientSelector}
                            className="recipient-button"
                          >
                            {showRecipientSelector
                              ? "Hide Recipient Selection"
                              : `Select Recipients (${selectedRecipients.length} selected)`}
                          </IonButton>
                        </IonItem>
                      )}

                      {!targetAll && showRecipientSelector && (
                        <div className="recipient-selector">
                          <IonList className="recipient-list">
                            <IonListHeader>
                              <IonLabel>Select Recipients</IonLabel>
                            </IonListHeader>

                            {users.length > 0 ? (
                              users.map((user) => (
                                <IonItem key={user.id}>
                                  <IonLabel>{user.name}</IonLabel>
                                  <IonCheckbox
                                    slot="end"
                                    checked={selectedRecipients.includes(
                                      user.id
                                    )}
                                    onIonChange={() =>
                                      handleRecipientSelection(user.id)
                                    }
                                  />
                                </IonItem>
                              ))
                            ) : (
                              <IonItem>
                                <IonLabel>Loading users...</IonLabel>
                              </IonItem>
                            )}
                          </IonList>
                        </div>
                      )}
                    </>
                  )}

                  <div className="form-buttons">
                    <IonButton
                      className="ion-margin-top"
                      expand="block"
                      type="submit"
                      color={editMode ? "warning" : "primary"}
                    >
                      {editMode
                        ? `Update ${
                            contentType === "news" ? "News" : "Announcement"
                          }`
                        : `Create ${
                            contentType === "news" ? "News" : "Announcement"
                          }`}
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

            {/* Add this after the content creation form and before the news list */}
            <div className="content-filter-container">
              <h4 className="filter-heading">Filter Content</h4>
              <IonSegment
                value={contentFilter}
                onIonChange={(e) => setContentFilter(e.detail.value as any)}
                className="content-filter-tabs"
              >
                <IonSegmentButton value="all">
                  <IonLabel>All</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="news">
                  <IonIcon icon={newspaperOutline} />
                  <IonLabel>News</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="announcement">
                  <IonIcon icon={megaphone} />
                  <IonLabel>Announcements</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>

            <div className="news-list">
              {getFilteredContent().length > 0 ? (
                getFilteredContent().map((item, index) => (
                  <IonCard
                    key={index}
                    className={`news-card ${
                      item.contentType === "announcement"
                        ? "announcement-card"
                        : ""
                    }`}
                  >
                    <IonCardHeader>
                      <div className="card-header-content">
                        {item.contentType === "announcement" ? (
                          <IonIcon
                            icon={megaphone}
                            className="content-type-icon announcement-icon"
                          />
                        ) : (
                          <IonIcon
                            icon={newspaperOutline}
                            className="content-type-icon news-icon"
                          />
                        )}
                        <IonCardTitle>{item.title || "Untitled"}</IonCardTitle>
                      </div>
                      <IonCardSubtitle className="content-type-label">
                        {item.contentType === "announcement"
                          ? "Announcement"
                          : "News"}
                      </IonCardSubtitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>{item.description || "No description available"}</p>
                      {item.image && (
                        <IonImg
                          src={item.image}
                          alt="Content Image"
                          onIonError={(e) => {
                            const target = e.target as HTMLIonImgElement;
                            target.style.display = "none";
                          }}
                        />
                      )}
                      <div className="news-timestamp">
                        <IonIcon icon={timeOutline} />
                        <small>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : "Date not available"}
                        </small>
                      </div>

                      {/* Inside your news card, after the timestamp section */}
                      {item.contentType === "announcement" && (
                        <div className="recipients-container">
                          <div className="recipients-header">
                            <IonIcon
                              icon={people}
                              className="recipients-icon"
                            />
                            <span className="recipients-title">Recipients</span>
                          </div>

                          {item.target_all ? (
                            <div className="target-all-badge">
                              <span>
                                Users ({item.recipient_count || "All"})
                              </span>
                            </div>
                          ) : (
                            <div className="recipients-list">
                              {Array.isArray(item.recipient_preview) &&
                              item.recipient_preview.length > 0 ? (
                                <>
                                  <div className="recipient-count">
                                    Sent to {item.recipient_count}{" "}
                                    {item.recipient_count === 1
                                      ? "person"
                                      : "people"}
                                  </div>
                                  <div className="recipient-chips">
                                    {item.recipient_preview.map((name, idx) => {
                                      // Ensure name is a string before calling includes
                                      const nameStr = typeof name === 'string' ? name : String(name || '');
                                      return !nameStr.includes("...and") ? (
                                        <div
                                          key={idx}
                                          className="recipient-chip"
                                        >
                                          {nameStr}
                                        </div>
                                      ) : (
                                        <div
                                          key={idx}
                                          className="recipient-more"
                                        >
                                          {nameStr}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="no-recipients">
                                  No specific recipients
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

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
                ))
              ) : (
                <div className="no-content-message">
                  <p>
                    {contentFilter === "all"
                      ? "No news or announcements found. Create some using the form above."
                      : `No ${
                          contentFilter === "news"
                            ? "news articles"
                            : "announcements"
                        } found.`}
                  </p>
                  <IonButton
                    size="small"
                    onClick={fetchAllContent}
                    className="refresh-button"
                  >
                    Refresh
                  </IonButton>
                </div>
              )}
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
