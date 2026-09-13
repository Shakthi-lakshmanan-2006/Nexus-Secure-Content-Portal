import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[NEXUS Uncaught Exception]:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 font-mono font-bold text-xl">
              !
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Portal Session Disconnected</h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              The application encountered an unexpected runtime boundary error. Click below to refresh and re-initialize the secure enclave.
            </p>
            {this.state.error && (
              <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-rose-300 text-left overflow-x-auto mb-6 max-h-32">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Reload Enclave
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
