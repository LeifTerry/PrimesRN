/**
 * PrimeList
 * Demo showing a list of numbers found
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, FlatList, ActivityIndicator} from 'react-native';
import {NativeEventEmitter, NativeModules} from 'react-native';

const nativePrimeFinder = NativeModules.PrimeFinder;
// receive iOS native events
const nativePrimeEmitter = new NativeEventEmitter(nativePrimeFinder);

// stop after finding this many, hard-coded to one million for now
const numPrimesToFind = 1000000; 

export class PrimeList extends Component
{
    constructor() 
    {
      super();
      this.state = {
        latest      : 3,        // last prime found
        numFound    : 2,
        done        : false,
        notable     : [{key:'1st    ', value:2}]
      }
    }
    
    render() 
    {
    return (
      <View style={styles.container}>
        <Text style={styles.instructions}>{this.props.children}</Text>
        <Text style={styles.instructions}>{this.state.latest}</Text>
        <Text style={styles.instructions}>{'Found ' + this.state.numFound}</Text>
        <FlatList
          data={this.state.notable}
          extraData={this.state}
          renderItem={({item}) => <Text>{item.key + (item.key.length > 7 ? '\t' : '\t\t') + item.value}</Text>}
        />
        <ActivityIndicator animating={this.state.done ? false : true}></ActivityIndicator>
      </View>
    );
    }

    isPrime(num)
    {
        for (let ii = 1; ii < this.primeList.length; ii++)
        {
            let prime = this.primeList[ii];
            if ((num % prime) == 0)
            {
                return false;
            }
            if (prime > this.lastRoot)
            {
                return true;
            }
        }

        return true;
    }

    componentDidMount () 
    {
        if (this.props.native)
        {
            this._subscription = nativePrimeEmitter.addListener(
                'foundNotablePrime', // xx!! should be a constant
                (notable) => 
                {
                    this.state.notable.push({key:notable.numFound+'th', value:notable.prime}); // xx!! maybe don't modify state directly
                    if (notable.numFound >= numPrimesToFind)
                    {
                        this.state.done = true;
                        this._subscription.remove();
                        this._subscription = null;
                    }
                    this.setState(previousState => 
                        {
                            return {latest: notable.prime, numFound:notable.numFound};
                        });
                }
            );
            nativePrimeFinder.findPrimes(numPrimesToFind); 
        }
        else
        {
            this.primeList = [2, 3];   // start with first two primes            
            this.lastRoot = 2;         // approximate sqrt() of last number we checked, no need for factors greater than this
            this.nextNotableOrdinal = 10;   // show 1st, 10th, etc.
            this.numFound = 2;
            this.latest = 3;

            this._interval = setInterval(() => 
            {
                // find the next prime
                // only need to check the odd numbers
                for (let ii = this.latest + 2; ; ii += 2)
                {
                    // newton's method for sqrt 
                    this.lastRoot -= (this.lastRoot * this.lastRoot - ii) / (2 * this.lastRoot);
                    if (this.isPrime(ii))
                    {
                        let shouldUpdateState = false;

                        this.latest = ii;
                        this.primeList.push(ii);
                        this.numFound = this.primeList.length;

                        if (this.numFound == numPrimesToFind)
                        {
                            this.state.done = true; // xx!! shouldn't modify state directly
                            clearInterval(this._interval);
                            this._interval = null;
                            shouldUpdateState = true;
                        }
                        if (this.numFound == this.nextNotableOrdinal)
                        {
                            this.state.notable.push({key:this.nextNotableOrdinal+'th', value:ii}); // xx!! shouldn't modify state directly
                            this.nextNotableOrdinal *= 10; // show 10th, 100th, 1000th etc primes, magic number
                            shouldUpdateState = true;
                        }
                        if (this.numFound % 10 == 0) // peridoically update UI with progress
                        {
                            shouldUpdateState = true;
                        }
                        if (shouldUpdateState)
                        {
                            this.setState(previousState => 
                                {
                                    return {latest: ii, numFound: this.numFound};
                                });
                        }

                        break;
                    }
                }
            }, 0); // ms delay between primes, can be 0 for fastest possible
        }
    }

    componentWillUnmount() 
    {
        if (this._subscription)
        {
            this._subscription.remove();
            this._subscription = null;
        }
        if (this._interval)
        {
            clearInterval(this._interval);
            this._interval = null;
        }
    }

} // end PrimeList Component

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
