/**
 * Create list item for UI
 * @param {string} url 
 * @returns List item container
 */
function createItem(url) {
    const container = document.createElement('div');
    container.className = 'panel-list-item';

    const item = document.createElement('div');
    item.className = 'text';
    item.textContent = url;

    container.appendChild(item);
    return container;
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

    if (event != null) {
        selectedListItem = event.target;
        while (!selectedListItem.classList.contains('panel-list-item') && selectedListItem.id != 'url-list') {
            selectedListItem = selectedListItem.parentNode;
        }

        if (selectedListItem.id == 'url-list') {
            selectedListItem = null;
            return;
        }
    }

    const previouslySelected = document.querySelector('.panel-list-item.selected');

    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }
    
    if (previouslySelected != selectedListItem) {
        selectedListItem.classList.add('selected');
    } else {
        selectedListItem = null;
    }

    UI.button.main.delete.disabled = (selectedListItem == null);
}

/**
 * Delete selected website from list
 */
function deleteWebsite() {
    if (selectedListItem == null) {
        return;
    }

    selectedListItem.remove();
    UI.button.main.delete.disabled = true;
    websites.splice(findWebsite(selectedListItem), 1);
    selectedListItem = null;

    saveToStorage();
    updateListSize();
    clearSearch();
}

/**
 * Find list item in array data
 * @param {HTMLElement} item 
 * @returns Index in array
 */
function findWebsite(item) {
    const url = item.textContent.trim();
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
    selectWebsite(null);
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
        toggleRestoreButton();
        UI.dialog.backup.classList.remove('hidden');
    } else {
        UI.dialog.backup.classList.add('hidden');
    }

    dialogOpen = open;
    selectWebsite(null);
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

    console.log(selectedListItem);
    if (enable && selectedListItem == null) {
        UI.button.main.delete.disabled = true;
    }
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
        UI.error.add.textContent = 'Invalid website URL';
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
            UI.error.add.textContent = 'This website is already blocked';
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
            text = 'example.com or test.example.com';
            break;
        case 'subdomain':
            text = 'example.com';
            break;
        case 'page':
            text = 'example.com/page';
            break;
        case 'custom':
            text = 'Custom URL Pattern';
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
    const data = await browser.storage.sync.get();
    const file = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const fileURL = URL.createObjectURL(file);

    browser.downloads.download({
        filename: `website-blocker-backup-${Date.now()}.json`,
        saveAs: true,
        url: fileURL
    });
}

/**
 * Load filter list from backup file
 */
async function restoreBackup() {
    UI.error.backup.textContent = '';

    if (UI.field.backup.file.files.length != 1) {
        UI.error.backup.textContent = 'Cannot load multiple files';
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
    const data = JSON.parse(event.target.result);

    if (!data.urlList) {
        UI.error.backup.textContent = 'Invalid file';
    } else if (data.urlList.length < 1) {
        UI.error.backup.textContent = 'File contains no data';
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
    toggleRestoreButton();

    saveToStorage();
    updateListSize();
}

/**
 * Enable/disable the restore from backup button
 */
function toggleRestoreButton() {
    UI.button.backup.upload.disabled = (UI.field.backup.file.files.length != 1);
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

    if (selectedListItem != null) {
        const selected = document.querySelector('.panel-list-item.selected');
        if (selected == null || selected.classList.contains('hidden')) {
            selectWebsite(null);
        }
    }
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

const UI = {
    field: {
        add: {
            url: document.getElementById('add-url'),
            mode: document.getElementById('add-mode')
        },
        backup: {
            file: document.getElementById('backup-file'),
            overwrite: document.getElementById('backup-overwrite')
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
        backup: {
            download: document.getElementById('backup-download'),
            upload: document.getElementById('backup-upload'),
            cancel: document.getElementById('backup-finish')
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
        backup: document.getElementById('dialog-backup')
    },
    list: document.getElementById('url-list')
};

let selectedListItem = null;
let websites = new Array();
let dialogOpen = false;
UI.field.search.value = '';
checkPrivateBrowsing();
loadFromStorage();

UI.list.addEventListener('click', selectWebsite);
UI.button.main.delete.addEventListener('click', deleteWebsite);
UI.button.main.add.addEventListener('click', () => { openAddDialog(true) });
UI.button.add.cancel.addEventListener('click', () => { openAddDialog(false) });
UI.button.main.backup.addEventListener('click', () => { openBackupDialog(true) });
UI.button.backup.cancel.addEventListener('click', () => { openBackupDialog(false) });
UI.button.add.submit.addEventListener('click', addWebsite);
UI.field.add.mode.addEventListener('change', updatePlaceholder);
UI.button.backup.download.addEventListener('click', downloadBackup);
UI.button.backup.upload.addEventListener('click', restoreBackup);
UI.field.backup.file.addEventListener('change', toggleRestoreButton);
UI.field.search.addEventListener('keyup', search);
UI.button.add.help.addEventListener('click', openHelp);