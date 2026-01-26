import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Dialog to confirm navigation when there are unsaved changes
 */
function UnsavedChangesDialog({ blocker }) {
  if (blocker.state !== 'blocked') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => blocker.reset()}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              Unsaved Changes
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You have unsaved changes that will be lost if you leave this page.
              Are you sure you want to continue?
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => blocker.reset()}
          >
            Stay on Page
          </Button>
          <Button
            variant="destructive"
            onClick={() => blocker.proceed()}
          >
            Leave Without Saving
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UnsavedChangesDialog;
