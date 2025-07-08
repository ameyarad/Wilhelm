import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, Shield, Info, Settings, FileText } from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pl-16 md:pl-72">
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-nhs-dark-grey mb-8">Cookie Policy</h1>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cookie className="w-6 h-6 text-nhs-blue" />
                  <span>What Are Cookies?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-nhs-dark-grey">
                  Cookies are small text files that are placed on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-6 h-6 text-nhs-blue" />
                  <span>Essential Cookies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey mb-4">
                  These cookies are necessary for the website to function properly. They cannot be 
                  switched off in our systems.
                </p>
                <div className="bg-nhs-light-grey/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm">Session Cookie</span>
                    <span className="text-sm text-nhs-dark-grey">Authentication</span>
                  </div>
                  <p className="text-xs text-nhs-dark-grey">
                    Maintains your logged-in state and stores session information
                  </p>
                  <div className="flex justify-between mt-3">
                    <span className="font-semibold text-sm">Cookie Consent</span>
                    <span className="text-sm text-nhs-dark-grey">Preferences</span>
                  </div>
                  <p className="text-xs text-nhs-dark-grey">
                    Remembers your cookie consent preferences
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-6 h-6 text-nhs-blue" />
                  <span>Functional Cookies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey mb-4">
                  These cookies enable the website to provide enhanced functionality and personalisation.
                </p>
                <div className="bg-nhs-light-grey/20 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm">User Preferences</span>
                    <span className="text-sm text-nhs-dark-grey">Customization</span>
                  </div>
                  <p className="text-xs text-nhs-dark-grey">
                    Stores your interface preferences and settings
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-nhs-blue" />
                  <span>Managing Cookies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-nhs-dark-grey">
                  You can control and manage cookies in various ways:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-nhs-dark-grey">
                  <li>Through our cookie consent banner when you first visit the site</li>
                  <li>By adjusting your browser settings to refuse or delete cookies</li>
                  <li>By clearing your browser's cookie storage</li>
                </ul>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Please note:</strong> Blocking essential cookies may impact the functionality 
                    of our website and prevent you from using certain features.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-6 h-6 text-nhs-blue" />
                  <span>Updates & Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nhs-dark-grey mb-4">
                  We may update this Cookie Policy from time to time. We will notify you of any 
                  changes by posting the new Cookie Policy on this page.
                </p>
                <p className="text-sm text-nhs-dark-grey">
                  If you have questions about our use of cookies, please contact us at:
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