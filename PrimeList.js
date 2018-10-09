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
const numPrimesToFind = 1000000; // one million, hard-coded for now

export default class PrimeList extends Component
{
    constructor() 
    {
      super();
      this.state = {
        // latest      : 3,        // last prime found
        numFound    : 0,
        isStarted   : false,
        isDone      : false,
        notables    : []
      }
    }
    
    render() 
    {
    return (
      <View style={styles.container}>
        <Text style={styles.instructions}>{this.props.children}</Text>
        <Text style={styles.instructions}>{this.state.latest}</Text>
        <Text style={styles.instructions}>{'Found ' + this.state.numFound}</Text>
        <View style={{ flexDirection: 'row' }}>
            <FlatList
                style={{ margin: 5 }}
                data={this.state.notables}
                extraData={this.state}
                renderItem={({ item }) => <Text style={{ textAlign: 'left', color:'#111100', margin: 2 }}>{item.key}</Text>}
            />
            <FlatList
                style={{margin:5}}
                data={this.state.notables}
                extraData={this.state}
                renderItem={({ item }) => <Text style={{textAlign:'right', color:'#110011', margin: 2}}>{item.value}</Text>}
            />
        </View>
        <ActivityIndicator animating={this.isRunning() ? true : false}></ActivityIndicator>
      </View>
    );
    }

    getOrdinalName(num)
    {
        let ordinalName = num + 'th';
        if (num == 1)
        {
            ordinalName = '1st';
        } 
        else if (num == 2) 
        {
            ordinalName = '2nd';
        } 
        else if (num == 3) 
        {
            ordinalName = '3rd';
        } 
        else if (num == 1000000) 
        {
            ordinalName = 'Millionth';
        }
        else if ((num > 1000000) && ((num % 1000000) == 0))
        {
            ordinalName = (num / 1000000) + 'Mth';
        }

        return ordinalName;
    }

    isPrime(num)
    {
        // returns true if num is a prime number
        // otherwise false
        // assumes this.primeList is a complete list of prime numbers < num
        // assumes this.lastRoot is >= sqrt(num)
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

    initSearch()
    {
        // start with two primes: '2' and '3'
        this.notables = [{ key: '1st', value: 2 }];
        this.isDone = false;

        this.setState(previousState => {
            return { latest: 3, numFound: 2, notables: this.notables, isDone: false, isStarted: false };
        });
    }

    doNativeSearch() 
    {
        this._subscription = nativePrimeEmitter.addListener(
            nativePrimeFinder.foundPrimeEvent,
            (event) => {
                if (event.isNotable) {
                    this.notables.push({ key: this.getOrdinalName(event.numFound), value: event.prime });
                }
                if (event.numFound >= numPrimesToFind) {
                    this.isDone = true;
                    this._subscription.remove();
                    this._subscription = null;
                }
                this.setState(previousState => {
                    return { latest: event.prime, numFound: event.numFound, notables: this.notables, isDone: this.isDone };
                });
                this.props.updateParentState();
            }
        );
        nativePrimeFinder.findPrimes(numPrimesToFind);
    }

    isRunning()
    {
        return (this.state.isStarted && !this.state.isDone);
    }

    doSearch()
    {
        this.initSearch();
        this.setState(previousState => {
            return { isStarted: true };
        });
        if (this.props.native) 
        {
            this.doNativeSearch();
        }
        else
        {
            this.primeList = [2, 3];        // start with first two primes           
            this.lastRoot = 2;              // approximate sqrt() of last number we checked (3), no need for factors greater than this
            this.nextNotableOrdinal = 10;   // show 1st, 10th, etc.
            this.batchSize = 10;            // update UI after each "batch"

            this._interval = setInterval(() => {
                let foundThisBatch = 0;

                // find the next prime
                // only need to check the odd numbers
                // start where we left off
                for (let ii = this.primeList[this.primeList.length - 1] + 2; ; ii += 2) {
                    // newton's method for sqrt 
                    this.lastRoot -= (this.lastRoot * this.lastRoot - ii) / (2 * this.lastRoot);
                    if (this.isPrime(ii)) {
                        foundThisBatch++;
                        let shouldUpdateState = false;

                        this.primeList.push(ii);

                        if (this.primeList.length == numPrimesToFind) {
                            this.isDone = true;
                            clearInterval(this._interval);
                            this._interval = null;
                            shouldUpdateState = true;
                        }
                        if (this.primeList.length == this.nextNotableOrdinal) {
                            this.notables.push({ key: this.getOrdinalName(this.primeList.length), value: ii });

                            this.batchSize = this.nextNotableOrdinal;
                            this.nextNotableOrdinal *= 10; // show 10th, 100th, 1000th etc primes, magic number
                            shouldUpdateState = true;
                        }
                        if (foundThisBatch == this.batchSize) {
                            shouldUpdateState = true;
                        }
                        if (shouldUpdateState) {
                            this.setState(previousState => {
                                return { latest: ii, numFound: this.primeList.length, notables: this.notables, isDone: this.isDone };
                            });
                            this.props.updateParentState();
                            break;
                        }

                    }
                }
            }, 0); // ms delay between primes, can be 0 for fastest possible
        }
    }

    componentDidMount () 
    {
        this.props.onRef(this);
    }

    componentWillUnmount() 
    {
        this.props.onRef(undefined);
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
