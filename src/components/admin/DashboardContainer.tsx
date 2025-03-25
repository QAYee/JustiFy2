"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { IonButton, IonCard, IonIcon, IonChip, IonLabel } from "@ionic/react"
import { logOutOutline, personCircleOutline, documentTextOutline, homeOutline, peopleOutline } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import "./DashboardContainer.css"

interface AdminData {
  name: string
  email: string
  role?: string
  department?: string
  position?: string
  employeeId?: string
  [key: string]: any
}

const DashboardContainer: React.FC = () => {
  const history = useHistory()
  const [user, setUser] = useState<AdminData | null>(null)
  const [stats, setStats] = useState({
    totalComplaints: 24,
    pendingTickets: 8,
    resolvedCases: 16,
    activeUsers: 42,
  })

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user")

    if (!loggedInUser) {
      history.replace("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(loggedInUser)

      // Enhanced admin data with dummy values if missing
      const enhancedUser: AdminData = {
        name: parsedUser.name || "Admin User",
        email: parsedUser.email || "admin@justify.gov.ph",
        role: "System Administrator",
        department: "IT Department",
        position: "Senior Administrator",
        employeeId: "ADM-2023-001",
        admin: 1,
        ...parsedUser,
      }

      // Remove sensitive or unnecessary fields
      const { id, created_at, password, ...filteredUser } = enhancedUser
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
    return <div className="dashboard-content">Loading admin profile...</div>
  }

  return (
    <div className="dashboard-content">
      <IonCard className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-avatar">
            <IonIcon icon={personCircleOutline} />
          </div>
          <h2 className="dashboard-title">
            {user.name}
            <span className="admin-badge">Admin</span>
          </h2>
          <p className="dashboard-subtitle">{user.role || "Administrator"}</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            <IonChip color="light" outline={true}>
              <IonIcon icon={documentTextOutline} />
              <IonLabel>{stats.totalComplaints} Complaints</IonLabel>
            </IonChip>
            <IonChip color="light" outline={true}>
              <IonIcon icon={peopleOutline} />
              <IonLabel>{stats.activeUsers} Users</IonLabel>
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
            <div className="info-label">Department</div>
            <div className="info-value">{user.department}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Position</div>
            <div className="info-value">{user.position}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Employee ID</div>
            <div className="info-value">{user.employeeId}</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <IonButton expand="block" fill="outline" onClick={() => history.push("/admin/home")}>
            <IonIcon slot="start" icon={homeOutline} />
            Dashboard
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

