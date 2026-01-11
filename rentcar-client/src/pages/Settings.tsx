import { useState } from 'react'
import { useChangePassword, useDeactivateAccount } from '@/features/users/hooks/useProfile'
import { useResendVerification } from '@/features/auth/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Lock, 
  Bell, 
  Shield, 
  Trash2, 
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  CheckCircle
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { Helmet } from 'react-helmet-async'

export function Settings() {
   
  const { user } = useAuthStore()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword()
  const { mutate: resendVerification, isPending: isResendingVerification } = useResendVerification()

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    bookingUpdates: true,
    promotions: false,
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const { mutate: deactivateAccount, isPending: isDeactivating } = useDeactivateAccount()

  const validatePassword = () => {
    const errors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters'
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()

    if (validatePassword()) {
      changePassword(
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          onSuccess: () => {
            setPasswordForm({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            })
            setPasswordErrors({})
          },
        }
      )
    }
  }

  const handleDeactivateAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      deactivateAccount()
    }
  }

  const handleResendVerification = () => {
    resendVerification()
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <>
      <Helmet>
        <title>Settings - RentCar</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="shadow-sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Account Role</p>
                    <Badge variant="outline" className="mt-1">
                      {user?.role}
                    </Badge>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600 mb-1">Email Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user?.isVerified ? 'success' : 'warning'}>
                        {user?.isVerified ? 'Verified' : 'Not Verified'}
                      </Badge>
                      {!user?.isVerified && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleResendVerification}
                          disabled={isResendingVerification}
                          isLoading={isResendingVerification}
                          className="h-7 text-xs hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          Resend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {!user?.isVerified && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-900">Email Not Verified</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Please check your inbox and verify your email address to access all features.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        error={passwordErrors.currentPassword}
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        error={passwordErrors.newPassword}
                        placeholder="Enter new password (min. 8 characters)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        error={passwordErrors.confirmPassword}
                        placeholder="Confirm new password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isChangingPassword}
                    isLoading={isChangingPassword}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shadow-inner ${
                      notifications.email ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Booking Updates</p>
                    <p className="text-sm text-gray-500">Get notified about booking changes</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, bookingUpdates: !notifications.bookingUpdates })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shadow-inner ${
                      notifications.bookingUpdates ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        notifications.bookingUpdates ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">Promotions & Offers</p>
                    <p className="text-sm text-gray-500">Receive promotional emails</p>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, promotions: !notifications.promotions })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shadow-inner ${
                      notifications.promotions ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                        notifications.promotions ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <Button className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200">
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {!showDeleteConfirm ? (
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-700">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="shadow-md hover:shadow-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 bg-red-50 rounded-lg border-2 border-red-300 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-900 text-lg">Are you absolutely sure?</p>
                        <p className="text-sm text-red-700 mt-2">
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="deleteConfirm" className="text-red-900 font-medium">
                        Type <span className="font-bold">DELETE</span> to confirm
                      </Label>
                      <Input
                        id="deleteConfirm"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="mt-2 border-red-300 focus:border-red-500 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDeactivateAccount}
                        disabled={deleteConfirmText !== 'DELETE' || isDeactivating}
                        isLoading={isDeactivating}
                        className="shadow-md hover:shadow-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Permanently Delete Account
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeleteConfirmText('')
                        }}
                        className="hover:bg-gray-100"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}