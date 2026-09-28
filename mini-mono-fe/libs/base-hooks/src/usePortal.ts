import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState
} from 'react';
import * as ReactDOM from 'react-dom';

const usePortal = (child): [ReactNode, Dispatch<SetStateAction<boolean>>] => {
  const [display, setDisplay] = useState(false);
  const [node, setNode] = useState<ReactNode>();
  useEffect(() => {
    const portalRoot = document.createElement('div');
    if (!display) {
      document.body.contains(portalRoot) &&
        document.body.removeChild(portalRoot);
      return;
    }
    document.body.appendChild(portalRoot);
    setNode(ReactDOM.createPortal(child, portalRoot));
    return () => {
      document.body.contains(portalRoot) &&
        document.body.removeChild(portalRoot);
    };
  }, [child, display]);

  return [node, setDisplay];
};

export { usePortal };
