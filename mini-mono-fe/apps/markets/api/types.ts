export interface FuturesFavorateChangeReqType {
  upsert_keys: {
    bookSymbolSequence: string; // for Example: bookSymbolSequence: "M1BTCUSDT,M1ETHUSDT"
  };
}

export interface SpotFavorateCreateReqType {
  symbol_id: string; //ETHUSDT
  // exchange_id: number
}

export interface SpotFavorateCancelReqType {
  symbol_id: string; //ETHUSDT
  // exchange_id: number
}
