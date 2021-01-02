import React from 'react';
import {Image} from 'react-native';
import {Currency, getLogo, withoutBorder} from 'models/wallet';

/**
 * @category Components
 */
export const WalletLogo = ({
  currency,
  size,
}: {
  currency: Currency;
  size: number;
}) => {
  return (
    <Image
      source={getLogo(currency)}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        borderWidth: withoutBorder(currency) ? 0.8 : 0,
        borderColor: 'black',
      }}
    />
  );
};
