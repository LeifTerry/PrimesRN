//
//  PrimeFinder.m
//  PrimesRN
//
//  Created by Leif Terry on 10/1/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import "PrimeFinder.h"
#import <React/RCTLog.h>

@interface PrimeFinder()
    @property int lastRoot;     // estimate of square root of last prime found
    @property int primesFound;  // num primes found so far
    @property int nextNotable;  // send message for "notable" primes, i.e. 10th, 100th, 1000th etc.
    @property int batchSize;    // send message after finding this many primes
    @property NSMutableArray* primeList;    // list of primes found, excluding 2
@end

@implementation PrimeFinder

RCT_EXPORT_MODULE();

-(id) init
{
    self = [super init];
    if (self)
    {
        // add custom init here
    }
    return self;
}

+(BOOL) requiresMainQueueSetup
{
  return NO;
}

-(NSArray<NSString*>*) supportedEvents
{
    return @[@"foundPrime"];
}

-(void) setupToFind:(int) numToFind
{
    self.primeList = [[NSMutableArray alloc] initWithCapacity:numToFind];
    [self.primeList addObject:@2];
    [self.primeList addObject:@3];
    NSNumber* lastPrime = [self.primeList lastObject];
    assert((lastPrime.intValue % 2) == 1);

    self.primesFound = (int) self.primeList.count;
    self.lastRoot = sqrtf((float) lastPrime.intValue) + 1;

    self.nextNotable = 10;
    self.batchSize = 10;
}

-(BOOL) isPrime_v0:(int) n
{
    // simple but has redundant checks for non-prime odds such as 9, 15, 21 etc.
    for (int ii = 3; ii <= (self.lastRoot+1); ii += 2)
    {
        if ((n % ii) == 0)
        {
            return NO;
        }
    }
    return YES;
}

-(BOOL) isPrime_v1:(int) n
{
    // we know n is not even, skip index 0 == 2
    // start at index 1 == 3
    for (int ii = 1; ; ii ++)
    {
        NSNumber* prime = self.primeList[ii];
        if ((n % prime.intValue) == 0)
        {
            return NO;
        }
        if (prime.intValue > self.lastRoot)
        {
            return YES;
        }
    }
    return YES;
}

-(BOOL) isPrime_v2:(int) n
{
    // uses fast iteration
    // has unnecessary check for (num % 2) == 0
    for (NSNumber* prime in self.primeList)
    {
        if ((n % prime.intValue) == 0)
        {
            return NO;
        }
        if (prime.intValue > self.lastRoot)
        {
            return YES;
        }
    }
    return YES;
}


#define isPrime isPrime_v2

RCT_EXPORT_METHOD(findPrimes:(int) numToFind)
{
    RCTLog(@"Finding 1st %d primes", numToFind);

    if (numToFind > 2)
    {
        [self setupToFind:numToFind];

        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0),
                       ^{
                           NSNumber* lastPrime = [self.primeList lastObject];
                           int foundThisBatch = 0;

                           for (int ii = lastPrime.intValue + 2; ; ii += 2) // don't bother checking evens
                           {
                               // newton's method for approximating sqrt(ii)
                               self.lastRoot -= (self.lastRoot * self.lastRoot - ii) / (2 * self.lastRoot);

                               if ([self isPrime:ii])
                               {
                                   // try a couple of things to optimize isPrime
                                   // store prime in NSArray
                                   [self.primeList addObject:[NSNumber numberWithInt:ii]];

                                   self.primesFound++;
                                   foundThisBatch++;

                                   if (self.primesFound == self.nextNotable)
                                   {
                                       [self sendEventWithName:@"foundPrime" body:@{@"prime": [NSNumber numberWithInt:ii], @"numFound" : [NSNumber numberWithInt:self.primesFound], @"isNotable" : @YES}];
                                       self.batchSize = self.nextNotable;
                                       self.nextNotable *= 10; // assumes you want 10th, 100th, 1000th etc. magic number
                                       foundThisBatch = 0;
                                   }
                                   else if (foundThisBatch == self.batchSize)
                                   {
                                       // send periodic update about primes found
                                       [self sendEventWithName:@"foundPrime" body:@{@"prime": [NSNumber numberWithInt:ii], @"numFound" : [NSNumber numberWithInt:self.primesFound], @"isNotable" : @NO}];
                                       foundThisBatch = 0;
                                   }
                                   if (self.primesFound == numToFind)
                                   {
                                       break;
                                   }
                               }
                           }
                        });
    }
    // else input is invalid or trivial, TODO handle this case
}

@end
