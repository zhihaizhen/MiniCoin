import { BehaviorSubject } from 'rxjs';

const allSymbolQuoteStream = new BehaviorSubject();

// 不需要初始化的时候就订阅
export default allSymbolQuoteStream;
