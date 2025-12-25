import { useState, useMemo } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import { useOwnerRequests, useReviewOwnerRequest } from '@/features/owner-requests/hooks/useOwnerRequests'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import {
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react'
import { format, isValid } from 'date-fns'
import { getInitials } from '@/lib/utils'

interface OwnerRequest {
  id: string
  userId: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  message?: string
  adminNote?: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
    email: string
    avatar?: string
    phone?: string
    role: string
    createdAt: string
  }
}

export default function OwnerRequests() {
  const [selectedTab, setSelectedTab] = useState('pending')
  const [reviewingRequest, setReviewingRequest] = useState<OwnerRequest | null>(null)
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [adminNote, setAdminNote] = useState('')

  const { data: allRequests = [], isLoading } = useOwnerRequests()
  const { mutate: reviewRequest, isPending: isReviewing } = useReviewOwnerRequest()


const { counts, filteredRequests } = useMemo(() => {
    const requests = allRequests || [];
    
  
    const stats = {
      pending: requests.filter((r: any) => String(r.status).toUpperCase() === 'PENDING').length,
      approved: requests.filter((r: any) => String(r.status).toUpperCase() === 'APPROVED').length,
      rejected: requests.filter((r: any) => String(r.status).toUpperCase() === 'REJECTED').length,
      all: requests.length,
    };
  
    const filtered = requests.filter((r: any) => {
      if (selectedTab === 'all') return true;
      return String(r.status).toUpperCase() === selectedTab.toUpperCase();
    });
  
    return { counts: stats, filteredRequests: filtered };
  }, [allRequests, selectedTab]);

  const handleOpenReviewDialog = (request: OwnerRequest, action: 'APPROVED' | 'REJECTED') => {
    setReviewingRequest(request)
    setReviewAction(action)
    setAdminNote('')
  }

  const handleSubmitReview = () => {
    if (!reviewingRequest || !reviewAction) return

    reviewRequest(
      {
        id: reviewingRequest.id,
        status: reviewAction,
        adminNote: adminNote.trim() || undefined,
      },
      { onSuccess: () => setReviewingRequest(null) }
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return isValid(date) ? format(date, 'MMM dd, yyyy') : '---'
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" /> Owner Requests
          </h1>
          <p className="text-gray-500 mt-1">Review users who want to list their vehicles</p>
        </div>

        <div className="flex gap-1 border-b mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'pending', label: 'Pending', count: counts.pending },
            { id: 'approved', label: 'Approved', count: counts.approved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected },
            { id: 'all', label: 'All', count: counts.all },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                selectedTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => <Skeleton key={i} className="h-[200px] w-full rounded-xl" />)
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request: any) => (
              <Card key={request.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex gap-4 flex-1">
                      <Avatar className="h-14 w-14 border-2 border-gray-100">
                        <AvatarImage src={request.user.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {getInitials(`${request.user.firstName} ${request.user.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{request.user.firstName} {request.user.lastName}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {request.user.email}</span>
                          {request.user.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {request.user.phone}</span>}
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {formatDate(request.user.createdAt)}</span>
                        </div>
                        {request.message && (
                          <div className="mt-3 bg-muted/50 p-3 rounded-md text-sm italic text-gray-600">
                            &quot;{request.message}&quot;
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center min-w-[140px]">
                      {request.status === 'PENDING' ? (
                        <>
                          <Button 
                            className="bg-green-600 hover:bg-green-700 w-full" 
                            size="sm"
                            onClick={() => handleOpenReviewDialog(request, 'APPROVED')}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleOpenReviewDialog(request, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <div className="text-center">
                          <Badge 
                            variant="secondary" 
                            className={
                              request.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }
                          >
                            {request.status}
                          </Badge>
                          <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider">
                            Resolved
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
              <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No {selectedTab} requests found</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!reviewingRequest} onOpenChange={() => setReviewingRequest(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'APPROVED' ? (
                <CheckCircle2 className="text-green-600 w-5 h-5" />
              ) : (
                <XCircle className="text-red-600 w-5 h-5" />
              )}
              {reviewAction === 'APPROVED' ? 'Approve Owner Status' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              Action for {reviewingRequest?.user.firstName} {reviewingRequest?.user.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="admin-note">
                Admin Note {reviewAction === 'REJECTED' && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="admin-note"
                placeholder={reviewAction === 'APPROVED' ? "Welcome message..." : "Reason for rejection..."}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewingRequest(null)}>Cancel</Button>
            <Button 
              className={reviewAction === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={reviewAction === 'REJECTED' ? 'destructive' : 'default'}
              disabled={isReviewing || (reviewAction === 'REJECTED' && !adminNote.trim())}
              onClick={handleSubmitReview}
            >
              {isReviewing ? 'Processing...' : 'Confirm Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}