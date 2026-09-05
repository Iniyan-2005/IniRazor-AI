import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-primary-600 p-6 sm:p-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-primary-100">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="p-6 sm:p-10 prose prose-slate max-w-none text-slate-700">
          <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-800 rounded-r-md">
            <p className="font-medium mb-1">Razorpay Buildathon Project</p>
            <p className="text-sm">This application (IniRazor-AI) was created as part of the Razorpay Buildathon. These terms govern the use of this demonstration application.</p>
          </div>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">1. Acceptance of Terms</h3>
          <p className="mb-6">By accessing and using IniRazor-AI ("the Application"), you accept and agree to be bound by the terms and provisions of this agreement. This Application is a prototype built specifically for the Razorpay Buildathon.</p>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">2. Description of Service</h3>
          <p className="mb-6">IniRazor-AI provides a demonstration environment for automated payment reconciliation and exception management using AI. The service is provided "as is" and is intended strictly for demonstration and evaluation purposes within the context of the hackathon.</p>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">3. User Obligations and Test Data</h3>
          <p className="mb-4">When using the application, you agree to the following:</p>
          <ul className="list-disc pl-5 mb-6 space-y-2">
            <li>You agree to use the Application only for lawful purposes.</li>
            <li><strong>IMPORTANT:</strong> You must not upload, process, or input any real, sensitive, or personally identifiable production data (including real customer PII or live API keys) into this demonstration application.</li>
            <li>All data processed should be mocked or dummy data meant for testing.</li>
          </ul>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">4. Intellectual Property</h3>
          <p className="mb-6">The concepts, design, and original code contributed to this project remain the intellectual property of the developers, subject to the rules and terms of the Razorpay Buildathon competition.</p>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">5. Disclaimer of Warranties</h3>
          <p className="mb-6">The Application is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the application's availability, security, or reliability. Your use of the Application is at your sole risk.</p>

          <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900">6. Limitation of Liability</h3>
          <p className="mb-6">In no event shall the developers or maintainers be liable for any damages (including, without limitation, damages for loss of data or profit) arising out of the use or inability to use the Application.</p>
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
