import { Stethoscope } from "lucide-react";

export default function Header() {
  return (
    <header className="flex-none h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-nhs-blue rounded-lg flex items-center justify-center">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-nhs-dark-grey">Wilhelm</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* Space for future header actions */}
      </div>
    </header>
  );
}
