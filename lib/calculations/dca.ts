import type { DcaInput, DcaResult, Dividend, PricePoint, TimelinePoint } from '@/types/finance';
import { calculateXirr, type CashFlow } from './xirr';

const day=(s:string)=>new Date(`${s}T12:00:00Z`);
const monthKey=(s:string)=>s.slice(0,7);
export function calculateDca(input:DcaInput, prices:PricePoint[], dividends:Dividend[]):DcaResult {
  if(day(input.startDate)>day(input.endDate)) throw new Error('Start date must be on or before the end date.');
  if(input.monthlyContribution<0||input.initialInvestment<0) throw new Error('Investment amounts cannot be negative.');
  const p=prices.filter(x=>x.date>=input.startDate&&x.date<=input.endDate).sort((a,b)=>a.date.localeCompare(b.date));
  if(!p.length) throw new Error('No historical prices are available for this date range.');
  const divs=[...dividends].filter(x=>x.date>=input.startDate&&x.date<=input.endDate).sort((a,b)=>a.date.localeCompare(b.date));
  let shares=0, contributions=0, dividendTotal=0, reinvested=0, cash=0, divIndex=0; const timeline:TimelinePoint[]=[]; const cashFlows:CashFlow[]=[]; let lastMonth='';
  for(let i=0;i<p.length;i++){
    const price=p[i];
    let amount=0;
    if(i===0&&input.initialInvestment>0) amount+=input.initialInvestment;
    if(monthKey(price.date)!==lastMonth){ amount+=input.monthlyContribution; lastMonth=monthKey(price.date); }
    if(amount){ shares+=amount/price.close; contributions+=amount; cashFlows.push({date:price.date,amount:-amount}); }
    while(divIndex<divs.length&&divs[divIndex].date<=price.date){ const dividend=shares*divs[divIndex].amount; dividendTotal+=dividend; if(input.reinvestDividends){shares+=dividend/price.close; reinvested+=dividend;}else cash+=dividend; divIndex++; }
    timeline.push({date:price.date,contributions,portfolioValue:shares*price.close+cash,shares,dividends:dividendTotal});
  }
  const final=timeline.at(-1)!; const years=[...new Set(timeline.map(x=>Number(x.date.slice(0,4))))].map(year=>{const points=timeline.filter(x=>x.date.startsWith(String(year)));const end=points.at(-1)!;const prior=timeline.filter(x=>x.date<`${year}-01-01`).at(-1);return {year,contributions:end.contributions-(prior?.contributions??0),endingShares:end.shares,dividends:end.dividends-(prior?.dividends??0),portfolioValue:end.portfolioValue,gainLoss:end.portfolioValue-end.contributions};});
  const endingValue=final.portfolioValue, gain=endingValue-contributions;
  const moneyWeightedReturn=endingValue>0?calculateXirr([...cashFlows,{date:final.date,amount:endingValue}]):null;
  return {endingValue,investedValue:shares*p.at(-1)!.close,cashDividends:cash,totalContributions:contributions,investmentGain:gain,totalReturn:contributions?gain/contributions:0,shares,dividendsReceived:dividendTotal,dividendsReinvested:reinvested,annualizedReturn:moneyWeightedReturn,contributionMultiple:contributions?endingValue/contributions:0,timeline,years};
}
