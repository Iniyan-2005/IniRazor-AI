import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-primary-600 p-6 sm:p-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-primary-100">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="p-6 sm:p-10 prose prose-slate max-w-none text-slate-700">
          <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-md">
            <p className="font-medium mb-1">Razorpay Buildathon Project</p>
            <p className="text-sm">This application (IniRazor-AI) was created as part of the Razorpay Buildathon. The data processed here is for demonstration and evaluation purposes.</p>
          </div>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">1. Information We Collect</h3>
          <p className="mb-4">When you use our application, we may collect the following information:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Authentication Information:</strong> Information provided by Google Sign-In (such as your email address, name, and profile picture) to authenticate you into the dashboard.</li>
            <li><strong>Demonstration Data:</strong> Any transaction or reconciliation data you input is considered test data. Please do not submit real production keys or sensitive live data to this demonstration instance.</li>
          </ul>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">2. How We Use Your Information</h3>
          <p className="mb-4">The information we collect is used solely for the following purposes:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>To provide and maintain the authentication session within the app.</li>
            <li>To demonstrate the capabilities of our reconciliation and AI evaluation engine for the Razorpay Buildathon.</li>
          </ul>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">3. Data Storage and Security</h3>
          <p className="mb-6">Since this is a hackathon prototype, while we strive to use commercially acceptable means to protect your personal information (such as secure Supabase authentication), we cannot guarantee its absolute security. We recommend using a test Google account if you are concerned about privacy.</p>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">4. Third-Party Services</h3>
          <p className="mb-4">We use third-party services including:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li><strong>Google:</strong> For OAuth Sign-In.</li>
            <li><strong>Supabase:</strong> For backend authentication and database storage.</li>
            <li><strong>Vercel:</strong> For hosting this web application.</li>
          </ul>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">5. Contact Us</h3>
          <p className="mb-6">If you have any questions about this Privacy Policy, please contact the project maintainers via the repository or buildathon platform.</p>
        </div>
        
        <div className="bg-slate-50 p-6 border-t border-slate-200 flex justify-center">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
