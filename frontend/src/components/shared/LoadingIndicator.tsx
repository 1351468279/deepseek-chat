interface LoadingIndicatorProps {
  message?: string;
}

/**
 * LoadingIndicator component - displays loading state
 */
export function LoadingIndicator({ message = 'Thinking...' }: LoadingIndicatorProps) {
  return (
    <div className="loading-indicator" data-testid="loading-indicator" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
