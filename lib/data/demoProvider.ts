import type { MarketDataProvider } from './marketData';
import type { MarketDataset, SymbolCode } from '@/types/finance';

// Development-only deterministic illustration. Values are synthetic and never represented as VOO history.
export class DemoMarketDataProvider implements MarketDataProvider {
  async getDataset(symbol: SymbolCode, start: string, end: string): Promise<MarketDataset> {
    const prices=[]; const dividends=[]; let d=new Date(`${start}T12:00:00Z`); const stop=new Date(`${end}T12:00:00Z`); let i=0;
    while(d<=stop){ if(d.getUTCDay()>0&&d.getUTCDay()<6){ const date=d.toISOString().slice(0,10); prices.push({date,close:100*Math.pow(1.00025,i)*(1+.025*Math.sin(i/31))}); if(d.getUTCMonth()%3===2&&d.getUTCDate()===15) dividends.push({date,amount:.42}); i++; } d.setUTCDate(d.getUTCDate()+1); }
    return {symbol,prices,dividends,source:'Synthetic demonstration data',isDemonstration:true};
  }
  async getHistoricalPrices(s:SymbolCode,a:string,b:string){return (await this.getDataset(s,a,b)).prices;}
  async getHistoricalDividends(s:SymbolCode,a:string,b:string){return (await this.getDataset(s,a,b)).dividends;}
}
