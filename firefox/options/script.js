// Load settings
async function restore() {
	var list = document.getElementById('url-list');
	let data = await browser.storage.sync.get();
	urlData = data.urlList;
	for (i = 0; i < data.urlList.length; i++) {
		createItem(data.urlList[i]);
	}
}

// Save settings
function save() {
	browser.storage.sync.set({urlList:urlData});
}

// Add item
function addItem(url) {
	createItem(url);
	save();
}

// Create item GUI
function createItem(url) {
	var list = document.getElementById('url-list');
	
	// Create item container
	var container = document.createElement('div');
	container.className = 'list-item';
	
	// Create item text label
	var label = document.createElement('span');
	label.textContent = url;
	
	// Create item delete button
	var btnDelete = document.createElement('button');
	btnDelete.textContent = '\u00D7';
	
	// Merge items
	container.appendChild(label);
	container.appendChild(btnDelete);
	list.appendChild(container);
}

// Remove item
function removeItem(item) {
	save();
}

var urlData;
// Run when page loads
window.onload = function(){
	restore();
};