import { Inbox } from "lucide-react";

export default function EmptyState({
  title,
  description,
  Icon = Inbox,
  action,
}: {
  title: string;
  description?: string;
  Icon?: any;
  action?: React.ReactNode;
}) {
  return (
    <div className="panel p-10 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-canvas border border-line flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted mt-1 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
