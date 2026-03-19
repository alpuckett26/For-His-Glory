'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h2 className="font-display text-2xl text-charcoal mb-2">
            Something went wrong
          </h2>
          <p className="font-body text-sm mb-6" style={{ color: '#6B6B6B' }}>
            We encountered an unexpected error. Please refresh the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-3 bg-gold text-white font-body font-medium text-sm hover:bg-gold-light transition-colors"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
