import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import GeneratedReportViewer from "@/components/reports/GeneratedReportViewer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Trash2, Copy } from "lucide-react";
import { Report } from "@shared/schema";
import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function Reports() {
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [error, setError] = useState("");

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/reports'],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading || reportsLoading) {
    return (
      <div className="min-h-screen bg-nhs-light-grey flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-nhs-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-nhs-dark-grey">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const reportsData: Report[] = reports || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group reports by date
  const groupReportsByDate = (reports: Report[]) => {
    const groups: { [key: string]: Report[] } = {};
    
    reports.forEach((report) => {
      const date = parseISO(report.createdAt);
      let key: string;
      
      if (isToday(date)) {
        key = 'Today';
      } else if (isYesterday(date)) {
        key = 'Yesterday';
      } else {
        key = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(report);
    });
    
    // Sort groups by date (most recent first)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    return sortedGroups;
  };

  const groupedReports = groupReportsByDate(reportsData);

  const handleCopyReport = async (report: Report) => {
    try {
      // Strip HTML tags for plain text copy using DOMParser (safer than innerHTML)
      const parser = new DOMParser();
      const doc = parser.parseFromString(report.content, 'text/html');
      const plainText = doc.body.textContent || doc.body.innerText || '';
      
      await navigator.clipboard.writeText(plainText);
      setError("");
      // Report copied successfully
    } catch (error) {
      setError("Failed to copy report content.");
      // Copy operation failed
    }
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewerOpen(true);
  };

  const handleDeleteReport = async (reportId: number) => {
    try {
      await apiRequest("DELETE", `/api/reports/${reportId}`, {});
      
      setError("");
      console.log("Report deleted successfully");
      
      // Refresh the reports list
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
    } catch (error) {
      setError("Failed to delete report. Please try again.");
      console.error("Delete failed:", error);
    }
  };

  const formatReportName = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex h-screen bg-nhs-light-grey">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h1 className="text-2xl font-semibold text-nhs-dark-grey mb-2">Saved Reports</h1>
              <p className="text-nhs-dark-grey/70">View and manage your saved reports</p>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {reportsData.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <FileText className="h-12 w-12 text-nhs-dark-grey/30 mx-auto mb-4" />
                  <p className="text-nhs-dark-grey/70">
                    No reports yet. Create your first report in the chat interface.
                  </p>
                </div>
              ) : (
                groupedReports.map(([dateGroup, reports]) => (
                  <div key={dateGroup} className="bg-white rounded-lg shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-nhs-dark-grey">
                        {dateGroup}
                      </h2>
                      <p className="text-sm text-nhs-dark-grey/70">
                        {reports.length} report{reports.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {reports.map((report) => (
                        <Card key={report.id} className="border-0 shadow-none">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg font-medium flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-nhs-blue" />
                                <span>{formatReportName(report.createdAt)}</span>
                              </CardTitle>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-nhs-dark-grey/70">
                              <span>
                                {format(parseISO(report.createdAt), 'h:mm a')}
                              </span>
                              {report.updatedAt !== report.createdAt && (
                                <span>
                                  • Updated {formatDistanceToNow(new Date(report.updatedAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="mb-4">
                              <p className="text-sm text-nhs-dark-grey/70 line-clamp-3">
                                {report.content.substring(0, 200)}...
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-nhs-blue"
                                onClick={() => handleViewReport(report)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-nhs-light-blue"
                                onClick={() => handleCopyReport(report)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-nhs-red hover:text-nhs-red"
                                onClick={() => handleDeleteReport(report.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-2 text-center">
          <div className="text-xs text-nhs-dark-grey/70">
            <p className="font-normal">© 2025 Ameya Kawthalkar. Wilhelm is a free and open source medical imaging reporting AI agent for educational and research purposes only. Not for clinical use.</p>
          </div>
        </footer>
      </div>
      {/* Report Viewer Modal */}
      <GeneratedReportViewer
        report={selectedReport?.content || ""}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedReport(null);
        }}
      />
    </div>
  );
}
