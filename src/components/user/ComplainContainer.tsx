"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonTextarea,
  IonIcon,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonModal,
  IonList,
} from "@ionic/react"
import { documentTextOutline, calendarOutline, personOutline, sendOutline } from "ionicons/icons"
import "./ComplainContainer.css"

interface ComplaintType {
  id: number
  name: string
  description: string
}

const ComplainContainer: React.FC = () => {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null)
  const [respondent, setRespondent] = useState("")
  const [details, setDetails] = useState("")
  const [incidentDate, setIncidentDate] = useState("")
  const [complaintType, setComplaintType] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; success: boolean } | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Dummy complaint types
  const complaintTypes: ComplaintType[] = [
    { id: 1, name: "Noise Complaint", description: "Report excessive noise from neighbors or establishments" },
    { id: 2, name: "Property Dispute", description: "Issues related to property boundaries or ownership" },
    { id: 3, name: "Public Disturbance", description: "Report disruptive behavior in public spaces" },
    { id: 4, name: "Utility Issue", description: "Problems with water, electricity, or other utilities" },
    { id: 5, name: "Environmental Concern", description: "Issues related to pollution, waste disposal, etc." },
  ]

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser?.id && parsedUser?.name) {
          setUser(parsedUser)
        } else {
          // Create dummy user if data is incomplete
          setUser({
            id: 1001,
            name: parsedUser?.name || "John Doe",
          })
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error)
        // Fallback to dummy user
        setUser({
          id: 1001,
          name: "John Doe",
        })
      }
    } else {
      // Fallback to dummy user for preview
      setUser({
        id: 1001,
        name: "John Doe",
      })
    }
  }, [])

  const handleDateChange = (e: CustomEvent) => {
    const selectedDate = e.detail.value!.split("T")[0] // Extract only the date part (YYYY-MM-DD)
    setIncidentDate(selectedDate)
    setShowDatePicker(false)
  }

  const handleSubmit = async () => {
    if (!user) {
      setShowToast({ message: "You must be logged in to submit a complaint.", success: false })
      return
    }

    if (!respondent.trim()) {
      setShowToast({ message: "Respondent name is required.", success: false })
      return
    }

    if (!details.trim()) {
      setShowToast({ message: "Complaint details are required.", success: false })
      return
    }

    if (!incidentDate) {
      setShowToast({ message: "Incident date is required.", success: false })
      return
    }

    const complaintData = {
      user_id: user.id,
      complainant: user.name,
      respondent,
      details,
      incident_date: incidentDate,
      complaint_type: complaintType,
    }

    setLoading(true)

    try {
      // Simulate API call for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log("Sending data:", JSON.stringify(complaintData))

      // Show success message
      setShowToast({ message: "Complaint submitted successfully! Reference #COMP-2023-1042", success: true })

      // Reset form
      setRespondent("")
      setDetails("")
      setIncidentDate("")
      setComplaintType(1)
    } catch (error) {
      console.error("Error submitting complaint:", error)
      setShowToast({
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        success: false,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
  
      <IonContent className="ion-padding" color="light">
        <div className="complaint-form-container">
          <h2 className="form-title">Barangay Complaint Form</h2>
          <p className="form-subtitle">
            Please provide accurate information to help us process your complaint efficiently.
          </p>

          <IonCard className="form-card">
            <IonCardHeader>
              <IonCardTitle>Complaint Information</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <div className="form-section">
                <h3 className="section-title">Complainant Details</h3>

                <IonItem lines="full" className="form-item">
                  <IonLabel position="stacked" className="required-field">
                    Complainant
                  </IonLabel>
                  <IonInput value={user ? user.name : ""} readonly placeholder="Your name">
                    <IonIcon slot="start" icon={personOutline} />
                  </IonInput>
                </IonItem>
              </div>

              <div className="form-section">
                <h3 className="section-title">Complaint Details</h3>

                <IonItem lines="full" className="form-item">
                  <IonLabel position="stacked" className="required-field">
                    Complaint Type
                  </IonLabel>
                  <IonSelect
                    value={complaintType}
                    onIonChange={(e) => setComplaintType(e.detail.value)}
                    interface="popover"
                    placeholder="Select complaint type"
                  >
                    {complaintTypes.map((type) => (
                      <IonSelectOption key={type.id} value={type.id}>
                        {type.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem lines="full" className="form-item">
                  <IonLabel position="stacked" className="required-field">
                    Respondent
                  </IonLabel>
                  <IonInput
                    placeholder="Enter respondent's name"
                    value={respondent}
                    onIonChange={(e) => setRespondent(e.detail.value!)}
                    clearInput={true}
                  >
                    <IonIcon slot="start" icon={personOutline} />
                  </IonInput>
                </IonItem>

                <IonItem lines="full" className="form-item">
                  <IonLabel position="stacked" className="required-field">
                    Date of Incident
                  </IonLabel>
                  <IonInput
                    placeholder="YYYY-MM-DD"
                    value={incidentDate}
                    readonly
                    onClick={() => setShowDatePicker(true)}
                  >
                    <IonIcon slot="start" icon={calendarOutline} />
                  </IonInput>
                </IonItem>

                <IonModal isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
                  <IonContent>
                    <IonDatetime value={incidentDate} presentation="date" onIonChange={handleDateChange} />
                    <IonButton expand="block" onClick={() => setShowDatePicker(false)}>
                      Done
                    </IonButton>
                  </IonContent>
                </IonModal>

                <IonItem lines="full" className="form-item">
                  <IonLabel position="stacked" className="required-field">
                    Complaint Details
                  </IonLabel>
                  <IonTextarea
                    placeholder="Provide detailed description of your complaint"
                    value={details}
                    onIonChange={(e) => setDetails(e.detail.value!)}
                    rows={6}
                    className="complaint-details"
                  >
                    <IonIcon slot="start" icon={documentTextOutline} />
                  </IonTextarea>
                </IonItem>
              </div>

              <div className="form-actions">
                <IonButton expand="block" fill="outline" className="form-button">
                  Cancel
                </IonButton>
                <IonButton
                  expand="block"
                  color="primary"
                  className="form-button"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <IonSpinner name="dots" />
                  ) : (
                    <>
                      <IonIcon slot="start" icon={sendOutline} />
                      Submit Complaint
                    </>
                  )}
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Recent complaints preview */}
          <IonCard className="form-card" style={{ marginTop: "20px" }}>
            <IonCardHeader>
              <IonCardTitle>Your Recent Complaints</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel>
                    <h2>Noise Complaint</h2>
                    <p>Against: Rodriguez Family</p>
                    <p>
                      Status:{" "}
                      <IonChip color="warning" outline={true} size="small">
                        Pending
                      </IonChip>
                    </p>
                    <p>Date: 2023-10-15</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Property Dispute</h2>
                    <p>Against: Maria Santos</p>
                    <p>
                      Status:{" "}
                      <IonChip color="success" outline={true} size="small">
                        Resolved
                      </IonChip>
                    </p>
                    <p>Date: 2023-09-22</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Utility Issue</h2>
                    <p>Against: Water District Office</p>
                    <p>
                      Status:{" "}
                      <IonChip color="primary" outline={true} size="small">
                        Processing
                      </IonChip>
                    </p>
                    <p>Date: 2023-08-30</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        </div>

        {showToast && (
          <IonToast
            isOpen={!!showToast}
            message={showToast.message}
            duration={3000}
            color={showToast.success ? "success" : "danger"}
            onDidDismiss={() => setShowToast(null)}
          />
        )}
      </IonContent>
    </>
  )
}

export default ComplainContainer

