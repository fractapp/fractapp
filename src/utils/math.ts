import BN from 'bn.js';

/**
 * @namespace
 * @category Utils
 */
namespace MathUtils {
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

  export async function calculateAlternativeValue(
    price: number,
    decimals: number,
    value: number,
    isUSDMode: boolean,
  ): Promise<number> {
    return isUSDMode
      ? MathUtils.round(value / price, decimals)
      : MathUtils.roundUsd(value * price);
  }

  export function convertFromPlanckToViewDecimals(
    planck: BN,
    decimals: number,
    viewDecimals: number,
  ): number {
    return (
      planck
        .mul(new BN(1000))
        .div(new BN(10).pow(new BN(decimals)))
        .toNumber() / Math.pow(10, viewDecimals)
    );
  }

  export function convertFromPlanckString(
    planck: BN,
    decimals: number,
  ): string {
    let value = planck.toString();

    const length = value.length;
    if (length < decimals) {
      for (let i = 0; i < decimals - length; i++) {
        value = '0' + value;
      }
    }

    value =
      value.substr(0, value.length - decimals) +
      '.' +
      value.substr(value.length - decimals);

    if (value.startsWith('.')) {
      value = '0' + value;
    }

    return value;
  }

  export function convertToPlanck(number: string, decimals: number): BN {
    const numbers = String(number).split('.');
    let planks = numbers[0] + (numbers.length === 2 ? numbers[1] : '');
    if (numbers.length === 2 && numbers[1].length < decimals) {
      for (let i = 0; i < decimals - numbers[1].length; i++) {
        planks += '0';
      }
    } else if (numbers.length === 1) {
      for (let i = 0; i < decimals; i++) {
        planks += '0';
      }
    }

    return new BN(planks);
  }
}

export default MathUtils;
