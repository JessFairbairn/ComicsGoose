class StorageService {

    getComics(){
        return browser.storage.local.get('comics').then(
            results => results.comics || []
        );
    }

    saveComic(title, url){
        if(!title || !url){
            throw new Error('Arguments are empty')
        }

        return browser.storage.local.get('comics').then(
            results => results.comics
        ).then(comics =>{
            let newComic = {title, url};

            if(!comics){
                comics = [];
            }

            //check if this comic already exists
            for (let i = 0; i < comics.length; i++){
                let comic = comics[i];
                if (comic.title === title) {
                    let bookmarkPromise;
                    if (!comic.bookmark) {
                        bookmarkPromise = browser.bookmarks.create(
                            {url,
                            title}
                        )
                    } else {
                        bookmarkPromise = browser.bookmarks.get(
                                comic.bookmark
                            ).then(bookmark => browser.bookmarks.update(
                                bookmark[0].id,
                                {url, title}
                                )
                            )
                    }

                    return bookmarkPromise.then(bookmark => {
                        comic.bookmark = bookmark.id;
                        return comics
                    })
                }
            }

            //...and if it doesn't...
            browser.bookmarks.create(
                {url,
                title}
            ).then(
                new_bookmark => newComic.bookmark = new_bookmark.id
            )
            comics.push(newComic);            
            return Promise.resolve(comics)

        }).then(comics => 
            browser.storage.local.set({comics})
        );        
    }

    deleteComic(title){
        
        if(!title){
            throw new Error('Arguments are empty')
        }

        return browser.storage.local.get('comics').then(
            results => results.comics
        ).then(comics => {


            if(!comics || !comics.length){
                throw new Error(`Tried to delete comic ${title} but no comics stored at all!`);
            }

            //check if this comic already exists
            for(let i = 0; i < comics.length; i++){
                let comic = comics[i];
                if(comic.title === title){
                    comics.splice(i, 1);;
                    return comics;
                }
            }

            //...and if it doesn't...
            throw new Error(`Tried to delete comic ${title} but no comic with that name!`);

        }).then(comics => 
            browser.storage.local.set({comics})
        );
        
    }

    searchComicsByDomain(url){
        let domain = extractHostname(url);

        return browser.storage.local.get('comics').then(
            results => {
                if(!results.comics){
                    return [];
                }
                return results.comics.filter(comic => extractHostname(comic.url) === domain);
            }
        )
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