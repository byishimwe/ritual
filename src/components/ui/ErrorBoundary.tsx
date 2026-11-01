import { Component, type ErrorInfo, type ReactNode } from 'react';
import { FatalError } from './FatalError';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Guards the canvas so a render failure can never leave a silent black page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Ritual] fatal render error', error, info.componentStack);
  }

  render() {
    if (this.state.error) return <FatalError detail={this.state.error.message} />;
    return this.props.children;
  }
}
