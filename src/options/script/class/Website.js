/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

class Website {

    constructor(url) {
        this.domain = '';
        this.subdomain = '';
        this.path = '';
        this.url = url;
        url = url.substring(url.indexOf('//') + 2, url.length);

        if (url.indexOf('/') >= 0) {
            this.path = url.substring(url.indexOf('/') + 1, url.length);
            url = url.substring(0, url.indexOf('/'));
        }

        let parts = url.split('.');
        this.domain = parts[parts.length - 2] + '.' + parts[parts.length - 1];

        if (parts.length > 2) {
            this.subdomain = '';
            for (let i = 0; i < parts.length - 2; i++) {
                this.subdomain += parts[i] + '.';
            }
            this.subdomain = this.subdomain.substring(0, this.subdomain.length - 1);
        }
    }
}
