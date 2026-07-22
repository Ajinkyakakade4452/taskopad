import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Taskpad React Tree:', error, errorInfo);
  }

  private handleReset = () => {
    sessionStorage.removeItem('taskpad_user');
    window.location.reload();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A1128] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#141C38] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xl">
              !
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 mt-1">
                An unexpected application error occurred. We caught it safely to prevent a blank screen.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs font-mono text-rose-300 overflow-x-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
              >
                Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
