import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, X } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "all");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4">
      <Card className="w-full max-w-4xl bg-white shadow-2xl animate-in slide-in-from-bottom-5">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-nhs-blue" />
              <h2 className="text-xl font-bold text-nhs-dark-grey">Cookie Notice</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReject}
              className="hover:bg-nhs-light-grey"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-nhs-dark-grey leading-relaxed">
              We use cookies and similar technologies to help personalize content, tailor and measure ads, 
              and provide a better experience. By clicking accept, you agree to this, as outlined in our 
              Cookie Policy.
            </p>

            {showDetails ? (
              <div className="space-y-4 p-4 bg-nhs-light-grey/20 rounded-lg">
                <div>
                  <h3 className="font-semibold text-nhs-dark-blue mb-2">Essential Cookies</h3>
                  <p className="text-sm text-nhs-dark-grey">
                    These cookies are necessary for the website to function properly. They enable basic 
                    functions like page navigation and access to secure areas. The website cannot function 
                    properly without these cookies.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-nhs-dark-blue mb-2">Functional Cookies</h3>
                  <p className="text-sm text-nhs-dark-grey">
                    These cookies enable the website to provide enhanced functionality and personalisation. 
                    They may be set by us or by third party providers whose services we have added to our pages.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-nhs-dark-blue mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-nhs-dark-grey">
                    These cookies allow us to count visits and traffic sources so we can measure and improve 
                    the performance of our site. All information these cookies collect is aggregated and therefore 
                    anonymous.
                  </p>
                </div>
              </div>
            ) : (
              <Button
                variant="link"
                onClick={() => setShowDetails(true)}
                className="text-nhs-blue hover:text-nhs-dark-blue p-0"
              >
                Show details
              </Button>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleAcceptAll}
                className="bg-nhs-blue hover:bg-nhs-dark-blue text-white"
              >
                Accept All Cookies
              </Button>
              <Button
                onClick={handleAcceptEssential}
                variant="outline"
                className="border-nhs-blue text-nhs-blue hover:bg-nhs-light-blue/10"
              >
                Essential Only
              </Button>
              <Button
                onClick={handleReject}
                variant="ghost"
                className="text-nhs-dark-grey hover:bg-nhs-light-grey"
              >
                Reject All
              </Button>
            </div>

            <p className="text-xs text-nhs-dark-grey/70 pt-2">
              By using our site, you agree to our use of cookies. Visit our{" "}
              <a href="/privacy-policy" className="text-nhs-blue hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/cookie-policy" className="text-nhs-blue hover:underline">
                Cookie Policy
              </a>{" "}
              to learn more.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}