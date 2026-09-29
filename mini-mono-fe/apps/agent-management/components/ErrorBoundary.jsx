import React from "react";

class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
    errorInfo: null
  };
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }
  componentDidCatch(error, errorInfo) {
    console.error(error);
    console.error(errorInfo);
    // alert(JSON.stringify(error))
    alert(JSON.stringify(errorInfo))
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }
  render() {
    if (this.state.hasError) {
        return (
            <div>
                <h1>糟糕，被我们搞砸了</h1>
                <button type="button" onClick={() => this.setState({ hasError: false })}>
                再试一次?
                </button>
                <div>{JSON.stringify(this.state.errorInfo)}</div>
            </div>
            );
    }
    return this.props.children;
  }  
}

export default ErrorBoundary
