const request = require('request');

module.exports = {
    check (config) {
        return new Promise((resolve, reject) => {
            try {
                this.validateConfigurations(config);

                request(
                    this.getRequestOptions(config.repository),
                    (error, response, body) => {
                        if (error) {
                            throw error;
                        }

                        const latest = JSON.parse(body).tag_name.replace(/[^0-9.]/g, '');

                        resolve({
                            current: config.version,
                            latest: latest,
                            newest: latest == config.version,
                            download_link: `${config.repository.url}/releases/latest`
                        });
                    }
                );
            } catch (message) {
                reject(message);
            }
        });
    },

    proceed (options) {
        if (! options || ! options.config || ! options.proxy) {
            return;
        }

        this.check(options.config)
            .then(result => {
                options.proxy.log({
                    name: options.name,
                    source: 'plugin',
                    type: result.latest ? 'success' : 'info',
                    message: result.latest
                        ? `You have the latest version v${result.current}.`
                        : `Your current version is v${result.current} and the latest version is v${result.newest}. Click <a href="${result.download_link}">here</a> to download the latest version.`
                });
            })
            .catch(error => {
                options.proxy.log({
                    name: options.name,
                    source: 'plugin',
                    type: 'error',
                    message: error
                });
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
