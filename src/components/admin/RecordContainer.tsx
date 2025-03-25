"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonSearchbar,
  IonChip,
  IonIcon,
  IonButton,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonDatetime,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from "@ionic/react"
import {
  documentTextOutline,
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
  addOutline,
  createOutline,
} from "ionicons/icons"

interface Record {
  id: number
  title: string
  type: string
  date: string
  status: "pending" | "approved" | "rejected" | "completed"
  details: string
  reference: string
  requestedBy: string
  contactInfo?: string
}

const RecordContainer: React.FC<{ name: string }> = ({ name }) => {
  const [records, setRecords] = useState<Record[]>([])
  const [searchText, setSearchText] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [recordType, setRecordType] = useState<string>("all")

  // Dummy records data for admin
  const dummyRecords: Record[] = [
    {
      id: 1001,
      title: "Barangay Clearance",
      type: "Certificate",
      date: "2023-10-15",
      status: "approved",
      details: "Barangay clearance for employment purposes.",
      reference: "CERT-2023-1001",
      requestedBy: "Juan Dela Cruz",
      contactInfo: "+63 912 345 6789",
    },
    {
      id: 1002,
      title: "Residency Certificate",
      type: "Certificate",
      date: "2023-10-10",
      status: "completed",
      details: "Certificate of residency for school enrollment.",
      reference: "CERT-2023-1002",
      requestedBy: "Maria Garcia",
      contactInfo: "+63 923 456 7890",
    },
    {
      id: 1003,
      title: "Business Permit Application",
      type: "Permit",
      date: "2023-10-05",
      status: "pending",
      details: "Application for small business permit for sari-sari store.",
      reference: "PERM-2023-1003",
      requestedBy: "Roberto Reyes",
      contactInfo: "+63 934 567 8901",
    },
    {
      id: 1004,
      title: "Indigency Certificate",
      type: "Certificate",
      date: "2023-09-28",
      status: "approved",
      details: "Certificate of indigency for medical assistance.",
      reference: "CERT-2023-1004",
      requestedBy: "Elena Santos",
      contactInfo: "+63 945 678 9012",
    },
    {
      id: 1005,
      title: "Building Permit Endorsement",
      type: "Endorsement",
      date: "2023-09-20",
      status: "rejected",
      details: "Endorsement for building permit application. Rejected due to incomplete requirements.",
      reference: "ENDO-2023-1005",
      requestedBy: "Antonio Villanueva",
      contactInfo: "+63 956 789 0123",
    },
    {
      id: 1006,
      title: "Good Moral Character",
      type: "Certificate",
      date: "2023-09-18",
      status: "pending",
      details: "Certificate of good moral character for scholarship application.",
      reference: "CERT-2023-1006",
      requestedBy: "Sophia Lim",
      contactInfo: "+63 967 890 1234",
    },
    {
      id: 1007,
      title: "Barangay ID",
      type: "ID",
      date: "2023-09-15",
      status: "approved",
      details: "Application for barangay identification card.",
      reference: "ID-2023-1007",
      requestedBy: "Miguel Rodriguez",
      contactInfo: "+63 978 901 2345",
    },
  ]

  useEffect(() => {
    // Simulate API call to fetch records
    const fetchRecords = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setRecords(dummyRecords)
      setLoading(false)
    }

    fetchRecords()
  }, [])

  const handleDateChange = (e: CustomEvent) => {
    const date = new Date(e.detail.value)
    setSelectedDate(date.toISOString().split("T")[0])
    setShowDatePicker(false)
  }

  const clearDateFilter = () => {
    setSelectedDate(null)
  }

  const approveRecord = (id: number) => {
    setRecords(records.map((record) => (record.id === id ? { ...record, status: "approved" } : record)))
  }

  const rejectRecord = (id: number) => {
    setRecords(records.map((record) => (record.id === id ? { ...record, status: "rejected" } : record)))
  }

  const getFilteredRecords = () => {
    let filtered = [...records]

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((record) => record.status === filter)
    }

    // Apply type filter
    if (recordType !== "all") {
      filtered = filtered.filter((record) => record.type === recordType)
    }

    // Apply date filter
    if (selectedDate) {
      filtered = filtered.filter((record) => record.date === selectedDate)
    }

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(searchLower) ||
          record.type.toLowerCase().includes(searchLower) ||
          record.reference.toLowerCase().includes(searchLower) ||
          record.details.toLowerCase().includes(searchLower) ||
          record.requestedBy.toLowerCase().includes(searchLower),
      )
    }

    return filtered
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <IonChip color="warning" outline={true}>
            <IonIcon icon={hourglassOutline} />
            Pending
          </IonChip>
        )
      case "approved":
        return (
          <IonChip color="primary" outline={true}>
            <IonIcon icon={checkmarkCircleOutline} />
            Approved
          </IonChip>
        )
      case "completed":
        return (
          <IonChip color="success" outline={true}>
            <IonIcon icon={checkmarkCircleOutline} />
            Completed
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
    <IonContent color="light">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Records Management</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>Total Records</span>
                    <strong>{records.length}</strong>
                  </div>
                </div>
              </IonCol>
              <IonCol size="12" sizeMd="6">
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <IonChip color="warning">
                    <IonLabel>Pending: {records.filter((r) => r.status === "pending").length}</IonLabel>
                  </IonChip>
                  <IonChip color="primary">
                    <IonLabel>Approved: {records.filter((r) => r.status === "approved").length}</IonLabel>
                  </IonChip>
                  <IonChip color="success">
                    <IonLabel>Completed: {records.filter((r) => r.status === "completed").length}</IonLabel>
                  </IonChip>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonSearchbar
            value={searchText}
            onIonChange={(e) => setSearchText(e.detail.value!)}
            placeholder="Search records"
            animated
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <IonButton size="small" fill="clear" onClick={() => setShowDatePicker(true)}>
              <IonIcon slot="start" icon={calendarOutline} />
              {selectedDate ? selectedDate : "Filter by Date"}
            </IonButton>

            {selectedDate && (
              <IonButton size="small" fill="clear" onClick={clearDateFilter}>
                Clear Date
              </IonButton>
            )}

            <IonSelect
              interface="popover"
              placeholder="Document Type"
              value={recordType}
              onIonChange={(e) => setRecordType(e.detail.value)}
              style={{ maxWidth: "150px" }}
            >
              <IonSelectOption value="all">All Types</IonSelectOption>
              <IonSelectOption value="Certificate">Certificates</IonSelectOption>
              <IonSelectOption value="Permit">Permits</IonSelectOption>
              <IonSelectOption value="Endorsement">Endorsements</IonSelectOption>
              <IonSelectOption value="ID">IDs</IonSelectOption>
            </IonSelect>
          </div>

          <IonSegment value={filter} onIonChange={(e) => setFilter(e.detail.value!)}>
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="pending">
              <IonLabel>Pending</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="approved">
              <IonLabel>Approved</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completed</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonCardContent>
      </IonCard>

      <IonModal isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
        <IonContent>
          <IonDatetime presentation="date" onIonChange={handleDateChange} />
          <IonButton expand="block" onClick={() => setShowDatePicker(false)}>
            Cancel
          </IonButton>
        </IonContent>
      </IonModal>

      <IonList inset={true}>
        {loading ? (
          <IonItem>
            <IonLabel className="ion-text-center">Loading records...</IonLabel>
          </IonItem>
        ) : getFilteredRecords().length > 0 ? (
          getFilteredRecords().map((record) => (
            <IonItemSliding key={record.id}>
              <IonItem>
                <IonIcon icon={documentTextOutline} slot="start" />
                <IonLabel>
                  <h2>
                    {record.title} <IonBadge color="medium">#{record.id}</IonBadge>
                  </h2>
                  <h3>Requested by: {record.requestedBy}</h3>
                  <p>
                    {record.type} • {record.date} • {record.reference}
                  </p>
                </IonLabel>
                {getStatusChip(record.status)}
              </IonItem>

              <IonItemOptions side="end">
                {record.status === "pending" && (
                  <>
                    <IonItemOption color="primary" onClick={() => approveRecord(record.id)}>
                      <IonIcon slot="icon-only" icon={checkmarkCircleOutline} />
                    </IonItemOption>
                    <IonItemOption color="danger" onClick={() => rejectRecord(record.id)}>
                      <IonIcon slot="icon-only" icon={closeCircleOutline} />
                    </IonItemOption>
                  </>
                )}
                <IonItemOption color="tertiary">
                  <IonIcon slot="icon-only" icon={createOutline} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))
        ) : (
          <IonItem>
            <IonLabel className="ion-text-center">No records found matching your criteria.</IonLabel>
          </IonItem>
        )}
      </IonList>

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonContent>
  )
}

export default RecordContainer

