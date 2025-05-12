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
        ? "https://justifi.animal911.me/Justify/index.php/NewsController/addNews"
        : "https://justifi.animal911.me/Justify/index.php/AnnouncementController/addAnnouncement";

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
        "https://justifi.animal911.me/Justify/index.php/NewsController/getNews",
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
        "https://justifi.animal911.me/Justify/index.php/AnnouncementController/getAnnouncements",
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
        extractedNews = extractedNews.map((item: { contentType: any }) => ({
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
        extractedAnnouncements = extractedAnnouncements.map(
          (item: { contentType: any }) => ({
            ...item,
            contentType: item.contentType || "announcement",
          })
        );

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
        "https://justifi.animal911.me/Justify/index.php/AnnouncementController/getUsers",
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
      // Clean up the image URL if it contains localhost path
      let cleanImagePath = news.image;

      if (cleanImagePath.includes("http://127.0.0.1/justify/uploads/")) {
        cleanImagePath = cleanImagePath.replace(
          "http://127.0.0.1/justify/uploads/",
          ""
        );
      }

      // Only set the preview URL if we're displaying an image from the server
      // or if it's already a complete URL (without the localhost prefix)
      if (cleanImagePath.startsWith("http")) {
        setPreviewUrl(cleanImagePath);
      } else {
        const imageUrl = `https://justifi.animal911.me/Justify/uploads/${cleanImagePath}`;
        setPreviewUrl(imageUrl);
      }
    } else {
      setPreviewUrl(null);
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
        ? "https://justifi.animal911.me/Justify/index.php/NewsController/updateNews"
        : "https://justifi.animal911.me/Justify/index.php/AnnouncementController/updateAnnouncement";

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
      ? "https://justifi.animal911.me/Justify/index.php/AnnouncementController/deleteAnnouncement"
      : "https://justifi.animal911.me/Justify/index.php/NewsController/deleteNews";

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
    <IonContent
      className="ion-padding"
      style={{
        "--background": "#f0f4ff", // Light blue background that complements the dark blue
        "--color": "#333333",
      }}
    >
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

      <IonGrid>
        <IonRow>
          <IonCol sizeMd="6" offsetMd="3">
            <div
              style={{
                background: "#002fa7",
                color: "white",
                padding: "16px",
                borderRadius: "10px 10px 0 0",
                marginBottom: "0",
                boxShadow: "0 4px 12px rgba(0, 47, 167, 0.12)",
              }}
            >
              <h1
                style={{ margin: "0", fontSize: "1.2rem", fontWeight: "bold" }}
              >
                {editMode ? "Update Content" : "Create Content"}
              </h1>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.9rem",
                  opacity: 0.8,
                }}
              >
                {editMode
                  ? "Edit existing content"
                  : "Add new content to the system"}
              </p>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "16px",
                borderRadius: "0 0 10px 10px",
                marginBottom: "16px",
                boxShadow: "0 4px 12px rgba(0, 47, 167, 0.12)",
              }}
            >
              <div className="content-type-tabs" style={{ overflow: "auto" }}>
                <IonSegment
                  value={contentType}
                  onIonChange={handleContentTypeChange}
                  style={{
                    "--background": "#f0f4ff",
                    "--color": "#002fa7",
                    "--color-checked": "#ffffff",
                    "--background-checked": "#002fa7",
                    width: "100%", // Use full width instead of fixed width
                  }}
                  scrollable={true}
                >
                  <IonSegmentButton
                    value="news"
                    layout="icon-start"
                    style={{ minWidth: "120px" }}
                  >
                    <IonIcon icon={newspaperOutline} />
                    <IonLabel>News</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton
                    value="announcement"
                    layout="icon-start"
                    style={{ minWidth: "180px" }}
                  >
                    <IonIcon icon={megaphone} />
                    <IonLabel>Announcement</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </div>

              <form onSubmit={handleSubmit} className="news-form">
                <IonList style={{ background: "transparent" }}>
                  <IonItem style={{ "--background": "#f8faff" }}>
                    <IonLabel position="floating" style={{ color: "#002fa7" }}>
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
                      style={{ "--color": "#333333" }}
                    />
                  </IonItem>

                  <IonItem
                    style={{ "--background": "#f8faff", marginTop: "8px" }}
                  >
                    <IonLabel position="floating" style={{ color: "#002fa7" }}>
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
                      style={{ "--color": "#333333" }}
                    />
                  </IonItem>

                  <IonItem
                    style={{ "--background": "#f8faff", marginTop: "8px" }}
                  >
                    <IonLabel position="stacked" style={{ color: "#002fa7" }}>
                      Upload Image
                    </IonLabel>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ marginTop: "8px" }}
                    />
                  </IonItem>

                  {previewUrl && (
                    <IonItem style={{ "--background": "transparent" }}>
                      <div
                        style={{
                          width: "100%",
                          height: "200px",
                          overflow: "hidden",
                          borderRadius: "8px",
                          border: "2px solid #f0f4ff",
                          margin: "10px 0",
                          boxShadow: "0 2px 6px rgba(0, 47, 167, 0.1)",
                        }}
                      >
                        <IonImg
                          src={previewUrl}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </IonItem>
                  )}

                  {/* Only show recipient selection for announcements */}
                  {contentType === "announcement" && (
                    <>
                      <IonItem
                        style={{ "--background": "#f8faff", marginTop: "8px" }}
                      >
                        <IonLabel style={{ color: "#002fa7" }}>
                          Target Recipients
                        </IonLabel>
                        <IonSelect
                          value={targetAll ? "all" : "specific"}
                          onIonChange={(e) =>
                            setTargetAll(e.detail.value === "all")
                          }
                          interface="popover"
                          style={{ "--color": "#333333" }}
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
                        <IonItem style={{ "--background": "transparent" }}>
                          <IonButton
                            expand="block"
                            fill="outline"
                            onClick={toggleRecipientSelector}
                            className="recipient-button"
                            style={{
                              "--color": "#002fa7",
                              "--border-color": "#002fa7",
                              margin: "8px 0",
                            }}
                          >
                            {showRecipientSelector
                              ? "Hide Recipient Selection"
                              : `Select Recipients (${selectedRecipients.length} selected)`}
                          </IonButton>
                        </IonItem>
                      )}

                      {!targetAll && showRecipientSelector && (
                        <div
                          className="recipient-selector"
                          style={{
                            border: "1px solid rgba(0, 47, 167, 0.2)",
                            borderRadius: "8px",
                            margin: "8px 0",
                            background: "#f8faff",
                          }}
                        >
                          <IonList
                            className="recipient-list"
                            style={{ background: "transparent" }}
                          >
                            <IonListHeader style={{ color: "#002fa7" }}>
                              <IonLabel>Select Recipients</IonLabel>
                            </IonListHeader>

                            {users.length > 0 ? (
                              users.map((user) => (
                                <IonItem
                                  key={user.id}
                                  style={{ "--background": "transparent" }}
                                >
                                  <IonLabel style={{ color: "#333333" }}>
                                    {user.name}
                                  </IonLabel>
                                  <IonCheckbox
                                    slot="end"
                                    checked={selectedRecipients.includes(
                                      user.id
                                    )}
                                    onIonChange={() =>
                                      handleRecipientSelection(user.id)
                                    }
                                    style={{
                                      "--checkbox-background-checked":
                                        "#002fa7",
                                    }}
                                  />
                                </IonItem>
                              ))
                            ) : (
                              <IonItem
                                style={{ "--background": "transparent" }}
                              >
                                <IonLabel style={{ color: "#666" }}>
                                  Loading users...
                                </IonLabel>
                              </IonItem>
                            )}
                          </IonList>
                        </div>
                      )}
                    </>
                  )}

                  <div className="form-buttons" style={{ marginTop: "16px" }}>
                    <IonButton
                      className="ion-margin-top"
                      expand="block"
                      type="submit"
                      style={{
                        "--background": editMode ? "#002fa7" : "#002fa7",
                        "--color": "white",
                      }}
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
                        style={{
                          "--background": "#f0f4ff",
                          "--color": "#002fa7",
                        }}
                        onClick={cancelEdit}
                      >
                        Cancel
                      </IonButton>
                    )}
                  </div>
                </IonList>
              </form>
            </div>

            {/* Content filter container */}
            <div
              style={{
                background: "#002fa7",
                color: "white",
                padding: "16px",
                borderRadius: "10px 10px 0 0",
                marginBottom: "0",
                marginTop: "24px",
                boxShadow: "0 4px 12px rgba(0, 47, 167, 0.12)",
              }}
            >
              <h4 style={{ margin: "0", fontSize: "1.1rem" }}>
                Filter Content
              </h4>
            </div>

            <div
              style={{
                background: "#ffffff",
                padding: "16px",
                borderRadius: "0 0 10px 10px",
                marginBottom: "16px",
                boxShadow: "0 4px 12px rgba(0, 47, 167, 0.12)",
              }}
            >
              <IonSegment
                value={contentFilter}
                onIonChange={(e) => setContentFilter(e.detail.value as any)}
                style={{
                  "--background": "#f0f4ff",
                  "--color": "#002fa7",
                  "--color-checked": "#ffffff",
                  "--background-checked": "#002fa7",
                  width: "100%",
                }}
                scrollable={true}
              >
                <IonSegmentButton
                  value="all"
                  layout="icon-start"
                  style={{ minWidth: "100px" }}
                >
                  <IonLabel>All</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  value="news"
                  layout="icon-start"
                  style={{ minWidth: "120px" }}
                >
                  <IonIcon icon={newspaperOutline} />
                  <IonLabel>News</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton
                  value="announcement"
                  layout="icon-start"
                  style={{ minWidth: "200px" }}
                >
                  <IonIcon icon={megaphone} />
                  <IonLabel>Announcements</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>

            <div className="news-list">
              {getFilteredContent().length > 0 ? (
                getFilteredContent().map((item, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "16px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0, 47, 167, 0.12)",
                      background: "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        background:
                          item.contentType === "announcement"
                            ? "#002fa7"
                            : "#002fa7",
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "white",
                        }}
                      >
                        {item.contentType === "announcement" ? (
                          <IonIcon
                            icon={megaphone}
                            style={{
                              fontSize: "1.4rem",
                              marginRight: "10px",
                              color: "#9be368",
                            }}
                          />
                        ) : (
                          <IonIcon
                            icon={newspaperOutline}
                            style={{
                              fontSize: "1.4rem",
                              marginRight: "10px",
                              color: "#9be368",
                            }}
                          />
                        )}
                        <h2
                          style={{
                            margin: "0",
                            color: "white",
                            fontSize: "1.1rem",
                          }}
                        >
                          {item.title || "Untitled"}
                        </h2>
                      </div>
                      <div
                        style={{
                          background: "#9be368",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: "#002fa7",
                        }}
                      >
                        {item.contentType === "announcement"
                          ? "Announcement"
                          : "News"}
                      </div>
                    </div>

                    <div style={{ padding: "16px" }}>
                      <p style={{ color: "#333333", margin: "0 0 16px 0" }}>
                        {item.description || "No description available"}
                      </p>

                      {item.image && (
                        <div
                          style={{
                            width: "100%",
                            height: "200px",
                            marginTop: "12px",
                            marginBottom: "16px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "2px solid #f0f4ff",
                            boxShadow: "0 2px 6px rgba(0, 47, 167, 0.1)",
                          }}
                        >
                          <IonImg
                            src={
                              item.image.includes(
                                "http://127.0.0.1/justify/uploads/"
                              )
                                ? `https://justifi.animal911.me/Justify/uploads/${item.image.replace(
                                    "http://127.0.0.1/justify/uploads/",
                                    ""
                                  )}`
                                : item.image.startsWith("http")
                                ? item.image
                                : `https://justifi.animal911.me/Justify/uploads/${item.image}`
                            }
                            alt="Content Image"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onIonError={(e) => {
                              const target = e.target as HTMLIonImgElement;
                              console.error(
                                `Failed to load image: ${target.src}`
                              );
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "#666",
                          fontSize: "0.85rem",
                          marginBottom: "12px",
                        }}
                      >
                        <IonIcon
                          icon={timeOutline}
                          style={{ marginRight: "4px", fontSize: "1rem" }}
                        />
                        <span>
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : "Date not available"}
                        </span>
                      </div>

                      {/* Recipients section for announcements */}
                      {item.contentType === "announcement" && (
                        <div
                          style={{
                            background: "#f0f4ff",
                            borderRadius: "8px",
                            padding: "12px",
                            marginTop: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: "8px",
                              color: "#002fa7",
                            }}
                          >
                            <IonIcon
                              icon={people}
                              style={{ marginRight: "8px", fontSize: "1.1rem" }}
                            />
                            <span style={{ fontWeight: "500" }}>
                              Recipients
                            </span>
                          </div>

                          {item.target_all ? (
                            <div
                              style={{
                                background: "#9be368",
                                color: "#002fa7",
                                padding: "4px 12px",
                                borderRadius: "16px",
                                display: "inline-block",
                                fontWeight: "500",
                                fontSize: "0.9rem",
                              }}
                            >
                              <span>
                                Users ({item.recipient_count || "All"})
                              </span>
                            </div>
                          ) : (
                            <div>
                              {Array.isArray(item.recipient_preview) &&
                              item.recipient_preview.length > 0 ? (
                                <>
                                  <div
                                    style={{
                                      marginBottom: "8px",
                                      color: "#002fa7",
                                      fontSize: "0.9rem",
                                    }}
                                  >
                                    Sent to {item.recipient_count}{" "}
                                    {item.recipient_count === 1
                                      ? "person"
                                      : "people"}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "6px",
                                    }}
                                  >
                                    {item.recipient_preview.map((name, idx) => {
                                      // Ensure name is a string before calling includes
                                      const nameStr =
                                        typeof name === "string"
                                          ? name
                                          : String(name || "");
                                      return !nameStr.includes("...and") ? (
                                        <div
                                          key={idx}
                                          style={{
                                            background: "#e6efff",
                                            color: "#002fa7",
                                            padding: "4px 10px",
                                            borderRadius: "16px",
                                            fontSize: "0.85rem",
                                          }}
                                        >
                                          {nameStr}
                                        </div>
                                      ) : (
                                        <div
                                          key={idx}
                                          style={{
                                            background: "#002fa7",
                                            color: "white",
                                            padding: "4px 10px",
                                            borderRadius: "16px",
                                            fontSize: "0.85rem",
                                          }}
                                        >
                                          {nameStr}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div
                                  style={{
                                    color: "#666",
                                    fontStyle: "italic",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  No specific recipients
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          borderTop: "1px solid #f0f4ff",
                          marginTop: "12px",
                          paddingTop: "12px",
                        }}
                      >
                        <IonButton
                          fill="clear"
                          style={{ "--color": "#002fa7" }}
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
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px",
                    background: "#f0f4ff",
                    borderRadius: "8px",
                    color: "#666",
                    border: "1px dashed #002fa7",
                  }}
                >
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
                    style={{
                      "--background": "#9be368",
                      "--color": "#002fa7",
                    }}
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
        style={{
          "--background": "#002fa7",
          "--color": "white",
        }}
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
        style={{
          "--background": "#ffffff",
          "--color": "#333333",
        }}
      />
    </IonContent>
  );
};

export default NewsContainer;
