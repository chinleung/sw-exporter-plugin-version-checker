# SWEX Plugin Version Checker

This plugin will allow you to receive a notification on your proxy machine when a run has finished.

## Requirements

Your plugin must have a `package.json` which contains the `version` and the `repository` field.

```json
{
    "name": "swex-plugin",
    "version": "1.0.0",
    "repository": {
        "type": "git",
        "url": "https://github.com/your-username/your-plugin-name"
    }
}
```

## Installation

You can run the following command to install it in your SWEX plugin:

```console
npm install --save chinleung/sw-exporter-plugin-version-checker
```

## Quickstart

You can require the version checker in your plugin:

```js
const versionChecker = require('sw-exporter-plugin-version-checker');
```

And then in the `init` function of your plugin, you can decide when to trigger the scan for update. For example:

```js
init (proxy, config) {
    if (config.Config.Plugins[this.pluginName].enabled) {
        versionChecker.proceed({
            name: this.pluginName,
            config: require('./package.json'),
            proxy: proxy,
        });
    }
},
```

The `proceed` method will check for an update and automatically output the result in the log of SWEX.

### Default Messages

If the installed version is up-to-date:

> You have the latest version v1.0.0.

If the installed version is not the latest:

> Your current version is v1.0.0 and the latest version is v1.0.1. Click here to download the latest version.

Where `here` is a link to the repository's latest released version on Github.

## Customization

If you want to customize the actions to perform after the check, you can use the `check` command which returns a `Promise`:

```js
init (proxy, config) {
    if (config.Config.Plugins[this.pluginName].enabled) {
        versionChecker.check(require('./package.json'))
            .then(result => {})
            .catch(error => {});
    }
},
```

### Result Object

| Property      | Value                                                               | Type    | Description                                  |
|---------------|---------------------------------------------------------------------|---------|----------------------------------------------|
| current       | 1.0.0                                                               | String  | The currently installed version.             |
| download_link | https://github.com/your-username/your-plugin-name/releases/latest   | String  | The link to download the latest version.     |
| latest        | true                                                                | Boolean | True if the installed version is the latest. |
| newest        | 1.0.1                                                               | String  | The latest version available on Github.      |
