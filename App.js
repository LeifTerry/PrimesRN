/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button} from 'react-native';
import PrimeList from './PrimeList';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component
{
    constructor() 
    {
        super();
        this.state = {
            isRunning: false,
            latest: 3,
            lastRoot: 3,
            list: [2, 3]
        }
        this.updateState = this.updateState.bind(this)
    }
    
    updateState()
    {
        this.setState({ isRunning: (this.primeList.isRunning() || this.nativePrimeList.isRunning()) });
    }

    render()
    {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Prime Number Demo</Text>

        <View style={{flexDirection:'row', flex:4, marginBottom:5}}>
                <PrimeList native={false} 
                    onRef={ref => (this.primeList = ref)} 
                    updateParentState = {this.updateState}
                    themeColor = {'#882222'}
                    color = {'#882222'}>
                        JavaScript
                </PrimeList>
                <PrimeList 
                    native={true} 
                    onRef={ref => (this.nativePrimeList = ref)} 
                    updateParentState = {this.updateState}
                    themeColor = {'#222288'}
                    color={'#222288'}>
                        Native
                </PrimeList>
        </View>

        <Button
            title="Start"
            color="#115511"
            accessibilityLabel="Start finding prime numbers"
            disabled={this.state.isRunning}
            onPress={() => {
                this.primeList.doSearch();
                this.nativePrimeList.doSearch();
                this.setState(previousState => {
                    return { isRunning: true };
                });
            }}
        />
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
    }

} // end App Component

const styles = StyleSheet.create({
  container: {
    flex: 6,
    // justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',    
  },
  welcome: {
    flex: 1,
    // justifyContent: 'center',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  instructions: {
    flex: 1,
    // justifyContent: 'center',
    textAlign: 'center',
    color: '#333333',
    marginTop: 5,
    marginBottom: 5,
  },
});
