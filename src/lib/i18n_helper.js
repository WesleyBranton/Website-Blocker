/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

function i18nParse() {
    const elements = document.querySelectorAll('[data-i18n]');
    for (const e of elements) {
        const placeholders = [];

        if (e.dataset.i18nPlaceholders) {
            for (const placeholder of e.dataset.i18nPlaceholders.split(',')) {
                placeholders.push(
                    browser.i18n.getMessage(placeholder.trim())
                );
            }
        }

        e.textContent = browser.i18n.getMessage(e.dataset.i18n, placeholders);
    }
}