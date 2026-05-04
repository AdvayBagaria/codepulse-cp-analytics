import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Something went wrong while rendering the dashboard.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard render error', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-xl w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900">
                  The dashboard hit a render error.
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  The app recovered into this fallback instead of going blank. The most common cause
                  is malformed local data or a stale browser cache.
                </p>
                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 break-words">
                  {this.state.message}
                </div>
                <button
                  onClick={this.handleReset}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload app
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
