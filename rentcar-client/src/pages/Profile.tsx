import { useState, useRef } from 'react'
import Header from '@/components/layout/Header'
import { useMyProfile, useMyStats, useUpdateProfile, useUploadAvatar } from '@/features/users/hooks/useProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, Upload, Edit2, Save, X } from 'lucide-react'
import { getInitials, formatPrice } from '@/lib/utils'
import { format } from 'date-fns'

export function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const { data: stats, isLoading: statsLoading } = useMyStats()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()

  useState(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        licenseNumber: profile.licenseNumber || '',
        licenseExpiry: profile.licenseExpiry ? format(new Date(profile.licenseExpiry), 'yyyy-MM-dd') : '',
      })
    }
  })

  const handleEdit = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        licenseNumber: profile.licenseNumber || '',
        licenseExpiry: profile.licenseExpiry ? format(new Date(profile.licenseExpiry), 'yyyy-MM-dd') : '',
      })
    }
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    updateProfile(formData, {
      onSuccess: () => {
        setIsEditing(false)
      },
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatar(file)
    }
  }

  if (profileLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Profile not found</p>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button size="sm" onClick={handleEdit}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar || undefined} />
                      <AvatarFallback className="text-xl">
                        {getInitials(`${profile.firstName} ${profile.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Change Avatar'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={isEditing ? formData.firstName : profile.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={isEditing ? formData.lastName : profile.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </Label>
                    <Input id="email" value={profile.email} disabled />
                  </div>

                  <div>
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={isEditing ? formData.phone : profile.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+994 XX XXX XX XX"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="licenseNumber">Driver License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={isEditing ? formData.licenseNumber : profile.licenseNumber || ''}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        disabled={!isEditing}
                        placeholder="ABC123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseExpiry">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        License Expiry
                      </Label>
                      <Input
                        id="licenseExpiry"
                        type="date"
                        value={isEditing ? formData.licenseExpiry : (profile.licenseExpiry ? format(new Date(profile.licenseExpiry), 'yyyy-MM-dd') : '')}
                        onChange={(e) => setFormData({ ...formData, licenseExpiry: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600">Account Status:</span>
                      <Badge variant={profile.isActive ? 'success' : 'danger'}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Email Verified:</span>
                      <Badge variant={profile.isVerified ? 'success' : 'warning'}>
                        {profile.isVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </>
                  ) : stats ? (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Total Bookings</p>
                        <p className="text-2xl font-bold">{stats.totalBookings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Active Bookings</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.activeBookings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Spent</p>
                        <p className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reviews Given</p>
                        <p className="text-2xl font-bold">{stats.totalReviews}</p>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    Role: <span className="font-medium">{profile.role}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Member since: <span className="font-medium">
                      {format(new Date(profile.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}