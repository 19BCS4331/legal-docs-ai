import AuthForm from '@/components/auth/AuthForm'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-bold text-indigo-600">LegalDocs AI</h1>
        <h2 className="mt-2 text-center text-sm text-gray-600">
          Generate legal documents with AI
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}

// Metadata for the page
export const metadata = {
  title: 'Sign In - LegalDocs AI',
  description: 'Sign in to your LegalDocs AI account to generate legal documents with AI',
}
