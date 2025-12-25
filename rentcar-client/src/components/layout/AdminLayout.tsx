import { useAuthStore } from "@/store/useAuthStore"
import { UserRole } from "@/types"
import { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import AdminHeader from "./AdminHeader"
import EmptyState from "../common/EmptyState"
import { ShieldAlert } from "lucide-react"


interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  

  if (user?.role !== UserRole.ADMIN) {
    return (
      <>
        <AdminHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <EmptyState
            icon={ShieldAlert}
            title="Access Denied"
            description="You don't have permission to access the admin panel. Only administrators can view this area."
          />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main>{children}</main>
    </div>
  )
}