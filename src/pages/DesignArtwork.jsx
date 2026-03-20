import { useState } from 'react';
import { Palette, CheckCircle2, XCircle, AlertTriangle, Sparkles, UploadCloud, FileText, MoreHorizontal, Clock, User } from 'lucide-react';
import { designTasks } from '../data/mockData';
import StatusBadge from '../components/shared/StatusBadge';
import { cn } from '../components/layout/Sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function DesignArtwork() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkResults, setCheckResults] = useState(null);

  const handleRunCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setCheckResults({
        passed: ['Resolution (300 DPI minimum)', 'Color Mode (CMYK)', 'Dimensions (match job spec)', 'Font embedding', 'Safe zone margin'],
        warnings: ['Image resolution 287 DPI (below 300)', 'Spot color detected'],
        errors: ['Missing: Bleed on left side']
      });
      toast.success('AI Pre-Press Validation Complete');
    }, 1500);
  };

  const handleMarkReady = () => {
    toast.success('Design marked as Ready for Review');
    setSelectedTask(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-brand-text">Design & Artwork</h2>
          <span className="bg-brand-primary/20 text-brand-primary text-sm font-bold px-2.5 py-0.5 rounded-full border border-brand-primary/30">
            {designTasks.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {designTasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => { setSelectedTask(task); setCheckResults(null); }}
            className="bg-brand-card border border-brand-border rounded-xl p-5 hover:border-brand-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-mono text-brand-text-muted bg-brand-bg px-2 py-1 rounded border border-brand-border mb-2 inline-block">{task.id}</span>
                <h3 className="font-semibold text-brand-text text-lg leading-tight">{task.client}</h3>
              </div>
              <StatusBadge status={task.status} />
            </div>

            <div className="space-y-3 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                <Palette size={16} className="text-brand-text-muted/70" />
                <span className="font-medium text-brand-text">{task.jobType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                <User size={16} className="text-brand-text-muted/70" />
                <span>{task.assigned}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                <Clock size={16} className="text-brand-text-muted/70" />
                <span>Active for {task.daysActive} days</span>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-border/50">
              <p className="text-xs text-brand-text-muted uppercase tracking-wider font-medium mb-3">Pre-Press Checklist</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  {task.checks.res ? <CheckCircle2 size={14} className="text-brand-primary" /> : <AlertTriangle size={14} className="text-amber-500" />}
                  <span className={cn(task.checks.res ? "text-brand-text-muted" : "text-amber-500 font-medium")}>
                    Res: {task.checks.resVal} DPI
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {task.checks.cmyk ? <CheckCircle2 size={14} className="text-brand-primary" /> : <XCircle size={14} className="text-red-500" />}
                  <span className={cn(task.checks.cmyk ? "text-brand-text-muted" : "text-red-500 font-medium")}>CMYK</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {task.checks.bleed ? <CheckCircle2 size={14} className="text-brand-primary" /> : <XCircle size={14} className="text-red-500" />}
                  <span className={cn(task.checks.bleed ? "text-brand-text-muted" : "text-red-500 font-medium")}>Bleed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {task.checks.dims ? <CheckCircle2 size={14} className="text-brand-primary" /> : <XCircle size={14} className="text-red-500" />}
                  <span className={cn(task.checks.dims ? "text-brand-text-muted" : "text-red-500 font-medium")}>Dims</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="bg-brand-card border-brand-border text-brand-text sm:max-w-[700px] p-0 overflow-hidden">
          {selectedTask && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="bg-brand-bg p-6 border-b border-brand-border flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-brand-text-muted bg-brand-card px-2 py-1 rounded border border-brand-border">{selectedTask.id}</span>
                    <StatusBadge status={selectedTask.status} />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-text">{selectedTask.client}</h2>
                  <p className="text-brand-text-muted mt-1">{selectedTask.jobType} • Assigned to {selectedTask.assigned}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* AI Pre-Press Check */}
                <div className="bg-brand-bg border border-brand-border rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-lg font-semibold text-brand-text flex items-center gap-2">
                      <Sparkles size={20} className="text-brand-primary" />
                      AI Pre-Press Validation
                    </h3>
                    
                    {!checkResults && (
                      <button 
                        onClick={handleRunCheck}
                        disabled={isChecking}
                        className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                      >
                        {isChecking ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} />
                            Run AI Check
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {checkResults ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-brand-card border border-brand-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={16} className="text-brand-primary" />
                            <h4 className="font-semibold text-brand-text text-sm">Passed ({checkResults.passed.length})</h4>
                          </div>
                          <ul className="space-y-2 text-xs text-brand-text-muted">
                            {checkResults.passed.slice(0, 3).map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-brand-primary mt-0.5">•</span> {item}
                              </li>
                            ))}
                            {checkResults.passed.length > 3 && <li>...and 2 more</li>}
                          </ul>
                        </div>
                        
                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={16} className="text-amber-500" />
                            <h4 className="font-semibold text-amber-500 text-sm">Warnings ({checkResults.warnings.length})</h4>
                          </div>
                          <ul className="space-y-2 text-xs text-amber-500/80">
                            {checkResults.warnings.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="mt-0.5">•</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <XCircle size={16} className="text-red-500" />
                            <h4 className="font-semibold text-red-500 text-sm">Errors ({checkResults.errors.length})</h4>
                          </div>
                          <ul className="space-y-2 text-xs text-red-500/80">
                            {checkResults.errors.map((item, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="mt-0.5">•</span> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-brand-card border border-brand-border rounded-lg p-6 text-center relative z-10">
                      <p className="text-sm text-brand-text-muted mb-2">Run the AI validation to check for common pre-press errors before sending to production.</p>
                      <p className="text-xs text-brand-text-muted/70">Checks resolution, color mode, bleed, fonts, and safe zones.</p>
                    </div>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-3 uppercase tracking-wider">Artwork Files</h3>
                  <div className="border-2 border-dashed border-brand-border rounded-xl p-8 text-center hover:bg-brand-bg/50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mx-auto mb-4 group-hover:border-brand-primary/50 group-hover:text-brand-primary transition-colors text-brand-text-muted">
                      <UploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-brand-text mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-brand-text-muted">PDF, AI, PSD, TIFF (Max 500MB)</p>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-brand-bg border border-brand-border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-card rounded-md text-brand-text-muted">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-brand-text">artwork_v1.pdf</p>
                          <p className="text-xs text-brand-text-muted">24.5 MB • Uploaded 2 hours ago</p>
                        </div>
                      </div>
                      <button className="p-1.5 text-brand-text-muted hover:text-red-500 rounded-md transition-colors">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-3 uppercase tracking-wider">Design Notes / Brief</h3>
                  <textarea 
                    className="w-full bg-brand-bg border border-brand-border rounded-xl p-4 text-sm focus:outline-none focus:border-brand-primary min-h-[120px] text-brand-text-muted"
                    placeholder="Add notes about the design, revisions, or specific client requests..."
                    defaultValue="Client requested a darker shade of green for the background. Ensure the logo is prominent. Waiting for high-res images from their marketing team."
                  />
                </div>
              </div>

              <div className="p-4 border-t border-brand-border bg-brand-bg shrink-0 flex justify-end gap-3">
                <button className="px-4 py-2 bg-brand-card border border-brand-border hover:bg-brand-border text-brand-text rounded-md text-sm font-medium transition-colors">
                  Save Draft
                </button>
                <button 
                  onClick={handleMarkReady}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Mark as Ready for Review
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
