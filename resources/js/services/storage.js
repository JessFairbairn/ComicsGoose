class StorageService {
    getComics(){
        return browser.storage.local.get('comics').then(
            results => results.comics            
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
            for(let i = 0; i < comics.length; i++){
                let comic = comics[i];
                if(comic.title === title){
                    comics[i] = newComic;
                    return comics;
                }
            }

            //...and if it doesn't...
            comics.push(newComic);            
            return comics

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
}