import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import { useUsers, useUpdateUserRole, useToggleUserStatus, useDeleteUser } from '@/features/users/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { 
  Users as UsersIcon, 
  Search, 
  MoreVertical, 
  Eye, 
  Shield, 
  ShieldCheck,
  User,
  Trash2, 
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar
} from 'lucide-react'
import {UserRole } from '@/types'
import { format } from 'date-fns'

export default function UsersAdmin() {
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null)

  const { data: usersData, isLoading } = useUsers({
    page,
    limit,
    search: searchQuery || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  })

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { mutate: updateRole } = useUpdateUserRole()
  const { mutate: toggleStatus } = useToggleUserStatus()

  const handleDeleteClick = (userId: string, userName: string) => {
    setUserToDelete({ id: userId, name: userName })
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setUserToDelete(null)
        },
      })
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateRole({ userId, role: newRole })
  }

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    toggleStatus({ userId, isActive: !currentStatus })
  }

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      ADMIN: { variant: 'default' as const, icon: ShieldCheck, label: 'Admin' },
      OWNER: { variant: 'secondary' as const, icon: Shield, label: 'Owner' },
      CLIENT: { variant: 'outline' as const, icon: User, label: 'User' },
    }

    const config = roleConfig[role]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const exportToCSV = () => {
    alert('Export functionality coming soon!')
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="mt-2 text-gray-600">
              View and manage all users in the system
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(value) => setRoleFilter(value as UserRole | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.OWNER}>Owner</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users List
              {usersData && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({usersData?.length || 0} results)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : usersData && usersData.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                  {user.firstName[0]}{user.lastName[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                {user.isVerified && (
                                  <span className="text-xs text-blue-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Verified
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.isActive ? (
                              <Badge variant="success" className="flex items-center gap-1 w-fit">
                                <CheckCircle className="w-3 h-3" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="flex items-center gap-1 w-fit">
                                <XCircle className="w-3 h-3" />
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-gray-600 space-y-1">
                              {user._count?.rentals !== undefined && (
                                <p>{user._count.rentals} rentals</p>
                              )}
                              {user._count?.bookings !== undefined && (
                                <p>{user._count.bookings} bookings</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="text-xs font-normal text-gray-500">
                                  Change Role
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.id, UserRole.ADMIN)}
                                  disabled={user.role === UserRole.ADMIN}
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2 text-blue-600" />
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.id, UserRole.OWNER)}
                                  disabled={user.role === UserRole.OWNER}
                                >
                                  <Shield className="w-4 h-4 mr-2 text-purple-600" />
                                  Make Owner
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleRoleChange(user.id, UserRole.CLIENT)}
                                  disabled={user.role === UserRole.CLIENT}
                                >
                                  <User className="w-4 h-4 mr-2 text-gray-600" />
                                  Make User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(user.id, user.isActive)}
                                >
                                  {user.isActive ? (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2 text-orange-600" />
                                      Deactivate User
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                                      Activate User
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(user.id, `${user.firstName} ${user.lastName}`)}
                                  className="text-red-600 focus:text-red-700"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing page {page}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={usersData.length < limit}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState
                icon={UsersIcon}
                title="No users found"
                description={
                  searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No users in the system yet'
                }
              />
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{' '}
                <span className="font-semibold text-gray-900">{userToDelete?.name}</span> and remove
                all associated data including cars, bookings, and reviews. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}