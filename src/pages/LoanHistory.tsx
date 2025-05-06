
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { BookLoan } from '@/types';
import { bookLoansApi } from '@/utils/api';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle2,
  XCircle,
  BookOpen,
  Loader2,
  RefreshCcw,
  ArrowLeftCircle,
  Ban
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { format, addDays } from 'date-fns';
import { Label } from '@/components/ui/label';

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-amber-500" />;
    case 'approved':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'returned':
      return <ArrowLeftCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <Ban className="h-5 w-5 text-gray-400" />;
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'approved':
      return 'text-green-700 bg-green-50 border-green-200';
    case 'rejected':
      return 'text-red-700 bg-red-50 border-red-200';
    case 'returned':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-200';
  }
}

const LoanHistory: React.FC = () => {
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [extensionDate, setExtensionDate] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<BookLoan | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchLoans();
  }, [activeTab]);
  
  const fetchLoans = async () => {
    setLoading(true);
    try {
      const status = activeTab !== 'all' ? activeTab : undefined;
      const response = await bookLoansApi.getLoans(status);
      if (response) {
        setLoans(response.data);
      } else {
        setLoans([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleExtensionRequest = async () => {
    if (!selectedLoan || !extensionDate) return;
    
    setActionLoading(true);
    try {
      const success = await bookLoansApi.requestExtension(selectedLoan.id, extensionDate);
      if (success) {
        setDialogOpen(false);
        fetchLoans();
      }
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleReturn = async (loanId: number) => {
    setActionLoading(true);
    try {
      const success = await bookLoansApi.returnBook(loanId);
      if (success) {
        fetchLoans();
      }
    } finally {
      setActionLoading(false);
    }
  };
  
  const openExtensionDialog = (loan: BookLoan) => {
    setSelectedLoan(loan);
    const suggestedDate = loan.due_date 
      ? format(addDays(new Date(loan.due_date), 7), 'yyyy-MM-dd')
      : format(addDays(new Date(), 14), 'yyyy-MM-dd');
    setExtensionDate(suggestedDate);
    setDialogOpen(true);
  };
  
  const getShortStatus = (status: string) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'returned': return 'Returned';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-library-DEFAULT">My Book Loans</h1>
        <Button variant="outline" onClick={fetchLoans} disabled={loading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Loans</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Active</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-10 w-10 text-library-DEFAULT animate-spin" />
            </div>
          ) : loans.length > 0 ? (
            <div className="grid gap-4">
              {loans.map((loan) => (
                <Card key={loan.id}>
                  <CardHeader className="py-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">{loan.book.title}</CardTitle>
                        <CardDescription>by {loan.book.author}</CardDescription>
                      </div>
                      <div className={`px-3 py-1 rounded-full border ${getStatusClass(loan.status)} inline-flex items-center`}>
                        {getStatusIcon(loan.status)}
                        <span className="ml-1 text-sm font-medium">{getShortStatus(loan.status)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Requested</p>
                        <p className="font-medium">{new Date(loan.requested_at).toLocaleDateString()}</p>
                      </div>
                      {loan.approved_at && (
                        <div>
                          <p className="text-gray-500">Approved</p>
                          <p className="font-medium">{new Date(loan.approved_at).toLocaleDateString()}</p>
                        </div>
                      )}
                      {loan.due_date && (
                        <div>
                          <p className="text-gray-500">Due Date</p>
                          <p className="font-medium">{new Date(loan.due_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      {loan.returned_at && (
                        <div>
                          <p className="text-gray-500">Returned</p>
                          <p className="font-medium">{new Date(loan.returned_at).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  {loan.status === 'approved' && !loan.returned_at && (
                    <CardFooter className="pt-2 pb-4">
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={() => handleReturn(loan.id)}
                          disabled={actionLoading}
                        >
                          <ArrowLeftCircle className="h-4 w-4 mr-2" />
                          Return Book
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => openExtensionDialog(loan)}
                          disabled={actionLoading}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Request Extension
                        </Button>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-gray-50">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No Loans Found</h3>
              <p className="text-gray-500 mb-4">
                {activeTab === 'all' 
                  ? "You don't have any book loans yet." 
                  : `You don't have any ${activeTab} loans.`}
              </p>
              <Button asChild>
                <a href="/books">Browse Books</a>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Extension</DialogTitle>
            <DialogDescription>
              Request an extended due date for your book loan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedLoan && (
              <div className="mb-4">
                <h4 className="font-semibold mb-1">{selectedLoan.book.title}</h4>
                <p className="text-sm text-gray-500">
                  Current due date: {selectedLoan.due_date ? new Date(selectedLoan.due_date).toLocaleDateString() : 'Not set'}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="due-date">New Due Date</Label>
              <Input 
                id="due-date"
                type="date"
                value={extensionDate}
                onChange={(e) => setExtensionDate(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExtensionRequest} 
              disabled={actionLoading || !extensionDate}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                'Request Extension'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default LoanHistory;
