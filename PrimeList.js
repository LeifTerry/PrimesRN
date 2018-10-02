/**
 * PrimeList
 * Demo showing a list of numbers found
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, FlatList, ActivityIndicator} from 'react-native';
import {NativeEventEmitter, NativeModules} from 'react-native';

const nativePrimeFinder = NativeModules.PrimeFinder;
const nativePrimeEmitter = new NativeEventEmitter(nativePrimeFinder);
const numPrimesToFind = 1000000; // stop after finding this many, hard-coded

export class PrimeList extends Component
{
    constructor() 
    {
      super();
      this.state = {
        primeList   : [2, 3],   // start with first two primes
        latest      : 3,        // last prime found
        lastRoot    : 2,        // sqrt(3), rounded up
        numFound    : 2,
        done        : false,
        notable     : [{key:'1st    ', value:2}]
      }
      this.nextNotableOrdinal = 10;
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
        for (prime of this.state.primeList)
        {
          if ((num % prime) == 0)
          {
              return false;
          }
          if (prime > this.state.lastRoot)
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
                    this.state.notable.push({key:notable.numFound+'th', value:notable.prime});
                    this.state.numFound = notable.numFound;
                    if (notable.numFound >= numPrimesToFind)
                    {
                        this.state.done = true;
                        this._subscription.remove();
                        this._subscription = null;
                    }
                    this.setState(previousState => 
                        {
                            return {latest: notable.prime};
                        });
                }
            );
            nativePrimeFinder.findPrimes(numPrimesToFind); 
        }
        else
        {
            this._interval = setInterval(() => 
            {
                // find the next prime
                // only need to check the odd numbers
                for (let ii = this.state.latest + 2; ; ii += 2)
                {
                    // newton's method for sqrt 
                    this.state.lastRoot -= (this.state.lastRoot * this.state.lastRoot - ii) / (2 * this.state.lastRoot);
                    if (this.isPrime(ii))
                    {
                        this.state.primeList.push(ii);
                        this.state.numFound = this.state.primeList.length;
                        this.state.latest = ii;
                        if (this.state.numFound == numPrimesToFind)
                        {
                            this.state.done = true;
                            clearInterval(this._interval);
                            this._interval = null;
                        }
                        if (this.state.numFound == this.nextNotableOrdinal)
                        {
                            this.state.notable.push({key:this.nextNotableOrdinal+'th', value:ii});
                            this.nextNotableOrdinal *= 10; // show 10th, 100th, 1000th etc primes, magic number
                        }
                        this.setState(previousState => 
                            {
                                return {latest: ii};
                            });

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
