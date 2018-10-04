/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import PrimeList from './PrimeList';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props>  // xx!! Props?
{
    constructor() 
    {
      super();
      this.state = {
        latest: 3,
        lastRoot: 3,
        list: [2, 3]
      }
    }  
    
    render() 
    {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Prime Number Demo</Text>

        <View style={{flexDirection:'row', flex:2}}>
            <PrimeList native={false}>JavaScript</PrimeList>
            <PrimeList native={true}>Native</PrimeList>
        </View>

        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
    }
} // end App Component

const styles = StyleSheet.create({
  container: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  instructions: {
    flex: 1,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
