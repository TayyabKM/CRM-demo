import { cn } from '../layout/Sidebar';

export default function KPICard({ title, value, icon: Icon, colorClass, className }) {
  return (
    <div className={cn("bg-brand-card border border-brand-border rounded-xl p-5 flex items-start justify-between", className)}>
      <div>
        <p className="text-sm text-brand-text-muted font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-brand-text">{value}</h3>
      </div>
      <div className={cn("p-3 rounded-lg", colorClass)}>
        <Icon size={24} />
      </div>
    </div>
  );
}
