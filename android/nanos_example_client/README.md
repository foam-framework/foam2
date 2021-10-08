# Building

1. Install the android SDK either via Android Studio or the command line tools:

https://developer.android.com/studio/index.html#downloads

2. Install gradle.

https://gradle.org/

3. Build foam.

From the foam3 directory
```
$ cd build
$ sh gen.sh
$ mvn package
```

4. Copy foam jar to libs directory

```
$ cp foam3/build/outputs/foam-1.0-SNAPSHOT.jar libs
```

5. Add a file local.properties that points to your SDK

`android/nanos_example_client/local.properties`

```
sdk.dir=/home/adam/Android/Sdk
```

5. Build with gradle

```
$ gradle build
```

# Running

The demo is hard coded to connect to localhost:8080 so you need to run nanos locally and forward the port using adb

$ adb reverse tcp:8080 tcp:8080
