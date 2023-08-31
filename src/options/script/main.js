/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Create list item for UI
 * @param {string} url 
 * @returns List item container
 */
function createItem(url) {
    const item = document.getElementById('template-rule').content.cloneNode(true).children[0];
    item.dataset.for = url;
    item.getElementsByClassName('text')[0].textContent = url;
    return item;
}

/**
 * Completely reload website list
 * (Overwrites existing list)
 * @param {Array} list 
 */
function reloadWebsites(list) {
    websites = new Array();

    for (const url of list) {
        websites.push(new Website(url));
    }

    websites.sort(compareWebsite);

    for (const website of websites) {
        const item = createItem(website.url);
        UI.list.appendChild(item);
    }

    updateListSize();
}

/**
 * Compare two websites
 * -1 if website is higher on list
 * +1 if website is lower on list
 * 0 if websites are equal
 * @param {Website} a 
 * @param {Website} b 
 * @returns Sort order
 */
function compareWebsite(a, b) {
    if (a.domain == b.domain) {
        if (a.subdomain == b.subdomain) {
            return a.path.localeCompare(b.path);
        } else {
            return a.subdomain.localeCompare(b.subdomain);
        }
    } else {
        return a.domain.localeCompare(b.domain);
    }
}

/**
 * Mark website as selected
 * @param {DocumentEvent} event 
 */
function selectWebsite(event) {
    if (dialogOpen) {
        return;
    }

    let listItem = event.target;
    const isCheckbox = event.target.classList.contains('checkbox');

    while (!listItem.classList.contains('panel-list-item')) {
        listItem = listItem.parentNode;
    }

    if (!isCheckbox) {
        const checkbox = listItem.getElementsByClassName('checkbox')[0];
        checkbox.checked = !checkbox.checked;
    }

    UI.button.main.delete.disabled = (getSelectedWebsites().length < 1);
}

/**
 * Get list of selected list items
 * @returns Selected list items
 */
function getSelectedWebsites() {
    const selected = [];

    for (const c of UI.list.getElementsByClassName('checkbox')) {
        if (c.checked) {
            let parent = c;
            while (!parent.classList.contains('panel-list-item')) {
                parent = parent.parentElement;
            }
            selected.push(parent);
        }
    }

    return selected;
}

/**
 * Update list of blocked websites that will be removed
 */
function updateDeleteWebsiteList() {
    const selected = getSelectedWebsites();
    UI.field.delete.list.textContent = '';

    for (const s of selected) {
        const item = document.createElement('li');
        item.textContent = s.textContent;
        UI.field.delete.list.appendChild(item);
    }
}

/**
 * Delete selected websites from list
 */
function deleteWebsite() {
    const selected = getSelectedWebsites();

    if (selected.length < 1) {
        return;
    }

    for (const item of selected) {
        websites.splice(findWebsite(item.dataset.for), 1);
        item.remove();
    }

    UI.button.main.delete.disabled = true;

    saveToStorage();
    updateListSize();
    clearSearch();
    openDeleteDialog(false);
}

/**
 * Find URL index in array data
 * @param {String} url
 * @returns Index in array
 */
function findWebsite(url) {
    let index = 0;

    for (const website of websites) {
        if (website.url == url) {
            return index;
        }
        index++;
    }

    return -1;
}

/**
 * Open/close add dialog
 * @param {boolean} open 
 */
function openAddDialog(open) {
    if (open) {
        UI.field.add.url.value = '';
        UI.error.add.textContent = '';
        updatePlaceholder();
        UI.dialog.add.classList.remove('hidden');
    } else {
        UI.dialog.add.classList.add('hidden');
    }

    dialogOpen = open;
    enableAllButtons(!open);
}

/**
 * Open/close delete dialog
 * @param {boolean} open 
 */
function openDeleteDialog(open) {
    if (open) {
        updateDeleteWebsiteList();
        UI.dialog.delete.classList.remove('hidden');
    } else {
        UI.dialog.delete.classList.add('hidden');
    }

    dialogOpen = open;
    enableAllButtons(!open);
}

/**
 * Open/close backup dialog
 * @param {boolean} open 
 */
function openBackupDialog(open) {
    if (open) {
        UI.error.backup.textContent = '';
        UI.field.backup.file.value = '';
        UI.field.backup.overwrite.checked = false;
        updateRestoreSection();
        UI.dialog.backup.classList.remove('hidden');
    } else {
        UI.dialog.backup.classList.add('hidden');
    }

    dialogOpen = open;
    enableAllButtons(!open);
}

/**
 * Enable/disable all main buttons
 * @param {boolean} enable 
 */
function enableAllButtons(enable) {
    for (const button of Object.values(UI.button.main)) {
        button.disabled = !enable;
    }

    for (const checkbox of UI.list.getElementsByClassName('checkbox')) {
        checkbox.disabled = !enable;
    }

    UI.button.main.delete.disabled = (!enable || getSelectedWebsites().length < 1);
}

/**
 * Add new website from user input
 */
function addWebsite() {
    UI.error.add.textContent = '';
    let filter = UI.field.add.url.value.trim();
    const mode = UI.field.add.mode.value;

    // Strip protocol
    let url = '*://';
    if (filter.indexOf('://') >= 0) {
        filter = filter.slice(filter.indexOf('://') + 3);
    }

    // Check if URL is empty
    if (filter.length < 1) {
        UI.error.add.textContent = browser.i18n.getMessage('errorInvalidUrl');
        return;
    }

    // Generate URL string
    switch (mode) {
        case 'domain':
            url += filter + '/*';
            break;
        case 'subdomain':
            url += '*.' + filter + '/*';
            break;
        case 'page':
            url += filter + '*';
            break;
        case 'custom':
            url = UI.field.add.url.value.trim();
            break;
    }

    if (insertWebsite(url)) {
        saveToStorage();
        updateListSize();
        openAddDialog(false);
        clearSearch();
    }
}

/**
 * Insert website into list
 * @param {string} url 
 */
function insertWebsite(url) {
    const item = createItem(url);
    const website = new Website(url);
    let index = 0;

    for (const w of websites) {
        if (compareWebsite(website, w) > 0) {
            ++index;
        } else if (compareWebsite(website, w) == 0) {
            UI.error.add.textContent = browser.i18n.getMessage('errorAlreadyBlocked');
            return false;
        } else {
            break;
        }
    }

    websites.splice(index, 0, website);
    UI.list.insertBefore(item, UI.list.childNodes[index]);
    return true;
}

/**
 * Update the add URL input box placeholder based on mode
 */
function updatePlaceholder() {
    const mode = UI.field.add.mode.value;
    let text = '';

    switch (mode) {
        case 'domain':
            text = browser.i18n.getMessage('addModeDomainPlaceholder');
            break;
        case 'subdomain':
            text = browser.i18n.getMessage('addModeSubdomainPlaceholder');
            break;
        case 'page':
            text = browser.i18n.getMessage('addModePagePlaceholder');
            break;
        case 'custom':
            text = browser.i18n.getMessage('addModeCustomPlaceholder');
            break;
    }

    UI.field.add.url.placeholder = text;
}

/**
 * Save filter list to Storage API
 */
function saveToStorage() {
    const list = new Array();

    for (const website of websites) {
        list.push(website.url);
    }

    browser.storage.sync.set({
        urlList: list
    });
}

/**
 * Load filter list from Storage API
 */
async function loadFromStorage() {
    const data = await browser.storage.sync.get();
    reloadWebsites(data.urlList);

    if (typeof data.showError == 'boolean') {
        document.settings.showError.value = (data.showError) ? 'yes' : 'no';
    } else {
        document.settings.showError.value = 'yes';
    }
}

/**
 * Show empty list message (if necessary)
 */
function updateListSize() {
    if (websites.length > 0) {
        UI.list.parentNode.classList.remove('hidden');
        UI.error.list.parentNode.classList.add('hidden');
        UI.field.search.disabled = false;
    } else {
        UI.list.parentNode.classList.add('hidden');
        UI.error.list.parentNode.classList.remove('hidden');
        UI.field.search.disabled = true;
        UI.field.search.textContent = '';
    }
}

/**
 * Convert Storage API data to downloaded file
 */
async function downloadBackup() {
    UI.error.backup.textContent = '';

    if (await browser.permissions.request({
            permissions: ['downloads']
        })) {
        const data = await browser.storage.sync.get();
        const file = new Blob([JSON.stringify(data)], {
            type: 'application/json'
        });
        const fileURL = URL.createObjectURL(file);

        browser.downloads.download({
            filename: `website-blocker-backup-${Date.now()}.json`,
            saveAs: true,
            url: fileURL
        });
    } else {
        UI.error.backup.textContent = browser.i18n.getMessage('errorExportPermission');
    }
}

/**
 * Load filter list from backup file
 */
async function restoreBackup() {
    UI.error.backup.textContent = '';

    if (UI.field.backup.file.files.length != 1) {
        UI.error.backup.textContent = browser.i18n.getMessage('errorImportMultiple');
        return false;
    }

    const file = UI.field.backup.file.files[0];
    const reader = new FileReader();

    reader.onload = processBackupFile;
    reader.readAsText(file);
}

/**
 * Parse data from backup file
 * @param {FileReaderEvent} event 
 */
function processBackupFile(event) {
    let data = null;
    try {
        data = JSON.parse(event.target.result);
    } catch (error) {
        UI.error.backup.textContent = browser.i18n.getMessage('errorImportInvalidFile');
        return;
    }

    if (data == null || !data.urlList) {
        UI.error.backup.textContent = browser.i18n.getMessage('errorImportInvalidFile');
        return;
    } else if (data.urlList.length < 1) {
        UI.error.backup.textContent = browser.i18n.getMessage('errorImportFileNoData');
        return;
    }

    if (UI.field.backup.overwrite.checked) {
        websites = new Array();
        UI.list.textContent = '';
        reloadWebsites(data.urlList);
    } else {
        for (const url of data.urlList) {
            insertWebsite(url);
        }
    }

    UI.field.backup.file.value = '';
    UI.field.backup.overwrite.checked = false;
    updateRestoreSection();
    openBackupDialog(false);

    saveToStorage();
    updateListSize();
}

/**
 * Enable/disable the restore from backup button
 */
function updateRestoreSection() {
    UI.button.backup.upload.disabled = (UI.field.backup.file.files.length != 1);
    const browserButtonText = UI.button.backup.browse.getElementsByTagName('span')[0];

    if (UI.field.backup.file.files.length == 1) {
        UI.field.backup.filename.textContent = UI.field.backup.file.files[0].name;
        browserButtonText.textContent = browser.i18n.getMessage('importChangeFile');
    } else {
        UI.field.backup.filename.textContent = browser.i18n.getMessage('importNoFile');
        browserButtonText.textContent = browser.i18n.getMessage('importSelectFile');
    }
}

/**
 * Hide list items based on user search
 */
function search() {
    const searchTerm = UI.field.search.value.trim();
    const items = UI.list.childNodes;
    let found = false;

    for (const item of items) {
        if (item.textContent.search(searchTerm) > -1) {
            found = true;
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    }

    toggleSearchMessage(found);
}

/**
 * Show/hide message if no items match the search criteria
 * @param {boolean} found 
 */
function toggleSearchMessage(found) {
    if (websites.length == 0) {
        UI.error.search.parentNode.classList.add('hidden');
    } else if (found) {
        UI.list.parentNode.classList.remove('hidden');
        UI.error.search.parentNode.classList.add('hidden');
    } else {
        UI.list.parentNode.classList.add('hidden');
        UI.error.search.parentNode.classList.remove('hidden');
    }
}

/**
 * Clear previous search criteria
 */
function clearSearch() {
    UI.field.search.value = '';

    for (const item of UI.list.childNodes) {
        item.classList.remove('hidden');
    }

    toggleSearchMessage(true);
}

/**
 * Open help wiki on GitHub
 */
function openHelp() {
    window.open('https://github.com/WesleyBranton/Website-Blocker/wiki/Blocking-websites');
}

/**
 * Toggle the Private Browsing add-on warning
 * @async
 */
async function checkPrivateBrowsing() {
    const isAllowed = await browser.extension.isAllowedIncognitoAccess();
    const banner = document.getElementById('private-browsing-warning');

    if (!isAllowed) banner.classList.remove('hidden');
}

/**
 * Save advanced settings to Storage API
 */
function saveSettings() {
    browser.storage.sync.set({
        showError: (document.settings.showError.value == 'yes') ? true : false
    });
}

/**
 * Open feedback window
 */
function openFeedback() {
    browser.runtime.sendMessage({
        command: 'feedback',
        target: 'background'
    });
}

const UI = {
    field: {
        add: {
            url: document.getElementById('add-url'),
            mode: document.getElementById('add-mode')
        },
        delete: {
            list: document.getElementById('delete-list')
        },
        backup: {
            file: document.getElementById('backup-file'),
            overwrite: document.getElementById('backup-overwrite'),
            filename: document.getElementById('backup-filename')
        },
        search: document.getElementById('search')
    },
    button: {
        main: {
            add: document.getElementById('button-add'),
            delete: document.getElementById('button-delete'),
            backup: document.getElementById('button-backup')
        },
        add: {
            submit: document.getElementById('add-finish'),
            cancel: document.getElementById('add-cancel'),
            help: document.getElementById('add-help')
        },
        delete: {
            submit: document.getElementById('delete-finish'),
            cancel: document.getElementById('delete-cancel')
        },
        backup: {
            download: document.getElementById('backup-download'),
            upload: document.getElementById('backup-upload'),
            cancel: document.getElementById('backup-finish'),
            browse: document.getElementById('backup-browse')
        }
    },
    error: {
        add: document.getElementById('error-add'),
        backup: document.getElementById('error-backup'),
        list: document.getElementById('url-list-empty'),
        search: document.getElementById('url-list-notfound')
    },
    dialog: {
        add: document.getElementById('dialog-add'),
        delete: document.getElementById('dialog-delete'),
        backup: document.getElementById('dialog-backup')
    },
    list: document.getElementById('url-list')
};

let selectedListItem = null;
let websites = new Array();
let dialogOpen = false;
UI.field.search.value = '';
UI.field.search.placeholder = browser.i18n.getMessage('actionSearch');
document.title = browser.i18n.getMessage('optionsTitle', browser.i18n.getMessage('extensionName'));
i18nParse();
checkPrivateBrowsing();
loadFromStorage();

UI.list.addEventListener('click', selectWebsite);
UI.button.main.delete.addEventListener('click', () => {
    openDeleteDialog(true);
});
UI.button.delete.cancel.addEventListener('click', () => {
    openDeleteDialog(false);
});
UI.button.main.add.addEventListener('click', () => {
    openAddDialog(true)
});
UI.button.add.cancel.addEventListener('click', () => {
    openAddDialog(false)
});
UI.button.main.backup.addEventListener('click', () => {
    openBackupDialog(true)
});
UI.button.backup.cancel.addEventListener('click', () => {
    openBackupDialog(false)
});
UI.button.add.submit.addEventListener('click', addWebsite);
UI.field.add.mode.addEventListener('change', updatePlaceholder);
UI.button.delete.submit.addEventListener('click', deleteWebsite);
UI.button.backup.download.addEventListener('click', downloadBackup);
UI.button.backup.upload.addEventListener('click', restoreBackup);
UI.field.backup.file.addEventListener('change', updateRestoreSection);
UI.field.search.addEventListener('keyup', search);
UI.button.add.help.addEventListener('click', openHelp);
UI.button.backup.browse.addEventListener('click', () => {
    UI.field.backup.file.click();
});
document.getElementById('feedbacklink').addEventListener('click', openFeedback);
document.settings.addEventListener('change', saveSettings);
