/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
/* eslint-disable-next-line import/no-extraneous-dependencies */
const rimraf = require('rimraf');

const root = path.resolve(__dirname, '..');

const reactNativeConfig = path.join(root, './node_modules/react-native-config/android/build.gradle');
const reactNativeFetchBlob = path.join(root, './node_modules/react-native-fetch-blob/android/build.gradle');
const reactNativeSentry = path.join(root, './node_modules/react-native-sentry/android/build.gradle');
const buildVersion = '25.0.0';

// Update Build Tool of projects with a too low version
function updateBuildTool(p) {
  fs.readFile(p, 'utf8', (err, contents) => {
    const newContents = contents.replace(/(buildToolsVersion ["|'])(.*)(["|'])/g, `$1${buildVersion}$3`);

    fs.writeFileSync(p, newContents);
  });
}

updateBuildTool(reactNativeConfig);
updateBuildTool(reactNativeFetchBlob);
updateBuildTool(reactNativeSentry);

// workaround for the error: "However the module `MaterialIcons` could not be
// found within the package"
const reactNativeFixtures = path.join(root, './node_modules/react-native/local-cli/core/__fixtures__/files/package.json');
rimraf(reactNativeFixtures, {}, (err) => {
  if (err) {
    console.log('Error while deleting', err);
  }
});
