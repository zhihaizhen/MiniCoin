import { BehaviorSubject } from 'rxjs';

const futureSymbolQuoteStream = new BehaviorSubject();
const spotAllSymbolQuoteStream = new BehaviorSubject();

export { futureSymbolQuoteStream, spotAllSymbolQuoteStream };
