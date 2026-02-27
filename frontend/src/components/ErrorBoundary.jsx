/**
 * Error Boundary - Prevents blank pages from unhandled React errors
 * TEXPERIA 2026
 */

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-comic-dark">
          <div className="text-center p-8 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="font-bangers text-3xl text-comic-cyan mb-3">Something Went Wrong</h1>
            <p className="font-comic text-gray-400 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-6 py-3 font-bangers text-lg text-black bg-comic-cyan rounded-xl border-2 border-black shadow-brutal hover:bg-comic-yellow transition-all"
            >
              🏠 Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
