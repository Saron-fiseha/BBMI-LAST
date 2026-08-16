"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Loader2, AlertCircle, ShieldAlert, Search, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"

interface Admin {
  id: string
  full_name: string
  email: string
  role: string
  is_super_admin: boolean
  privileges: string[] | null
}

interface BasicUser {
  id: string
  full_name: string
  email: string
  role: string
}

const PRIVILEGE_GROUPS = [
  {
    module: "Dashboard",
    privileges: [{ id: "view_dashboard", label: "Dashboard view" }]
  },
  {
    module: "User Accounts",
    privileges: [
      { id: "view_user_management", label: "User accounts view" },
      { id: "add_users", label: "Add users" },
      { id: "edit_users", label: "Edit user information" },
      { id: "delete_users", label: "Delete user" },
      { id: "export_users", label: "Export user" },
    ]
  },
  {
    module: "Categories",
    privileges: [
      { id: "view_categories", label: "Categories view" },
      { id: "add_categories", label: "Add categories" },
      { id: "edit_categories", label: "Edit categories" },
      { id: "delete_categories", label: "Delete category" },
      { id: "export_categories", label: "Export categories" },
    ]
  },
  {
    module: "Trainings",
    privileges: [
      { id: "view_trainings", label: "Trainings view" },
      { id: "add_trainings", label: "Add trainings" },
      { id: "edit_trainings", label: "Edit trainings" },
      { id: "delete_trainings", label: "Delete training" },
      { id: "export_trainings", label: "Export trainings" },
    ]
  },
  {
    module: "Modules",
    privileges: [
      { id: "view_modules", label: "Modules view" },
      { id: "add_modules", label: "Add modules" },
      { id: "edit_modules", label: "Edit modules" },
      { id: "delete_modules", label: "Delete module" },
      { id: "export_modules", label: "Export modules" },
    ]
  },
  {
    module: "Students",
    privileges: [
      { id: "view_students", label: "Students view" },
      { id: "add_students", label: "Add students" },
      { id: "edit_students", label: "Edit students" },
      { id: "delete_students", label: "Delete student" },
      { id: "export_students", label: "Export students" },
    ]
  },
  {
    module: "Instructors",
    privileges: [
      { id: "view_instructors", label: "Instructors view" },
      { id: "add_instructors", label: "Add instructors" },
      { id: "edit_instructors", label: "Edit instructors" },
      { id: "delete_instructors", label: "Delete instructor" },
      { id: "export_instructors", label: "Export instructors" },
    ]
  },
  {
    module: "Promotion",
    privileges: [
      { id: "view_promotion", label: "Promotion view" },
      { id: "add_promotion", label: "Add promotion" },
      { id: "edit_promotion", label: "Edit promotion" },
      { id: "delete_promotion", label: "Delete promotion" },
      { id: "export_promotion", label: "Export promotion" },
    ]
  }
]

const getPrivilegeLabel = (id: string) => {
  for (const group of PRIVILEGE_GROUPS) {
    const found = group.privileges.find(p => p.id === id)
    if (found) return found.label
  }
  return id
}

export default function RoleManagementPage() {
  const { toast } = useToast()
  
  const [admins, setAdmins] = useState<Admin[]>([])
  const [allUsers, setAllUsers] = useState<BasicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          admin.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === "all" || 
                        (filterRole === "super" && admin.is_super_admin) ||
                        (filterRole === "admin" && !admin.is_super_admin)
    return matchesSearch && matchesRole
  })

  const handleExport = () => {
    try {
      const headers = ["Name", "Email", "Type", "Privileges"]
      const csvContent = [
        headers.join(","),
        ...filteredAdmins.map(admin => {
          const type = admin.is_super_admin ? "Super Admin" : "Admin"
          const privs = admin.is_super_admin ? "All privileges" : (admin.privileges?.map(getPrivilegeLabel).join(" | ") || "None assigned")
          // Escape quotes
          return `"${admin.full_name.replace(/"/g, '""')}","${admin.email}","${type}","${privs}"`
        })
      ].join("\n")

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `admins_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      toast({ title: "Export Failed", description: "Could not export admin data.", variant: "destructive" })
    }
  }

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/roles", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to fetch roles")
      
      setAdmins(data.admins || [])
      setAllUsers(data.allUsers || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const handlePrivilegeToggle = (privilegeId: string) => {
    setSelectedPrivileges(prev => 
      prev.includes(privilegeId) 
        ? prev.filter(p => p !== privilegeId)
        : [...prev, privilegeId]
    )
  }

  const handleOpenAdd = () => {
    setEditingAdmin(null)
    setSelectedUserId("")
    setSelectedPrivileges([])
    setShowForm(true)
  }

  const handleOpenEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setSelectedUserId(admin.id.toString())
    setSelectedPrivileges(admin.privileges || [])
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      toast({ title: "Error", description: "Please select a user", variant: "destructive" })
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/admin/roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUserId,
          privileges: selectedPrivileges
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to save roles")

      toast({ title: "Success", description: "Roles updated successfully" })
      setShowForm(false)
      fetchRoles()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevoke = async (adminId: string) => {
    if (!confirm("Are you sure you want to revoke admin rights for this user?")) return
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/admin/roles?userId=${adminId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to revoke admin")
      
      toast({ title: "Success", description: "Admin rights revoked" })
      fetchRoles()
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="relative space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-mustard" /> Role Management
          </h1>
          <p className="text-sm sm:text-base text-deep-purple mt-1">Manage sub-admin privileges</p>
        </div>
        {!showForm && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleExport} disabled={loading || filteredAdmins.length === 0} className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
            <Button onClick={handleOpenAdd} className="w-full sm:w-auto transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" /> Add Admin
            </Button>
          </div>
        )}
      </div>

      {!showForm && (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-deep-purple" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8 border-mustard/20 focus:border-mustard"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-[180px] border-mustard/20 focus:border-mustard">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-ivory border-mustard/20">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="super">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-mustard h-8 w-8" /></div>
      ) : showForm ? (
        <div className="bg-ivory border border-mustard/20 rounded-lg p-6 max-w-4xl">
          <h2 className="text-xl font-semibold mb-6">{editingAdmin ? "Edit Admin" : "Add Admin"}</h2>
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Select User</label>
              <Select 
                value={selectedUserId} 
                onValueChange={setSelectedUserId} 
                disabled={!!editingAdmin}
              >
                <SelectTrigger className="w-full sm:w-[400px]">
                  <SelectValue placeholder="Select a user to grant admin rights" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map(u => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.full_name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-4">Select Privileges</h3>
              <div className="space-y-4">
                {PRIVILEGE_GROUPS.map(group => (
                  <div key={group.module} className="border border-mustard/20 rounded-md p-4 bg-white">
                    <h4 className="font-semibold text-sm mb-3 text-deep-purple">{group.module}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {group.privileges.map(privilege => (
                        <div key={privilege.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={privilege.id} 
                            checked={selectedPrivileges.includes(privilege.id)}
                            onCheckedChange={() => handlePrivilegeToggle(privilege.id)}
                          />
                          <label htmlFor={privilege.id} className="text-sm cursor-pointer whitespace-nowrap">{privilege.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-ivory border border-mustard/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-mustard/10">
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Privileges</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">No admins found.</TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin, index) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                    <TableCell className="font-medium">{admin.full_name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      {admin.is_super_admin ? (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200 whitespace-nowrap">Super Admin</Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 whitespace-nowrap">Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.is_super_admin ? (
                        <span className="text-sm text-gray-500 italic">All privileges</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {admin.privileges?.length ? (
                            admin.privileges.map(p => (
                              <Badge key={p} variant="outline" className="text-xs bg-white">{getPrivilegeLabel(p)}</Badge>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">None assigned</span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!admin.is_super_admin && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleOpenEdit(admin)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRevoke(admin.id.toString())} className="border-red-200 text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
