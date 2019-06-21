const request = require('request');

module.exports = {
    check (package) {
        return new Promise(function (resolve, reject) {
            try {
                const config = JSON.parse(package);

                this.validateConfigurations(config);

                const latest = this.getLatestVersion(config);

                resolve({
                    current: config.version,
                    latest: latest,
                    newest: latest == config.version,
                    download_link: `${config.repository.url}/releases/latest`
                });
            } catch (message) {
                reject(message);
            }
        });
    },

    proceed (name, package, proxy) {
        this.check(package)
            .then(result => {
                proxy.log({
                    name: name,
                    source: 'plugin',
                    type: 'success',
                    message: latest
                        ? `You have the latest version of ${name}.`
                        : `You have the version ${result.current} of ${name} and the latest version is ${result.latest}. Click <a href="${result.download_link}">here</a> to download the latest version.`
                });
            })
            .catch(error => {
                proxy.log({
                    name: name,
                    source: 'plugin',
                    type: 'error',
                    message: error
                });
            });
    },

    getLatestVersion (config) {
        request(this.getRequestOptions(config.repository), (error, response, body) => {
            if (error) {
                throw error;
            }

            return JSON.parse(body).tag_name;
        });
    },

    getRequestOptions (repository) {
        const endpoint = repository.url.replace(
            /https?:\/\/github.com/,
            'https://api.github.com/repos'
        );

        return {
            method: 'GET',
            uri: `${endpoint}/releases/latest`,
            headers: {
                'User-Agent': 'SW Exporter',
            },
        };
    },

    validateConfigurations (config) {
        if (! config.version) {
            throw 'Current version not found in the configuration file.';
        }

        if (! config.repository) {
            throw 'Repository informations not found in the configuration file.';
        }

        if (config.repository.type != 'git') {
            throw 'Repository type is not yet supported.';
        }

        if (! config.repository.url) {
            throw 'Repository url not found in the configuration file.';
        }
    }
};
