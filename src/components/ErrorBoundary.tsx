import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] App crashed:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 px-6 text-center">
          <img
            src="/mascot/Logo.svg"
            alt="Fablino"
            className="w-32 h-32 mb-6 opacity-80"
          />
          <h1 className="text-2xl font-bold text-orange-800 mb-3">
            Ups, da ist etwas schiefgelaufen!
          </h1>
          <p className="text-orange-700 mb-8 max-w-sm text-lg">
            Keine Sorge — klicke einfach auf den Knopf und wir versuchen es nochmal.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-lg font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            Nochmal versuchen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
