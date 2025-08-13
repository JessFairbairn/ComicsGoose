import StorageService from "./services/storage.js";

//Page Setup
const storageService = new StorageService();
browser.storage.local.get(['save_bookmarks', 'use_sync']).then(results => {
    const save_bookmarks_checkbox = document.getElementById('save-bookmarks-checkbox');
    const use_sync_checkbox = document.getElementById('use-sync-checkbox');

    save_bookmarks_checkbox.onclick = bookmarks_toggle_callback;
    save_bookmarks_checkbox.checked = results.save_bookmarks;

    use_sync_checkbox.onclick = sync_toggle_callback;
    use_sync_checkbox.checked = results.use_sync;

});




export function bookmarks_toggle_callback(event) {
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

export async function sync_toggle_callback(event) {
    const newSetting = event.target.checked;
    console.debug('Setting "sync" setting to ' + newSetting);

    let syncHasData = await storageService.doesSyncHasData();
    
    await browser.storage.local.set({'use_sync': newSetting});
    if (newSetting === true) {
        if (!syncHasData) {
            await storageService.copyLocalToSyncStorage();
        } else {
            // How do we handle this without the risk of overriding remote saved stuff
            await storageService.mergeLocalIntoSync();
        }
    } else {
        console.warn("Turning off not implemented yet lol")
    }
}