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
    @property int lastRoot;
    @property int lastPrime;
    @property int primesFound;
    @property int nextNotable;
    @property NSMutableArray* primeList;
@end

@implementation PrimeFinder

RCT_EXPORT_MODULE();

-(id) init
{
    self = [super init];
    if (self)
    {
        self.primeList = [@[@2, @3] mutableCopy];
        self.lastRoot = 2; // can compute
        self.lastPrime = 3; // redundant
        self.primesFound = 2; // redundant
        self.nextNotable = 10;
    }
    return self;
}

+(BOOL) requiresMainQueueSetup
{
  return NO;
}

-(NSArray<NSString*>*) supportedEvents
{
    return @[@"foundNotablePrime"];
}

-(BOOL) isPrime:(int) n
{
    // TODO OPT only check primes
    for (int ii = 3; ii <= (self.lastRoot+1); ii++)
    {
        if ((n % ii) == 0)
        {
            return NO;
        }
    }
    return YES;
}

RCT_EXPORT_METHOD(findPrimes:(int) numToFind)
{
    RCTLog(@"Finding 1st %d primes", numToFind);

    if (numToFind > 2)
    {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0),
                       ^{
                            for (int ii = self.lastPrime; ; ii += 2) // don't bother checking evens
                            {
                                // newton's method for approximating sqrt(ii)
                                self.lastRoot -= (self.lastRoot * self.lastRoot - ii) / (2 * self.lastRoot);

                                if ([self isPrime:ii])
                                {
                                    [self.primeList addObject:[NSNumber numberWithInt:ii]];
                                    self.lastPrime = ii;
                                    self.primesFound++;

                                    if (self.primesFound == self.nextNotable)
                                    {
                                        [self sendEventWithName:@"foundNotablePrime" body:@{@"prime": [NSNumber numberWithInt:ii], @"numFound" : [NSNumber numberWithInt:self.primesFound]}];
                                        self.nextNotable *= 10; // assumes you want 10th, 100th, 1000th etc. magic number
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
