import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function AuthError() {
  const router = useRouter()
  const { error } = router.query

  useEffect(() => {
    // Redirect to login page after showing error
    const timer = setTimeout(() => {
      router.push('/login')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  const getErrorMessage = (error: string | string[] | undefined) => {
    if (!error || Array.isArray(error)) return 'An unknown error occurred'
    
    switch (error) {
      case 'CredentialsSignin':
        return 'Invalid email or password'
      case 'OAuthSignin':
        return 'Error occurred during sign in'
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account'
      case 'EmailCreateAccount':
        return 'Could not create email account'
      case 'Callback':
        return 'Error occurred during callback'
      case 'OAuthAccountNotLinked':
        return 'OAuth account is not linked to any user'
      case 'EmailSignin':
        return 'Error occurred during email sign in'
      case 'SessionRequired':
        return 'Please sign in to access this page'
      default:
        return 'An authentication error occurred'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
          <p className="mt-4 text-center text-sm text-gray-500">
            Redirecting to login page in 3 seconds...
          </p>
        </div>
        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  )
}