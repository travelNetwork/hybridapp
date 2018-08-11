# Nowmad Hybrid App

<img src="https://github.com/nowmad-io/hybridapp/blob/master/assets/images/logos/logo.png" align="right" title="Nowmad logo by Julien Rougeron and Shandra Menendez" width="120" height="120">
     
> Source of [nowmad.io](https://nowmad.io) mobile app

Nowmad is a mobile app to share your best travel experiences with your friends.

## Installation

* `npm install`
* `react-native link`

## Android

### Start Developing
Start an android simulator or plug your phone and run `react-native run-android`

### Signing
#### Debug

* To sign the app for debug, get the SHA1 of the debug.keystore
`keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`.
See here for more info [https://developers.google.com/maps/documentation/android-api/signup#release-cert](https://developers.google.com/maps/documentation/android-api/signup#release-cert)

* Then add it to the credention of your project in the console [https://console.developers.google.com/apis/credentials](https://console.developers.google.com/apis/credentials)

#### Release

* [Signed Apk Android](https://facebook.github.io/react-native/docs/signed-apk-android.html)
* [Safer Passwords In Gradle](https://pilloxa.gitlab.io/posts/safer-passwords-in-gradle/)

### Build

* `cd android`
* `./gradlew assembleRelease`
* Find the apk in `app/build/output/apk`

Try the release version first
* `react-native run-android --variant=release`

### Miscellaneous

* Activate port forwarding to use localhost on your android device: [chrome://inspect/#devices](chrome://inspect/#devices)
* Unknown plugin module-resolver or x.match is not a function -> [https://github.com/airbnb/react-native-maps/issues/795#issuecomment-294302935](https://github.com/airbnb/react-native-maps/issues/795#issuecomment-294302935)
* Install react-native-maps IOS [https://gist.github.com/heron2014/e60fa003e9b117ce80d56bb1d5bfe9e0](https://gist.github.com/heron2014/e60fa003e9b117ce80d56bb1d5bfe9e0)

---

## IOs

### Start Developing

Run `react-native run-ios` to start an Iphone simulator and run the app

### Miscellaneous

`Print: Entry, ":CFBundleIdentifier", Does Not Exist`
Probably du to last react-native version. Check for more info https://github.com/facebook/react-native/issues/7308

## Meta

Julien Rougeron – [Portoflio](https://julienr2.github.io) – julien.rougeron@gmail.com

Distributed under the MIT license. See ``LICENSE`` for more information.

[https://github.com/julienr2/](https://github.com/julienr2/)
