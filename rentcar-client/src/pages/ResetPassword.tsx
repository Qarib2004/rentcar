import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useResetPassword } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/lib/utils/constants'

interface FormData {
  newPassword: string
  confirmPassword: string
}

interface FormErrors {
  password?: string
  confirmPassword?: string
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const { mutate: resetPassword, isPending } = useResetPassword()

  useEffect(() => {
    if (!token) {
      console.error('Reset token is missing')
    }
  }, [token])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.newPassword) {
      newErrors.password = 'Password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      return
    }

    if (validateForm()) {
      resetPassword({
        token,
        newPassword: formData.newPassword,
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Invalid Link</h2>
          <p className="mt-2 text-sm text-gray-600">
            This password reset link is invalid or has expired
          </p>
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button className="w-full">Request new reset link</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Reset password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.password}
                disabled={isPending}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                disabled={isPending}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isPending} disabled={isPending}>
            Reset password
          </Button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}