//Page Setup
// const storageService = new StorageService();
browser.storage.local.get('save_bookmarks').then(results => {
    const save_bookmarks_checkbox = document.getElementById('save-bookmarks-checkbox');

    save_bookmarks_checkbox.onclick = bookmarks_toggle_callback;
    save_bookmarks_checkbox.checked = results.save_bookmarks;

});




function bookmarks_toggle_callback(event) {
    const checked = event.target.checked;
    console.debug('Setting "save bookmark" setting to ' + checked);
    browser.storage.local.set({'save_bookmarks': checked});
}
