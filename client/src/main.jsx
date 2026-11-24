import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PRINTIZER App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-red-100">
            <div className="w-12 h-12 bg-red-100 text-brand-crimson rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-xl">
              !
            </div>
            <h2 className="text-lg font-black text-slate-900 mb-2">Display Notice</h2>
            <p className="text-xs text-slate-500 mb-4">
              {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
            </p>
            <button
              onClick={() => {
                window.location.hash = '#home';
                window.location.reload();
              }}
              className="bg-brand-crimson hover:bg-brand-red text-white text-xs font-bold px-6 py-2.5 rounded-full transition shadow-md"
            >
              Refresh Homepage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
