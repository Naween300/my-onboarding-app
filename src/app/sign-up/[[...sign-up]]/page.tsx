import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Join SME Intelligence
          </h1>
          <p className="text-gray-600 mt-2">
            Create your account to get started with AI-powered business insights
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
              card: 'shadow-lg border border-gray-200',
              headerTitle: 'text-gray-900',
              headerSubtitle: 'text-gray-600'
            }
          }}
          redirectUrl="/onboarding"
        />
      </div>
    </div>
  )
}
