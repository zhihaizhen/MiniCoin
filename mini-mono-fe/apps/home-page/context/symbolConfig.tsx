import { createSymbolConfigProvider } from 'libs/ws-service';
import useSymbolConfigList from '~/hooks/useSymbolConfigList';

export const { SymbolConfigContext, SymbolConfigProvider, useSymbolConfig } =
  createSymbolConfigProvider(useSymbolConfigList);
