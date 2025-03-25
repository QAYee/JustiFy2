"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonToast,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonSearchbar,
  IonIcon,
  IonChip,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonAvatar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
} from "@ionic/react"
import { checkmarkCircleOutline, closeCircleOutline, timeOutline, mailOutline } from "ionicons/icons"

interface Complaint {
  id: number
  complainant: string
  respondent: string
  details: string
  incident_date: string
  status: "pending" | "processing" | "resolved" | "rejected"
  type: string
  avatar?: string
  contact?: string
  address?: string
  created_at: string
}

const ComplainContainer: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")

  // Dummy data for complaints
  const dummyComplaints: Complaint[] = [
    {
      id: 1001,
      complainant: "Juan Dela Cruz",
      respondent: "Pedro Santos",
      details:
        "Excessive noise from karaoke machine during late hours. This has been ongoing for several weeks and is disrupting sleep for the entire neighborhood.",
      incident_date: "2023-10-15",
      status: "pending",
      type: "Noise Complaint",
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      contact: "+63 912 345 6789",
      address: "123 Mabuhay St., Barangay San Isidro",
      created_at: "2023-10-16",
    },
    {
      id: 1002,
      complainant: "Maria Garcia",
      respondent: "Barangay Water System",
      details:
        "No water supply for 3 consecutive days without prior notice. Many families are affected and struggling with basic needs.",
      incident_date: "2023-10-12",
      status: "processing",
      type: "Utility Issue",
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      contact: "+63 923 456 7890",
      address: "45 Sampaguita Ave., Barangay San Isidro",
      created_at: "2023-10-12",
    },
    {
      id: 1003,
      complainant: "Roberto Reyes",
      respondent: "ABC Construction Company",
      details:
        "Construction debris blocking the drainage system causing flooding during rain. This is a hazard especially for children and elderly residents.",
      incident_date: "2023-10-08",
      status: "resolved",
      type: "Environmental Concern",
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      contact: "+63 934 567 8901",
      address: "78 Ilang-Ilang St., Barangay San Isidro",
      created_at: "2023-10-09",
    },
    {
      id: 1004,
      complainant: "Elena Santos",
      respondent: "Marco Rodriguez",
      details:
        "Boundary dispute regarding the fence between our properties. The respondent has moved the fence 2 feet into my property without permission.",
      incident_date: "2023-10-05",
      status: "rejected",
      type: "Property Dispute",
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      contact: "+63 945 678 9012",
      address: "32 Rosal St., Barangay San Isidro",
      created_at: "2023-10-06",
    },
    {
      id: 1005,
      complainant: "Antonio Villanueva",
      respondent: "Local Youth Group",
      details:
        "Group of teenagers loitering and creating disturbance in the basketball court late at night. They are also leaving trash and vandalism.",
      incident_date: "2023-10-02",
      status: "pending",
      type: "Public Disturbance",
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      contact: "+63 956 789 0123",
      address: "15 Dahlia St., Barangay San Isidro",
      created_at: "2023-10-03",
    },
    {
      id: 1006,
      complainant: "Sophia Lim",
      respondent: "Garbage Collection Service",
      details:
        "Irregular garbage collection causing waste to pile up and create health hazards. The schedule is not being followed for over a month now.",
      incident_date: "2023-09-28",
      status: "processing",
      type: "Environmental Concern",
      avatar: "https://ionicframework.com/docs/img/demos/avatar.svg",
      contact: "+63 967 890 1234",
      address: "56 Camia St., Barangay San Isidro",
      created_at: "2023-09-29",
    },
  ]

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        // Simulate API call with dummy data
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setComplaints(dummyComplaints)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchComplaints()
  }, [])

  const handleRefresh = async (event: CustomEvent) => {
    try {
      // Simulate API refresh
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setComplaints(dummyComplaints)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      event.detail.complete()
    }
  }

  const handleInfiniteScroll = async (event: CustomEvent) => {
    // Simulate loading more data
    await new Promise((resolve) => setTimeout(resolve, 1000))
    event.detail.complete()
  }

  const getFilteredComplaints = () => {
    let filtered = [...complaints]

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === filter)
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (complaint) =>
          complaint.complainant.toLowerCase().includes(searchLower) ||
          complaint.respondent.toLowerCase().includes(searchLower) ||
          complaint.details.toLowerCase().includes(searchLower) ||
          complaint.type.toLowerCase().includes(searchLower),
      )
    }

    // Apply sorting
    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.complainant.localeCompare(b.complainant))
    } else if (sortBy === "status") {
      filtered.sort((a, b) => a.status.localeCompare(b.status))
    }

    return filtered
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <IonChip color="warning" outline={true}>
            <IonIcon icon={timeOutline} />
            Pending
          </IonChip>
        )
      case "processing":
        return (
          <IonChip color="primary" outline={true}>
            <IonIcon icon={timeOutline} />
            Processing
          </IonChip>
        )
      case "resolved":
        return (
          <IonChip color="success" outline={true}>
            <IonIcon icon={checkmarkCircleOutline} />
            Resolved
          </IonChip>
        )
      case "rejected":
        return (
          <IonChip color="danger" outline={true}>
            <IonIcon icon={closeCircleOutline} />
            Rejected
          </IonChip>
        )
      default:
        return <IonChip>Unknown</IonChip>
    }
  }

  return (
    <>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="ion-text-center">Complaint Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" color="light">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Complaints Dashboard</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <IonChip color="warning">
                <IonLabel>Pending: {complaints.filter((c) => c.status === "pending").length}</IonLabel>
              </IonChip>
              <IonChip color="primary">
                <IonLabel>Processing: {complaints.filter((c) => c.status === "processing").length}</IonLabel>
              </IonChip>
              <IonChip color="success">
                <IonLabel>Resolved: {complaints.filter((c) => c.status === "resolved").length}</IonLabel>
              </IonChip>
              <IonChip color="danger">
                <IonLabel>Rejected: {complaints.filter((c) => c.status === "rejected").length}</IonLabel>
              </IonChip>
            </div>

            <IonSearchbar
              value={searchText}
              onIonChange={(e) => setSearchText(e.detail.value!)}
              placeholder="Search complaints"
              animated
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", marginBottom: "16px" }}>
              <IonSegment value={filter} onIonChange={(e) => setFilter(e.detail.value as string)}>
                <IonSegmentButton value="all">
                  <IonLabel>All</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="pending">
                  <IonLabel>Pending</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="processing">
                  <IonLabel>Processing</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="resolved">
                  <IonLabel>Resolved</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <IonSelect
                interface="popover"
                value={sortBy}
                onIonChange={(e) => setSortBy(e.detail.value)}
                placeholder="Sort by"
              >
                <IonSelectOption value="date">Date (Newest)</IonSelectOption>
                <IonSelectOption value="name">Complainant Name</IonSelectOption>
                <IonSelectOption value="status">Status</IonSelectOption>
              </IonSelect>
            </div>
          </IonCardContent>
        </IonCard>

        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="dots" />
          </div>
        )}
        {error && <IonToast isOpen message={error} duration={3000} color="danger" />}

        {!loading && !error && (
          <IonList>
            {getFilteredComplaints().length > 0 ? (
              getFilteredComplaints().map((complaint) => (
                <IonItemSliding key={complaint.id}>
                  <IonItem detail={true} button>
                    <IonAvatar slot="start">
                      <img
                        src={complaint.avatar || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                        alt="Avatar"
                      />
                    </IonAvatar>
                    <IonLabel>
                      <h2>
                        {complaint.type} <IonBadge color="medium">#{complaint.id}</IonBadge>
                      </h2>
                      <h3>Complainant: {complaint.complainant}</h3>
                      <p>
                        <strong>Respondent:</strong> {complaint.respondent}
                      </p>
                      <p>
                        <strong>Date:</strong> {complaint.incident_date}
                      </p>
                      <p>{getStatusChip(complaint.status)}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption color="primary">
                      <IonIcon slot="icon-only" icon={mailOutline} />
                    </IonItemOption>
                    <IonItemOption color="success">
                      <IonIcon slot="icon-only" icon={checkmarkCircleOutline} />
                    </IonItemOption>
                    <IonItemOption color="danger">
                      <IonIcon slot="icon-only" icon={closeCircleOutline} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))
            ) : (
              <IonItem>
                <IonLabel className="ion-text-center">No complaints found matching your criteria.</IonLabel>
              </IonItem>
            )}
          </IonList>
        )}

        <IonInfiniteScroll onIonInfinite={handleInfiniteScroll}>
          <IonInfiniteScrollContent loadingText="Loading more complaints..."></IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </>
  )
}

export default ComplainContainer

