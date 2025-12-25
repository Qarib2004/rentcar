import { useState, useRef } from 'react'
import Header from '@/components/layout/Header'
import { useMyProfile, useUpdateProfile, useUploadAvatar } from '@/features/users/hooks/useProfile'
import { useMyOwnerRequest, useCreateOwnerRequest, useCancelOwnerRequest } from '@/features/owner-requests/hooks/useOwnerRequests'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { User, Mail, Phone, Calendar, Upload, Edit2, Save, X, Crown, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { format } from 'date-fns'
import { UserRole } from '@/types'

export function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const { data: ownerRequest, isLoading: requestLoading } = useMyOwnerRequest()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()
  const { mutate: uploadAvatar, isPending: isUploading } = useUploadAvatar()
  const { mutate: createRequest, isPending: isCreatingRequest } = useCreateOwnerRequest()
  const { mutate: cancelRequest, isPending: isCancellingRequest } = useCancelOwnerRequest()

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
    const payload = {
      ...formData,
      licenseExpiry: formData.licenseExpiry
        ? new Date(formData.licenseExpiry).toISOString()
        : '',
    }
  
    updateProfile(payload, {
      onSuccess: () => setIsEditing(false),
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadAvatar(file)
    }
  }

  const handleSubmitRequest = () => {
    createRequest(
      { message: requestMessage },
      {
        onSuccess: () => {
          setIsRequestDialogOpen(false)
          setRequestMessage('')
        },
      }
    )
  }

  const handleCancelRequest = () => {
    cancelRequest(undefined, {
      onSuccess: () => {
        setIsCancelDialogOpen(false)
      },
    })
  }

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge variant="danger" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        )
      default:
        return null
    }
  }

  const canRequestOwner = profile?.role === UserRole.CLIENT && !ownerRequest
  const hasPendingRequest = ownerRequest?.status === 'PENDING'
  const isOwnerOrAdmin = profile?.role === UserRole.OWNER || profile?.role === UserRole.ADMIN

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p>Profile not found</p>
        </div>
      </>
    )
  }

  return (
    <>
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
              {/* Become Owner Card */}
              {!isOwnerOrAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      Become a Car Owner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {requestLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : ownerRequest ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status:</span>
                          {getRequestStatusBadge(ownerRequest.status)}
                        </div>

                        {ownerRequest.message && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Your message:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {ownerRequest.message}
                            </p>
                          </div>
                        )}

                        {ownerRequest.adminNote && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Admin response:</p>
                            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-200">
                              {ownerRequest.adminNote}
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-gray-500">
                          Submitted: {format(new Date(ownerRequest.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>

                        {ownerRequest.reviewedAt && (
                          <p className="text-xs text-gray-500">
                            Reviewed: {format(new Date(ownerRequest.reviewedAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        )}

                        {hasPendingRequest && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => setIsCancelDialogOpen(true)}
                            >
                              Cancel Request
                            </Button>

                            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Request</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel your owner request? You can submit a new one later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={isCancellingRequest}>
                                    No, Keep It
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleCancelRequest}
                                    disabled={isCancellingRequest}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {isCancellingRequest ? 'Cancelling...' : 'Yes, Cancel Request'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {ownerRequest.status === 'REJECTED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setIsRequestDialogOpen(true)}
                          >
                            Submit New Request
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          List your cars and start earning by becoming a car owner on our platform.
                        </p>
                        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              <Crown className="w-4 h-4 mr-2" />
                              Request Owner Access
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Request Owner Access</DialogTitle>
                              <DialogDescription>
                                Tell us why you want to become a car owner. Our admin will review your request.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="message">Message (Optional)</Label>
                                <Textarea
                                  id="message"
                                  value={requestMessage}
                                  onChange={(e) => setRequestMessage(e.target.value)}
                                  placeholder="I want to list my car and start earning..."
                                  rows={4}
                                  maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  {requestMessage.length}/500 characters
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setIsRequestDialogOpen(false)}
                                disabled={isCreatingRequest}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSubmitRequest}
                                disabled={isCreatingRequest}
                              >
                                {isCreatingRequest ? 'Submitting...' : 'Submit Request'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">
                    Role: <span className="font-medium capitalize">{profile.role.toLowerCase()}</span>
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