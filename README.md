# [CDKit][cdkit-github]: UI Tests Automation

[![Build Status][travis-badge]][travis-url]
[![Quality Gate Status][sonarcloud-status-badge]][sonarcloud-url]
[![Security Rating][sonarcloud-security-badge]][sonarcloud-url]
[![Maintainability Rating][sonarcloud-maintainability-badge]][sonarcloud-url]

[![Bugs][sonarcloud-bugs-badge]][sonarcloud-url]
[![Code Smells][sonarcloud-codesmells-badge]][sonarcloud-url]
[![Coverage][sonarcloud-coverage-badge]][sonarcloud-url]
[![Duplicated Lines (%)][sonarcloud-duplicated-badge]][sonarcloud-url]

*[CDKit][cdkit-github] is a DevOps framework that helps to deploy mobile apps (iOS and Android) to the app stores (iTunes and Google Play).*

This tool is a set of scripts to launch an Appium Server instance and run UI tests on iOS simulators and Genymotion Android emulators.

This project is based on the [Appcelerator Appium tests repository][appcelerator-appium-tests-github] that is not maintained since 2017.

I still have a [PR to fix the launch of Genymotion][appcelerator-appium-tests-pr] :)

## Caveats

- This has been tested on macOS only (for now)
- Windows 10 Mobile is experimental
- Install VirtualBox and Genymotion with **default** settings for macOS and Windows
- Xcode should be installed on macOS
- Appc CLI should be installed

## Setup

1. Make sure you have node >= 10 and npm >= 6.
2. In this directory, run `npm install`.
3. Next, install `appium-doctor`: `[sudo] npm install -g appium-doctor`.
4. Run `appium-doctor` to ensure your machine is properly setup for appium testing.

## Flag Usage

- `node cli.js --app com.company.app`
  - Run all tests in the `ui-tests/com.company.app` directory.
- `node cli.js --app com.company.app --suites <suites>`
  - Run only the specified test suites e.g.

  ```bash
  node cli.js --app com.company.app --suites screenshots/ios.js -> run only the iOS `screenshots` test suite

  node cli.js --app com.company.app --suites screenshots/ios.js,screenshots/android.js -> run both the iOS and Android `screenshots` test suites.
  ```

- `node cli.js --app com.company.app --suites <suites> --use-sdk <ti_sdk>`
  - Before running the specified test suites, rebuild the test app with the specified `ti_sdk`.
  - This probably won't be useful if you are running this on your local machine. But, will be useful in a CI/CD build.
- `node cli.js --app com.company.app --suites <suites> --more-logs`
  - Run the specified test suites with logs enabled; this can become very noisy.
- Below is the complete list of flags:

  ```bash
  Options:

    -h, --help             output usage information
    --app <bundleID>       app bundleId (needs to be present in the /ui-tests/<bundleId> folder)
    --platform <platform>  run all tests with the specified platform (ios or android)
    --suites <suites>      comma-delimited string of valid test suites; otherwise, run all tests
    --use-sdk <ti_sdk>     build all test apps with the specified Titanium SDK
    --more-logs            enables more logging; this becomes very noisy
  ```

## How to Write Tests

### 1. Test Suite Structure

All test suites live in the `ui-tests` directory and should have the following folder structure:

```bash
ui-tests/
|--- app/
  |--- suite_name/
    |--- test_app/
    |--- platform.js
    |--- platform2.js
...
```

**Info:**

- `app` should be the bundle ID/app ID of your app e.g. `com.company.app`.
- `suite_name` should be an API supported by Titanium SDK or Hyperloop e.g. `screenshots`.
- `test_app` should be a Titanium Classic, Alloy, or Hyperloop enabled project.
- `platform.js` is a mocha file that will execute test cases (via Appium) in the `test_app` on the designated mobile platform.
- It's important that the `platform.js` file name is a valid platform (`ios.js` or `android.js`), since it tells this tool which mobile platform to use when: installing the `test_app` and running the tests.

### 2. config.js

The `config.js` file (which lives at the root of your app project) contains information about all the test suites and which Appium server to connect to.

High-level notes:

```javascript
module.exports = {
  ios: {

    // these are properties straight from appium and more are defined here:
    // https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/default-capabilities-arg.md
    desiredCapabilities: {
      automationName: 'XCUITest' // leave as-is for ios
    },

      // the suite_name folder should exist in the 'ui-tests/com.company.app' directory
      suite_name: {
        proj: 'SAMPLE', // name of the 'test_app'

      // list of simulators you want the test app to run against
      testDevices: [
        {
          deviceName: 'iPhone Xr', // the simulator created in xcode
          platformVersion: '13.0' // the platform version associated with the simulator
        },
        ...
      ]
    },

    suite_name2: { ... }
    ...
  },

  android: {
    desiredCapabilities: {
      automationName: 'Appium' // leave as-is for android
    },
    suite_name: {
      proj: 'SAMPLE',

      // these two properties are needed when testing against android
      appPackage: 'com.company.app',
      appActivity: '.SomeActivity',

      // list of genymotion emulators you want the test app to run against
      testDevices: [
      {
          deviceName: 'Google Pixel 3', // the genymotion emulator created in the genymotion app
          platformVersion: '9.0' // the platform version associated with the emulator
      },
        ...
      ]
    }
  }

  // other platforms can be added in the future
};
```

### 3. Mocha Files

To write the Appium test cases, you will need to be familiar with mocha and Promises. Look [here][qe-appium-master] for examples.

Couple notes about those examples vs these test suites:

- The `driver` and `webdriver` property is exposed to the test suite through the `global` variable.
- The `global` variable contains `curDevice` property. This has information about the current running device (`name`) and which version (`ver`).
- You don't need a setup or teardown phase like [here][qe-appium-master-ios-test].

## Main Loop

`cli.js` is the entry point file and contains the main loop, which does the following:

1. `runAppium()` - launches the local Appium server.
2. `buildTestApps()` - if `--use-sdk` flag is passed, then build all the test apps before moving onto the next task.
3. `createTests()` - create a data structure from `--suites` and loop through the data structure. While looping:
4. `launchGeny()` - if the test app needs to be tested on an Android platform, launch the designated Genymotion emulator first. iOS simulators will be launched in the next step by Appium.
5. `startClient()` - after the simulator/genymotion is launched, install the test app to the device and connect to the Appium local server.
6. `new Mocha().addFile().run()` - run the associated mocha test suite.
7. `stopClient()` - after a mocha test suite is finished running, disconnect the mobile device from the Appium local server. Depending on the `desiredCapabilities`, iOS simulators can be left running or killed.
8. `quitGeny()` - if a Genymotion emulator is launched, gracefully kill the process.
9. `killAppium()` - after all the test suites are executed, kill the Appium local server.

[cdkit-github]: https://github.com/timoa/cdkit
[sonarcloud]: https://sonarcloud.io/about
[travis-badge]: https://travis-ci.com/timoa/cdkit.ui.automation.svg?branch=master
[travis-url]: https://travis-ci.com/timoa/cdkit.ui.automation
[sonarcloud-url]: https://sonarcloud.io/dashboard?id=timoa_cdkit.ui.automation
[sonarcloud-status-badge]: https://sonarcloud.io/api/project_badges/measure?project=timoa_cdkit.ui.automation&metric=alert_status
[sonarcloud-security-badge]: https://sonarcloud.io/api/project_badges/measure?project=timoa_cdkit.ui.automation&metric=security_rating
[sonarcloud-maintainability-badge]: https://sonarcloud.io/api/project_badges/measure?project=timoa_cdkit.ui.automation&metric=sqale_rating
[sonarcloud-bugs-badge]: https://sonarcloud.io/api/project_badges/measure?project=timoa_cdkit.ui.automation&metric=bugs
[sonarcloud-codesmells-badge]: https://sonarcloud.io/api/project_badges/measure?project=timoa_cdkit.ui.automation&metric=code_smells
[sonarcloud-coverage-badge]: https://sonarcloud.io/api/project_badges/measure?project=timoa_cdkit.ui.automation&metric=coverage
[sonarcloud-duplicated-badge]: https://sonarcloud.io/api/project_badges/measure?project=timoa_cdkit.ui.automation&metric=duplicated_lines_density
[appcelerator-appium-tests-github]: https://github.com/appcelerator/appium-tests
[appcelerator-appium-tests-pr]: https://github.com/appcelerator/appium-tests/pull/4
[qe-appium-master]: https://github.com/appcelerator/qe-appium/tree/master/test
[qe-appium-master-ios-test]: https://github.com/appcelerator/qe-appium/blob/master/test/ks_ios_test.js#L9-L39
