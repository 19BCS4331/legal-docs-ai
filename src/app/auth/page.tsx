import AuthForm from '@/components/auth/AuthForm'
import Image from 'next/image'
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex min-h-screen">
        {/* Left side - Auth form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="absolute top-4 left-4">
            <Link href="/">
              <button className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
                <FaArrowLeft size={20} />
              </button>
            </Link>
          </div>
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="flex items-center justify-center">
            <Image
              src="/images/website_logo_no_bg.png"
              alt="Legal Docs AI"
              width={150}
              height={40}
              className="text-indigo-600"
              priority
            />
            </div>
            <div className="mt-8">
              <AuthForm />
            </div>
          </div>
        </div>

        {/* Right side - Background illustration */}
        <div className="hidden lg:block relative w-0 flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700">
            <div className="absolute inset-0 bg-[url('/auth-pattern.svg')] opacity-30"></div>
            <div className="absolute inset-0 flex items-center justify-center p-12">
              <div className="text-white max-w-lg">
                <h2 className="text-4xl font-bold mb-6">Transform Your Legal Document Workflow</h2>
                <p className="text-xl opacity-90">
                  Generate, manage, and collaborate on legal documents with the power of AI. 
                  Save time and reduce errors with our intelligent document automation.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="text-3xl font-bold">100+</div>
                    <div className="text-sm opacity-80">Document Templates</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="text-3xl font-bold">24/7</div>
                    <div className="text-sm opacity-80">AI Assistance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
