export default class StorageService {

    async _getStorage() {
        let useSync = await this.getSyncSetting();
        if(useSync){
            return browser.storage.sync;
        } else {
            return browser.storage.local;
        }
    }

    async getComics(){
        return (await this._getStorage()).get('comics').then(
            results => results.comics || [],
            error => {
                console.error(error);
                throw error;
            }
        );
    }

    saveComic(title, url){
        if(!title || !url){
            throw new Error('Arguments are empty')
        }

        return this.getComics().then(comics => {
            let newComic = {title, url};

            //check if this comic already exists
            for (let i = 0; i < comics.length; i++){
                let comic = comics[i];
                if (comic.title === title) {
                    return this.getBookmarkSetting().then(saveBookmarks => {
                        if (!saveBookmarks) {
                            return;
                        }

                        // Check if a bookmark has been saved
                        if (!comic.bookmark) {
                            return browser.bookmarks.create(
                                {url,
                                title}
                            )
                        } else {
                            return browser.bookmarks.get(
                                    comic.bookmark
                                ).then(bookmark => browser.bookmarks.update(
                                    bookmark[0].id,
                                    {url, title}
                                    ),
                                    error => {
                                        // Bookmark has been deleted, create new one
                                        console.debug('Tried to update bookmark but couldnzt retrieve, creating new one:' + error)
                                        browser.bookmarks.create(
                                            {url,
                                            title}
                                        );
                                    }
                                ).catch(error => {
                                    console.error('Error updating bookmark', error);
                                })
                        }
                    
                    }).then(bookmark => {
                        if (bookmark) {
                            comic.bookmark = bookmark.id;
                        }
                        comic.url = url;
                        comics[i] = comic;
                        return comics;
                    });
                }
            }

            //...and if it doesn't...
            return this.getBookmarkSetting().then(saveBookmarks => {
                if(saveBookmarks) {
                    return browser.bookmarks.create(
                        {url,
                        title}
                    ).then(new_bookmark => {
                        newComic.bookmark = new_bookmark.id;
                        return newComic;
                    });
                } else {
                    return newComic;
                }
            }).then(newComic => {
                console.debug(comics);
                comics.push(newComic);            
                return comics;
            });

        }).then(async comics => {
            if (!comics) {
                throw new Error("Tried to save blank comics array");
            }
            (await this._getStorage()).set({comics})
        }
        );        
    }

    deleteComic(title){
        
        if(!title){
            throw new Error('Arguments are empty')
        }

        return this.getComics().then(comics => {

            if(!comics || !comics.length){
                throw new Error(`Tried to delete comic ${title} but no comics stored at all!`);
            }

            //check if this comic already exists
            for (let i = 0; i < comics.length; i++) {
                let comic = comics[i];
                if (comic.title === title) {
                    comics.splice(i, 1);;
                    return comics;
                }
            }

            //...and if it doesn't...
            throw new Error(`Tried to delete comic ${title} but no comic with that name!`);

        }).then(async comics => 
            (await this._getStorage()).set({comics})
        );
        
    }

    searchComicsByDomain(url){
        let domain = extractHostname(url);

        return this.getComics().then(
            comics => {
                return comics.filter(comic => extractHostname(comic.url) === domain);
            }
        )
    }

    getBookmarkSetting() {
        return browser.storage.local.get('save_bookmarks').then(
            results => results.save_bookmarks,
            error => {
                browser.storage.local.set({'save_bookmarks': false});
                console.log('Bookmark setting missing, defaulting to false');
            }
        );
    }

    getSyncSetting() {
        return browser.storage.local.get('use_sync').then(
            results => results.use_sync,
            error => {
                browser.storage.local.set({'use_sync': true});
                console.log('Bookmark setting missing, defaulting to true');
            }
        );
    }

}

function extractHostname(url) {
    //shamelessly copy and pasted from https://stackoverflow.com/a/23945027/8737631

    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}
