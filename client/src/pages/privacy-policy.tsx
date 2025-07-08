import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Mail, Globe, FileText } from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pl-16 md:pl-72">
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-nhs-dark-grey mb-8">Privacy Policy</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-nhs-blue" />
                  <span>Data Protection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-nhs-dark-grey">
                  Wilhelm is committed to protecting your personal data and respecting your privacy. 
                  This Privacy Policy explains how we collect, use, and protect your information when 
                  you use our medical imaging reporting platform.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-6 h-6 text-nhs-blue" />
                  <span>Information We Collect</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-nhs-dark-blue mb-2">Account Information</h3>
                  <p className="text-sm text-nhs-dark-grey">
                    When you sign in using Replit Auth, we collect your email address, name, and 
                    profile information provided by Replit.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-nhs-dark-blue mb-2">Usage Data</h3>
                  <p className="text-sm text-nhs-dark-grey">
                    We collect information about how you interact with our platform, including templates 
                    uploaded, reports generated, and feature usage patterns.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-nhs-dark-blue mb-2">Technical Data</h3>
                  <p className="text-sm text-nhs-dark-grey">
                    We automatically collect certain technical information including IP address, browser 
                    type, device information, and cookies for session management.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-6 h-6 text-nhs-blue" />
                  <span>How We Use Your Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc list-inside space-y-2 text-sm text-nhs-dark-grey">
                  <li>To provide and maintain our service</li>
                  <li>To authenticate users and manage sessions</li>
                  <li>To process your medical imaging reports using AI</li>
                  <li>To improve and optimize our platform</li>
                  <li>To comply with legal obligations</li>
                  <li>To communicate important updates about the service</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-6 h-6 text-nhs-blue" />
                  <span>Data Security & Retention</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-nhs-dark-grey">
                  We implement industry-standard security measures including encryption, secure sessions, 
                  and regular security audits. Your data is stored securely in PostgreSQL databases with 
                  encrypted connections.
                </p>
                <p className="text-sm text-nhs-dark-grey">
                  We retain your data only for as long as necessary to provide our services. You can 
                  request deletion of your data at any time by contacting us.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-6 h-6 text-nhs-blue" />
                  <span>Your Rights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey mb-4">
                  Under GDPR and UK data protection laws, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-nhs-dark-grey">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to data processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-nhs-blue" />
                  <span>Contact Us</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey">
                  If you have any questions about this Privacy Policy or your data, please contact us at:
                </p>
                <p className="text-sm text-nhs-blue mt-2">privacy@wilhelmai.net</p>
                <p className="text-sm text-nhs-dark-grey mt-4">
                  Last updated: January 9, 2025
                </p>
              </CardContent>
            </Card>
          </div>
          
          <footer className="mt-16 py-8 text-center text-sm font-bold text-nhs-dark-grey border-t border-nhs-light-grey">
            <p>© 2025 Wilhelm. Free and Open Source AI for Medical Imaging.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}