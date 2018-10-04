package com.primesrn;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.util.Log;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import android.support.annotation.Nullable;

public class PrimeFinder extends ReactContextBaseJavaModule 
{
    private ReactApplicationContext reactContext;
    private int lastRoot;           // estimate of square root of last prime found
    private int primesFound;        // num primes found so far
    private int nextNotable;        // send message for "notable" primes, i.e. 10th, 100th, 1000th etc.
    private int batchSize;          // send message after finding this many primes
    private int[] primeList;    // list of primes found

    public PrimeFinder(ReactApplicationContext reactContext)
    {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName()
    {
        return "PrimeFinder";
    }

    private boolean isPrime(int num)
    {
        for (int ii = 1; ii < this.primesFound ; ii++)
        {
            int prime = this.primeList[ii];
            if ((num % prime) == 0)
            {
                // num is divisible, not prime
                return false;
            }
            if (prime > this.lastRoot)
            {
                // lastRoot is >= sqrt(num)
                // so
                // num is not divisible by any primes less than sqrt(num)
                return true;
            }
        }
        return true;
    }

    @ReactMethod
    public void findPrimes(final int numToFind) 
    {
        this.primeList = new int[numToFind];
        this.primeList[0] = 2;
        this.primeList[1] = 3;
        this.primesFound = 2;
        this.lastRoot = 2; // srt(3) rounded up
    
        this.nextNotable = 10;
        this.batchSize = 10;
     
        final PrimeFinder thisRef = this;
        Thread thread = new Thread() 
        {
            @Override
            public void run() 
            {
                    int foundThisBatch = 0;
                    for (int ii = thisRef.primeList[1] + 2; ; ii += 2) // don't bother checking evens
                    {
                        thisRef.lastRoot -= (thisRef.lastRoot * thisRef.lastRoot - ii) / (2 * thisRef.lastRoot);

                        if (isPrime(ii))
                        {
                            thisRef.primeList[thisRef.primesFound] = ii;
                            thisRef.primesFound++;
                            foundThisBatch++;

                            if (thisRef.primesFound == thisRef.nextNotable)
                            {
                                WritableMap eventData = Arguments.createMap();
                                eventData.putInt("prime", ii);
                                eventData.putInt("numFound", thisRef.primesFound);
                                eventData.putBoolean("isNotable", true);
                                sendEvent("foundPrime", eventData);

                                // increase batch size and notable threshold
                                thisRef.batchSize = thisRef.nextNotable;
                                thisRef.nextNotable *= 10;
                                foundThisBatch = 0;
                            }
                            else if (foundThisBatch == thisRef.batchSize)
                            {
                                WritableMap eventData = Arguments.createMap();
                                eventData.putInt("prime", ii);
                                eventData.putInt("numFound", thisRef.primesFound);
                                eventData.putBoolean("isNotable", false);
                                sendEvent("foundPrime", eventData);

                                // reset batch, keep current size
                                foundThisBatch = 0;
                            }
                            if (thisRef.primesFound == numToFind)
                            {
                                break;
                            }
                        }
                    }
            }
        };
        thread.start();
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) 
    {
      this.reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
    }
}