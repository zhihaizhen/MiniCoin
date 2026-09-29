import { createSymbolConfigProvider } from './createSymbolConfigProvider';
import useSymbolConfigList from '../../hooks/useSymbolConfigList';

export const { SymbolConfigContext, SymbolConfigProvider, useSymbolConfig } =
  createSymbolConfigProvider(useSymbolConfigList);
