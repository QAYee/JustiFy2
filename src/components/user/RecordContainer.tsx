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
  IonSegment,
  IonSegmentButton,
  IonAccordion,
  IonAccordionGroup,
  IonDatetime,
  IonModal,
  IonSelect,
  IonSelectOption,
} from "@ionic/react"
import {
  documentTextOutline,
  calendarOutline,
  downloadOutline,
  printOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
} from "ionicons/icons"

interface Record {
  id: number
  title: string
  type: string
  date: string
  status: "pending" | "approved" | "rejected" | "completed"
  details: string
  reference: string
}

const RecordContainer: React.FC<{ name: string }> = ({ name }) => {
  const [records, setRecords] = useState<Record[]>([])
  const [searchText, setSearchText] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Dummy records data
  const dummyRecords: Record[] = [
    {
      id: 1001,
      title: "Barangay Clearance",
      type: "Certificate",
      date: "2023-10-15",
      status: "approved",
      details: "Barangay clearance for employment purposes.",
      reference: "CERT-2023-1001",
    },
    {
      id: 1002,
      title: "Residency Certificate",
      type: "Certificate",
      date: "2023-10-10",
      status: "completed",
      details: "Certificate of residency for school enrollment.",
      reference: "CERT-2023-1002",
    },
    {
      id: 1003,
      title: "Business Permit Application",
      type: "Permit",
      date: "2023-10-05",
      status: "pending",
      details: "Application for small business permit for sari-sari store.",
      reference: "PERM-2023-1003",
    },
    {
      id: 1004,
      title: "Indigency Certificate",
      type: "Certificate",
      date: "2023-09-28",
      status: "approved",
      details: "Certificate of indigency for medical assistance.",
      reference: "CERT-2023-1004",
    },
    {
      id: 1005,
      title: "Building Permit Endorsement",
      type: "Endorsement",
      date: "2023-09-20",
      status: "rejected",
      details: "Endorsement for building permit application. Rejected due to incomplete requirements.",
      reference: "ENDO-2023-1005",
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

  const getFilteredRecords = () => {
    let filtered = [...records]

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((record) => record.status === filter)
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
          record.details.toLowerCase().includes(searchLower),
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
      
        <IonCardHeader>
          <IonCardTitle>My Records</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
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

            <IonSelect interface="popover" placeholder="Document Type" style={{ maxWidth: "150px" }}>
              <IonSelectOption value="all">All Types</IonSelectOption>
              <IonSelectOption value="Certificate">Certificates</IonSelectOption>
              <IonSelectOption value="Permit">Permits</IonSelectOption>
              <IonSelectOption value="Endorsement">Endorsements</IonSelectOption>
            </IonSelect>
          </div>

          <IonSegment value={filter} onIonChange={(e) => setFilter(e.detail.value!)} scrollable>
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
          <IonAccordionGroup>
            {getFilteredRecords().map((record) => (
              <IonAccordion key={record.id}>
                <IonItem slot="header">
                  <IonIcon icon={documentTextOutline} slot="start" />
                  <IonLabel>
                    <h2>{record.title}</h2>
                    <p>
                      {record.type} • {record.date}
                    </p>
                  </IonLabel>
                  {getStatusChip(record.status)}
                </IonItem>

                <div slot="content" className="ion-padding">
                  <p>
                    <strong>Reference:</strong> {record.reference}
                  </p>
                  <p>
                    <strong>Details:</strong> {record.details}
                  </p>
                  <p>
                    <strong>Date:</strong> {record.date}
                  </p>
                  <p>
                    <strong>Status:</strong> {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </p>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
                    <IonButton size="small" fill="outline">
                      <IonIcon slot="start" icon={downloadOutline} />
                      Download
                    </IonButton>
                    <IonButton size="small" fill="outline">
                      <IonIcon slot="start" icon={printOutline} />
                      Print
                    </IonButton>
                  </div>
                </div>
              </IonAccordion>
            ))}
          </IonAccordionGroup>
        ) : (
          <IonItem>
            <IonLabel className="ion-text-center">No records found matching your criteria.</IonLabel>
          </IonItem>
        )}
      </IonList>
    </IonContent>
  )
}

export default RecordContainer

