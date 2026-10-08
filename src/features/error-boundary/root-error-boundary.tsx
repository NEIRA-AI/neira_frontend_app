import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorScreen } from "./error-screen";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class RootErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info);
  }

  render() {
    return this.state.hasError ? <ErrorScreen /> : this.props.children;
  }
}
