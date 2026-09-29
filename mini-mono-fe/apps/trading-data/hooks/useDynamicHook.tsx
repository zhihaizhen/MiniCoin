import SymbolFetch from '@region-lib/symbol-fetch';
import { useState, useEffect } from 'react';



export const useDynamicSymbolHook = () => {
    const [allSymbolList, setAllSymbolList] = useState([]);

    const [allSymbols, setAllSymbols] = useState<{ InversePerpetual: any[], LinearPerpetual: any[], FreeUPerpetual: any[] }>({ InversePerpetual: [], LinearPerpetual: [], FreeUPerpetual: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        SymbolFetch?.getInstance()
            .fetchSymbolList()
            .then((res) => {
                setLoading(false);
                const { originData } = res;
                // 把StockRwaPerpetual和MetalRwaPerpetual放在LinearPerpetual里，并且去重的symbol
                const allLinearPerpetual = [...originData.LinearPerpetual, ...originData.StockRwaPerpetual, ...originData.MetalRwaPerpetual];
                // 使用 Map 实现去重（基于 symbolName）
                const symbolMap = new Map();
                allLinearPerpetual.forEach(symbol => {
                    if (!symbolMap.has(symbol.symbolName)) {
                        symbolMap.set(symbol.symbolName, symbol);
                    }
                });
                const newLinearPerpetual = Array.from(symbolMap.values());
                const newOriginData = {
                    InversePerpetual: originData.InversePerpetual,
                    LinearPerpetual: newLinearPerpetual,
                    FreeUPerpetual: originData.FreeUPerpetual,
                }
                setAllSymbols(newOriginData);
                setAllSymbolList([
                    ...originData.InversePerpetual,
                    ...newLinearPerpetual,
                ]);
            });
    }, []);

    return { allSymbols, loading, allSymbolList };

};