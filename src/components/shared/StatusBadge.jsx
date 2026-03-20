import { cn } from '../layout/Sidebar';

const statusStyles = {
  // Jobs
  'In Production': 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  'Pending Approval': 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  'Dispatched': 'bg-brand-primary/15 text-brand-primary border-brand-primary/20',
  'Overdue': 'bg-red-500/15 text-red-500 border-red-500/20',
  'Billed': 'bg-purple-500/15 text-purple-500 border-purple-500/20',
  
  // Clients
  'Active': 'bg-brand-primary/15 text-brand-primary border-brand-primary/20',
  'Inactive': 'bg-brand-text-muted/15 text-brand-text-muted border-brand-text-muted/20',
  
  // Quotes
  'Approved': 'bg-brand-primary/15 text-brand-primary border-brand-primary/20',
  'Sent': 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  'Rejected': 'bg-red-500/15 text-red-500 border-red-500/20',
  'Draft': 'bg-brand-text-muted/15 text-brand-text-muted border-brand-text-muted/20',
  
  // Design
  'Brief Received': 'bg-blue-500/15 text-blue-500 border-blue-500/20',
  'In Progress': 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  'Ready for Review': 'bg-purple-500/15 text-purple-500 border-purple-500/20',
  
  // Billing
  'Paid': 'bg-brand-primary/15 text-brand-primary border-brand-primary/20',
  
  // Priorities
  'HIGH': 'bg-red-500/15 text-red-500 border-red-500/20',
  'MEDIUM': 'bg-amber-500/15 text-amber-500 border-amber-500/20',
  'LOW': 'bg-brand-text-muted/15 text-brand-text-muted border-brand-text-muted/20',
};

export default function StatusBadge({ status, className }) {
  const style = statusStyles[status] || 'bg-brand-text-muted/15 text-brand-text-muted border-brand-text-muted/20';
  
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", style, className)}>
      {status}
    </span>
  );
}
