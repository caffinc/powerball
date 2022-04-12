# Powerball

Did you buy a bluetooth Gyroscopic PowerBall from AliExpress or some other similar website? Did 
it come with a funky QR code on one side, and no other instructions? Did you spend a lot of time 
searching what to do and discover that you need to use WeChat to actually use the BT functionality 
of your PowerBall? Do you not want to use WeChat but still want to use the BT features? This is 
the repo for you!

The code here basically reverse engineers the BT protocol used by the PowerBall and displays 
everything the WeChat app probably does, without the data privacy violations.

## Usage

Create the Android build directory
```
yarn install
expo run:android
```

Create the APK
```
cd android
./gradlew build
```

Install the apk on your android device
```
cd app/build/outputs/apk/release/
adb install app-release.apk
```

## Note
1. If you have an issues with getting this to work for you, please reach out via a PR.

2. Sometimes Android doesn't pop up a request for BT permissions, in which case you will have to grant Bluetooth (and/or Location) permissions manually.

3. I have not tested this on iOS, so YMMV. Let me know if you got it to successfully work on iOS.

