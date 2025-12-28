// src/pages/VerifyEmail.tsx
import { useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useVerifyEmail } from '@/features/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { ROUTES } from '@/lib/utils/constants'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { mutate: verifyEmail, isPending, isSuccess, isError } = useVerifyEmail()

  useEffect(() => {
    if (token) {
      console.log('Verifying email with token:', token)
      verifyEmail(token)
    }
  }, [token, verifyEmail])

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Invalid Link</h2>
          <p className="text-gray-600">
            This verification link is invalid or has expired.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verifying Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Verification Failed</h2>
          <p className="text-gray-600">
            We couldn't verify your email. The link may be invalid or expired.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Email Verified!</h2>
          <p className="text-gray-600">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return null
}