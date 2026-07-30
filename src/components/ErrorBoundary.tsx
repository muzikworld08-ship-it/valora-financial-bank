import React, { Component, ErrorInfo, ReactNode } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="p-4 rounded-3xl bg-red-500/10 text-red-500 mb-6 border border-red-500/20">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider mb-2">
            Valora Security Recovery
          </h1>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            The banking portal encountered a temporary rendering exception. Your session data remains safe and secure.
          </p>

          <button
            onClick={this.handleReset}
            className="px-6 py-3.5 rounded-2xl bg-[#C8102E] hover:bg-[#A93226] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 transition-all hover:scale-105"
          >
            <RefreshCw size={16} /> Reload Portal Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
