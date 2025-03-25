"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { IonButton, IonCard, IonIcon, IonChip, IonLabel } from "@ionic/react"
import {
  logOutOutline,
  personCircleOutline,
  documentTextOutline,
  notificationsOutline,
  homeOutline,
} from "ionicons/icons"
import { useHistory } from "react-router-dom"
import "./DashboardContainer.css"

interface UserData {
  name: string
  email: string
  address: string
  phone?: string
  birthdate?: string
  age?: string
  [key: string]: any
}

const DashboardContainer: React.FC = () => {
  const history = useHistory()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState({
    complaints: 3,
    pendingTickets: 2,
    notifications: 5,
  })

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user")

    if (!loggedInUser) {
      history.replace("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(loggedInUser)

      // Enhanced user data with dummy values if missing
      const enhancedUser: UserData = {
        name: parsedUser.name || "John Doe",
        email: parsedUser.email || "john.doe@example.com",
        address: parsedUser.address || "123 Main St, Anytown, PH",
        phone: parsedUser.phone || "+63 912 345 6789",
        birthdate: parsedUser.birthdate || "1990-01-01",
        age: parsedUser.age || "33",
        ...parsedUser,
      }

      // Remove sensitive or unnecessary fields
      const { ID, created_at, admin, password, ...filteredUser } = enhancedUser
      setUser(filteredUser)
    } catch (error) {
      console.error("Error parsing user data:", error)
      history.replace("/login")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("userInfo")
    history.replace("/login")
  }

  if (!user) {
    return <div className="dashboard-content">Loading user profile...</div>
  }

  return (
    <div className="dashboard-content">
      <IonCard className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-avatar">
            <IonIcon icon={personCircleOutline} />
          </div>
          <h2 className="dashboard-title">Welcome, {user.name}!</h2>
          <p className="dashboard-subtitle">Citizen Account</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
            <IonChip color="light" outline={true}>
              <IonIcon icon={documentTextOutline} />
              <IonLabel>{stats.complaints} Complaints</IonLabel>
            </IonChip>
            <IonChip color="light" outline={true}>
              <IonIcon icon={notificationsOutline} />
              <IonLabel>{stats.notifications} Notifications</IonLabel>
            </IonChip>
          </div>
        </div>

        <div className="user-info">
          <div className="info-item">
            <div className="info-label">Full Name</div>
            <div className="info-value">{user.name}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">{user.email}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Address</div>
            <div className="info-value">{user.address}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Phone</div>
            <div className="info-value">{user.phone}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Birthdate</div>
            <div className="info-value">{user.birthdate}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Age</div>
            <div className="info-value">{user.age}</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <IonButton expand="block" fill="outline" onClick={() => history.push("/home")}>
            <IonIcon slot="start" icon={homeOutline} />
            Home
          </IonButton>
          <IonButton expand="block" color="danger" onClick={handleLogout}>
            <IonIcon slot="start" icon={logOutOutline} />
            Logout
          </IonButton>
        </div>
      </IonCard>
    </div>
  )
}

export default DashboardContainer

