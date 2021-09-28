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

  export function calculateUsdValue(
    value: BN,
    decimals: number,
    price: number,
  ): number {
    const d = new BN(10).pow(new BN(decimals));
    const ud = new BN(10).pow(new BN(USDDecimals));
    return roundUsd(
      value.mul(ud).mul(new BN(price * ud.toNumber())).div(d.mul(ud)).toNumber() / ud.toNumber(),
    );
  }

  export function calculatePlanksValue(
    usdValue: number,
    decimals: number,
    price: number,
  ): BN {
    const d = new BN(10).pow(new BN(decimals));
    const ud = new BN(10).pow(new BN(USDDecimals));

    return price === 0 ? new BN(0) :
      new BN(usdValue * ud.toNumber())
        .mul(d)
        .div(new BN(price * ud.toNumber()));
  }

  export function convertFromPlanckToViewDecimals(
    planck: BN,
    decimals: number,
    viewDecimals: number,
    isRound?: boolean,
  ): number {
    const d = new BN(10).pow(new BN(decimals));
    const viewD = new BN(10).pow(new BN(viewDecimals));

    const preV = planck.mul(viewD).div(d);
    let v = preV;

    if (isRound) {
      const rem = preV.mod(viewD);
      if (rem.cmp(new BN(0)) > 0) {
        v = v.add(new BN(1));
      }
    }

    return round(v.toNumber() / viewD.toNumber(), viewDecimals);
  }

  export function convertFromPlanckToString(
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

    let lastPart = value.substr(value.length - decimals);
    let newLastPart = lastPart;
    for (let i = lastPart.length - 1; i >= 0; i--) {
      if (lastPart[i] !== '0') {
        break;
      }
      newLastPart = newLastPart.slice(0, i);
    }

    value = value.substr(0, value.length - decimals) + '.' + newLastPart;

    if (value.startsWith('.')) {
      value = '0' + value;
    }
    if (value.endsWith('.')) {
      value = value.slice(0, value.length - 1);
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
