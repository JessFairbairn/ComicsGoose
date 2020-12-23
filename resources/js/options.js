//Page Setup
// const storageService = new StorageService();
browser.storage.local.get(['save_bookmarks', 'use_sync']).then(results => {
    const save_bookmarks_checkbox = document.getElementById('save-bookmarks-checkbox');
    const use_sync_checkbox = document.getElementById('use-sync-checkbox');

    save_bookmarks_checkbox.onclick = bookmarks_toggle_callback;
    save_bookmarks_checkbox.checked = results.save_bookmarks;

    use_sync_checkbox.onclick = sync_toggle_callback;
    use_sync_checkbox.checked = results.use_sync;

});




function bookmarks_toggle_callback(event) {
    const checked = event.target.checked;
    console.debug('Setting "save bookmark" setting to ' + checked);

    browser.permissions.request({
        permissions: ['bookmarks']
    }).then(response =>{
        if (response){
            browser.storage.local.set({'save_bookmarks': checked});
        } else {
            console.warn('User declined bookmark permission');
            event.target.checked = false;
        }
    });
}

function sync_toggle_callback(event) {
    const checked = event.target.checked;
    console.debug('Setting "sync" setting to ' + checked);

    // browser.permissions.request({
    //     permissions: ['bookmarks']
    // }).then(response =>{
    //     if (response){
    //         browser.storage.local.set({'save_bookmarks': checked});
    //     } else {
    //         console.warn('User declined bookmark permission');
    //         event.target.checked = false;
    //     }
    // });
    browser.storage.local.set({'use_sync': checked});
}