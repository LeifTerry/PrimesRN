# PrimesRN
Simple React Native demo. Computes and displays prime numbers.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Demo was created using React Native with native modules. That process is described here: 
https://facebook.github.io/react-native/docs/getting-started

There are a few prerequisites including these:

```
brew install node
brew install watchman
```

And most importantly:

```
npm install -g react-native-cli
```

You will need to install Xcode and/or Android Studio to build for each native platform.


### Installing

Install the project dependencies:

```
nom install
```

Run on iOS simulator:

```
react-native run-ios
```

Run on Android (emulator or attached device):

```
react-native run-android
```

## Running the Demo

The demo should automatically start and attempt to compute which numbers are prime. One list will be computed using Javascript; the other will call out to native code.
