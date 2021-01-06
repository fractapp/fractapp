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
}

export default MathUtils;