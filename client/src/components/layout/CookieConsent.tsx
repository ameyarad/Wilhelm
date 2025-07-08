import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Wilhelm uses cookies to help personalize content and provide a better, faster experience. By clicking accept, you agree to this.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reject
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-nhs-blue hover:bg-nhs-dark-blue text-white"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}