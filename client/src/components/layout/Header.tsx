import { Activity } from "lucide-react";
// Using public folder path since the logo is served as static asset

export default function Header() {
  return (
    <header className="flex-none h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <img 
          src="/wilhelm-logo.png" 
          alt="Wilhelm - AI Radiology Platform" 
          className="w-8 h-8 filter drop-shadow-sm"
        />
        <div>
          <h1 className="text-xl font-semibold text-nhs-dark-grey">Wilhelm</h1>
          <p className="text-xs text-nhs-dark-grey/70">AI-Powered Medical Imaging Reporting</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {/* Space for future header actions */}
      </div>
    </header>
  );
}
