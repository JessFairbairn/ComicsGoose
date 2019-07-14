class BookmarkService{
    saveBookmark(title, url){
        return browser.bookmarks.create({
            title,
            url
        }).then(bookmark => {
            return bookmark.id;
        });
    }
}