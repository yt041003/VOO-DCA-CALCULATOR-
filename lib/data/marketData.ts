import type { Dividend, MarketDataset, PricePoint, SymbolCode } from '@/types/finance';

export interface MarketDataProvider {
  getHistoricalPrices(symbol: SymbolCode, startDate: string, endDate: string): Promise<PricePoint[]>;
  getHistoricalDividends(symbol: SymbolCode, startDate: string, endDate: string): Promise<Dividend[]>;
  getDataset(symbol: SymbolCode, startDate: string, endDate: string): Promise<MarketDataset>;
}

/** Provider for a production JSON endpoint. Response must contain raw (not adjusted) closes and dividends. */
export class HttpMarketDataProvider implements MarketDataProvider {
  constructor(private endpoint = '/api/market-data') {}
  private async request(symbol: SymbolCode, start: string, end: string): Promise<MarketDataset> {
    const response = await fetch(`${this.endpoint}?symbol=${encodeURIComponent(symbol)}&start=${start}&end=${end}`);
    if (!response.ok) throw new Error('Historical market data is temporarily unavailable.');
    return response.json() as Promise<MarketDataset>;
  }
  async getDataset(symbol: SymbolCode, start: string, end: string) { return this.request(symbol, start, end); }
  async getHistoricalPrices(symbol: SymbolCode, start: string, end: string) { return (await this.request(symbol, start, end)).prices; }
  async getHistoricalDividends(symbol: SymbolCode, start: string, end: string) { return (await this.request(symbol, start, end)).dividends; }
}
