import StorageService from "../resources/js/services/storage.js";


describe("Storage Service",function(){
    let storageMock = {
        get: function(key) {
            if(key === "comics") {
                return new Promise(resolve => resolve(
                    {comics:[
                        {title:'Example Comic', url:'example.com'},
                        {title:'Another Comic', url:'example2.com'}
                    ]}
                ));
            } else if (key === "bookmarks") {
                return Promise.resolve(true);
            } else {
                return new Promise(resolve => resolve({}));
            } 
        },
    
        set: function(obj){
    
        }
    };
    
    let bookmarksMock = {
        get: function(bookmarkId) {
            return new Promise(resolve => resolve(
                [{id: 1}]
            ));
        },
        create:function(newBookmark){
    
            return new Promise(resolve => resolve(
            {id: 1}
            ));
            
        },
        update: function(bookmarkId, newBookmark) {
            return new Promise(resolve => resolve(
                [{id: 1}]
            ));
        }
    };

    beforeEach(function(){        
        
        window.browser = {
            storage: {local: storageMock},
            bookmarks: bookmarksMock
        };
    })

    it("should retrieve all values when 'getComics' called", () => {
        const storageService = new StorageService();
        storageService.getComics().then(comics => {
            expect(comics).toContain({title:'Example Comic', url:'example.com'});            
        });
        
    });

    it("should add a value when 'saveComic' called with new title", () => {
        const storageService = new StorageService();

        let setSpy = spyOn(storageMock, 'set');
        storageService.saveComic("New Comic", "zombo.com").then(comics => {
            let expectedObj = {comics:[
                {title:'Example Comic', url:'example.com'},
                {title:'Another Comic', url:'example2.com'},
                {title:'New Comic', url:'zombo.com'},
            ]};
            expect(setSpy).toHaveBeenCalledWith(expectedObj)
        });
        
    });

    it("should replace a value when 'saveComic' called with existing title", done => {
        const storageService = new StorageService();

        let setSpy = spyOn(storageMock, 'set');
        storageService.saveComic("Example Comic", "example.com/comic2.html").then(comics => {
            const expectedObj = {comics:[
                {title:'Example Comic', url:'example.com/comic2.html', bookmark: 1},
                {title:'Another Comic', url:'example2.com'},
            ]};
            expect(setSpy).toHaveBeenCalledWith(expectedObj);
            done();
        });
        
    });

    it("should update the bookmark when 'saveComic' called with existing title", done => {
        const storageService = new StorageService();

        let bookmarkGetSpy = spyOn(bookmarksMock, 'get').and.returnValue(
            new Promise(resolve => resolve(
                [{id: 1}]
            ))
        );
        let bookmarkUpdateSpy = spyOn(bookmarksMock, 'update').and.returnValue(
            Promise.resolve([{id: 1}])
        );

        browser.storage.local.get = function(key){
                return new Promise(resolve => resolve(
                    {comics:[
                        {title:'Example Comic', url:'example.com', bookmark: 1},
                        {title:'Another Comic', url:'example2.com', bookmark: 2}
                    ]}
            ));
        }

        storageService.saveComic("Example Comic", "example.com/comic2.html").then(comics => {
            expect(bookmarkGetSpy).toHaveBeenCalled();
            expect(bookmarkUpdateSpy).toHaveBeenCalled();
            done();
        });
        
    });

    it("should create a bookmark when 'saveComic' called with existing title, " +
            "but no bookmark exists yet", done => {
        const storageService = new StorageService();

        let storageGetSpy = spyOn(storageMock, 'get').and.returnValue(
            Promise.resolve({comics:[
                {title:'Example Comic', url:'example.com'},
                {title:'Another Comic', url:'example2.com'}
            ]})
        );

        let bookmarkGetSpy = spyOn(bookmarksMock, 'get');
        let bookmarkCreateSpy = spyOn(bookmarksMock, 'create').and.returnValue(
            Promise.resolve({id: 1})
        );

        storageService.saveComic("Example Comic", "example.com/comic2.html").then(comics => {
            expect(bookmarkGetSpy).not.toHaveBeenCalled();
            expect(bookmarkCreateSpy).toHaveBeenCalled();
            done();

        });
        
    });

    // Delete comics

    it("should remove a value when 'deleteComic' called with existing title", () => {
        const storageService = new StorageService();

        let setSpy = spyOn(storageMock, 'set');
        storageService.deleteComic("Example Comic").then(comics => {
            let expectedObj = {comics:[
                {title:'Another Comic', url:'example2.com'}
            ]};
            expect(setSpy).toHaveBeenCalledWith(expectedObj)
        });
        
    });

    it("should throw an error when 'deleteComic' is called with non-existent title", done => {
        const storageService = new StorageService();
        
        storageService.deleteComic('not a real comic').then(() => 
            fail('Didn\'t throw error')
        ).catch(() => done());        
        
    });

    it("should return relevant comics when searching by url", () => {
        const storageService = new StorageService();

        
        storageService.searchComicsByDomain('example.com/page1').then(found => {
            expect(found).toContain({title:'Example Comic', url:'example.com'});
            expect(found.length).toBe(1);
        });
        
    });

    it("should not return pages on a different subdomain", () => {
        const storageService = new StorageService();
        
        storageService.searchComicsByDomain('other.example.com/page1').then(found => {
            expect(found.length).toBe(0);
        });
        
    });
});
