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

// stop after finding this many primes
const numPrimesToFind = 1000000; // one million

export default class PrimeList extends Component
{
    constructor() 
    {
      super();
      this.state = {
        latest      : 3,        // last prime found
        numFound    : 2,
        done        : false,
        notables    : [{key:'1st    ', value:2}]
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
          data={this.state.notables}
          extraData={this.state}
          renderItem={({item}) => <Text>{item.key + (item.key.length > 7 ? '\t' : '\t\t') + item.value}</Text>}
        />
        <ActivityIndicator animating={this.state.done ? false : true}></ActivityIndicator>
      </View>
    );
    }

    isPrime(num)
    {
        // pretty fast
        // since primeList contains 2, has unnecessary check for (num %2) == 0
        for (let prime of this.primeList)
        {
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
                'foundPrime', // xx!! should be a constant
                (prime) => 
                {
                    if (prime.isNotable)
                    {
                        this.state.notables.push({key:prime.numFound+'th', value:prime.prime}); // xx!! maybe don't modify state directly
                    }
                    if (prime.numFound >= numPrimesToFind)
                    {
                        this.state.done = true;
                        this._subscription.remove();
                        this._subscription = null;
                    }
                    this.setState(previousState => 
                        {
                            return {latest: prime.prime, numFound:prime.numFound};
                        });
                }
            );
            nativePrimeFinder.findPrimes(numPrimesToFind); 
        }
        else
        {
            this.primeList = [2, 3];    // start with first two primes           
            this.lastRoot = 2;          // approximate sqrt() of last number we checked (3), no need for factors greater than this
            this.nextNotableOrdinal = 10;   // show 1st, 10th, etc.
            this.batchSize = 10;        // update UI after each "batch"

            this._interval = setInterval(() => 
            {
                let foundThisBatch = 0;

                // find the next prime
                // only need to check the odd numbers
                // start where we left off
                for (let ii = this.primeList[this.primeList.length-1] + 2; ; ii += 2)
                {
                    // newton's method for sqrt 
                    this.lastRoot -= (this.lastRoot * this.lastRoot - ii) / (2 * this.lastRoot);
                    if (this.isPrime(ii))
                    {
                        foundThisBatch++;
                        let shouldUpdateState = false;

                        this.primeList.push(ii);

                        if (this.primeList.length == numPrimesToFind)
                        {
                            this.state.done = true; // xx!! shouldn't modify state directly
                            clearInterval(this._interval);
                            this._interval = null;
                            shouldUpdateState = true;
                        }
                        if (this.primeList.length == this.nextNotableOrdinal)
                        {
                            this.state.notables.push({key:this.nextNotableOrdinal+'th', value:ii}); // xx!! shouldn't modify state directly
                            this.batchSize = this.nextNotableOrdinal;
                            this.nextNotableOrdinal *= 10; // show 10th, 100th, 1000th etc primes, magic number
                            shouldUpdateState = true;
                        }
                        if (foundThisBatch == this.batchSize)
                        {
                            shouldUpdateState = true;
                        }
                        if (shouldUpdateState)
                        {
                            this.setState(previousState => 
                                {
                                    return {latest: ii, numFound: this.primeList.length};
                                });
                            break;
                        }

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
