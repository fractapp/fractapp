import BN from 'bn.js';
import {Currency} from 'types/wallet';
import {Api} from 'utils/polkadot';
import PricesStore from 'storage/Prices';

/**
 * @namespace
 * @category Utils
 */
namespace MathUtils {
  type CalculateTxFeeInfo = {
    usdFee: number;
    fee: BN;
  };

  const USDDecimals = 2;
  export function floor(value: number, decimals: number): number {
    return Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
  export function floorUsd(value: number): number {
    return floor(value, USDDecimals);
  }
  export function round(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
  export function roundUsd(value: number): number {
    return round(value, USDDecimals);
  }

  export async function calculateValue(
    priceContext: PricesStore.ContextType,
    currency: Currency,
    value: number,
    isUSDMode: boolean,
  ): Promise<number> {
    const api = await Api.getInstance(currency);
    const price = priceContext.state?.get(currency) ?? 0;

    return isUSDMode
      ? MathUtils.round(value / price, api.viewDecimals)
      : MathUtils.roundUsd(value * price);
  }

  export async function calculateTxInfo(
    priceContext: PricesStore.ContextType,
    currency: Currency,
    currencyValue: number,
    receiver: string,
  ): Promise<CalculateTxFeeInfo> {
    const api = await Api.getInstance(currency);
    const price = priceContext.state?.get(currency) ?? 0;

    const substrateApi = await api.getSubstrateApi();
    const info = await substrateApi.tx.balances
      .transferKeepAlive(receiver, api.convertToPlanck(String(currencyValue)))
      .paymentInfo(receiver);

    return {
      fee: info.partialFee,
      usdFee: MathUtils.roundUsd(
        api.convertFromPlanckWithViewDecimals(info.partialFee) * price,
      ),
    };
  }
}

export default MathUtils;
