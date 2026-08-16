import { useState, useEffect } from "react"
import { jwtDecode } from "jwt-decode"

export function useAdminPrivileges(modulePrefix: string) {
  const [privileges, setPrivileges] = useState<string[]>([])
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        setPrivileges(decoded.privileges || [])
        setIsSuperAdmin(decoded.is_super_admin || false)
      } catch (e) {
        console.error("Invalid token")
      }
    }
  }, [])

  const canAdd = isSuperAdmin || privileges.includes(`add_${modulePrefix}`)
  const canEdit = isSuperAdmin || privileges.includes(`edit_${modulePrefix}`)
  const canDelete = isSuperAdmin || privileges.includes(`delete_${modulePrefix}`)
  const canExport = isSuperAdmin || privileges.includes(`export_${modulePrefix}`)
  const canView = isSuperAdmin || privileges.includes(`view_${modulePrefix}`)

  return { canAdd, canEdit, canDelete, canExport, canView, isSuperAdmin, privileges }
}
