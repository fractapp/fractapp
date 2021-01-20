import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {BlueButton, SeedButton, Loader} from 'components/index';
import db from 'storage/DB';
import GlobalStore from 'storage/Global';

export const ConfirmSaveSeed = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const globalContext = useContext(GlobalStore.Context);

  const seed = route.params.seed;
  const isNewAccount = route.params.isNewAccount;
  const randomSeed = [...seed].sort(() => 0.5 - Math.random());

  const [selectedPhrase, setSelectedPhrase] = useState(new Array<string>());
  const [noSelectedPhrase, setNoSelectedPhrase] = useState<Array<string>>(
    randomSeed,
  );
  const [isLoading, setLoading] = useState<boolean>(false);

  const startSaveSeed = async () => {
    setLoading(true);
  };

  useEffect(() => {
    (async () => {
      if (!isLoading) {
        return;
      }

      if (isNewAccount) {
        await db.createAccounts(seed.join(' '));
        await globalContext.dispatch(GlobalStore.signInLocal());
      }

      navigation.reset({
        index: 0,
        routes: [{name: 'Home'}],
      });
      setLoading(false);
    })();
  }, [isLoading]);

  const selectPhrase = (
    index: number,
    value: string,
    source: Array<string>,
    destination: Array<string>,
    setSourceState: React.Dispatch<React.SetStateAction<string[]>>,
    setDestinationState: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    let newSourceArray = [...source];
    newSourceArray.splice(index, 1);
    setSourceState(newSourceArray);

    let newDestinationArray = [...destination];
    newDestinationArray.push(value);
    setDestinationState(newDestinationArray);
  };

  const phrase = (
    source: Array<string>,
    destination: Array<string>,
    setSourceState: React.Dispatch<React.SetStateAction<string[]>>,
    setDestinationState: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const buttons = new Array<Element>();

    for (let i = 0; i < source.length; i++) {
      let value = source[i];
      buttons.push(
        <SeedButton
          key={i}
          text={value}
          onPress={() => {
            selectPhrase(
              i,
              value,
              source,
              destination,
              setSourceState,
              setDestinationState,
            );
          }}
        />,
      );
    }
    return buttons;
  };

  const renderNoSelectedPhrase = () => {
    return phrase(
      noSelectedPhrase,
      selectedPhrase,
      setNoSelectedPhrase,
      setSelectedPhrase,
    );
  };
  const renderSelectedPhrase = () => {
    return phrase(
      selectedPhrase,
      noSelectedPhrase,
      setSelectedPhrase,
      setNoSelectedPhrase,
    );
  };

  const renderButtonOrError = () => {
    if (selectedPhrase.length != seed.length) {
      return null;
    }

    for (let i = 0; i < seed.length; i++) {
      if (selectedPhrase[i] == seed[i]) {
        continue;
      }

      return <Text style={styles.invalidSeed}>Incorrectly entered seed</Text>;
    }
    return (
      <View style={{width: '80%', position: 'absolute', bottom: 40}}>
        <BlueButton text={'Next'} height={50} onPress={startSaveSeed} />
      </View>
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <View
      style={{
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
      }}>
      <Text style={styles.title}>Veryfy secret phrase</Text>
      <Text style={styles.description}>
        Put the words in the correct order.
      </Text>
      <View style={styles.selectedBox}>{renderSelectedPhrase()}</View>

      <View style={styles.noSelected}>{renderNoSelectedPhrase()}</View>

      {renderButtonOrError()}
    </View>
  );
};

const styles = StyleSheet.create({
  selectedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',

    width: '90%',
    height: 150,
    paddingTop: 10,
    marginTop: 30,
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#888888',
  },
  invalidSeed: {
    color: 'red',
    fontFamily: 'Roboto-Regular',
    fontSize: 15,
  },
  noSelected: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '90%',
    marginTop: 40,
  },
  title: {
    marginTop: 80,
    fontSize: 25,
    fontFamily: 'Roboto-Regular',
    color: '#2AB2E2',
  },
  description: {
    width: '90%',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    color: '#888888',
  },
});
