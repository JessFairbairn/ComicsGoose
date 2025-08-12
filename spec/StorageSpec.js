import StorageService from "../resources/js/services/storage.js";


describe("Storage Service", function(){

    class StorageMock {
        get(key) {
            if(key === "comics") {
                return new Promise(resolve => resolve(
                    {comics:[
                        {title:'Example Comic', url:'example.com'},
                        {title:'Another Comic', url:'example2.com'}
                    ]}
                ));
            } else if (key === "save_bookmarks") {
                return Promise.resolve({save_bookmarks: true});
            } else if (key === "use_sync") {
                return Promise.resolve({use_sync: false});
            } else {
                return new Promise(resolve => resolve({}));
            } 
        }
    
        set(obj){
            return Promise.resolve();
        }
    };
    
    const bookmarksMock = {
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
        
        
        if (typeof window === "undefined") {
            var window = {};
        }
        global.browser = {
            storage: {local: new StorageMock(), sync: new StorageMock()},
            bookmarks: bookmarksMock
        };
        
        global.crypto = {randomUUID: () => "fakeId"}
    });

    it("should retrieve all values when 'getComics' called", () => {
        const storageService = new StorageService();
        storageService.getComics().then(comics => {
            expect(comics).toContain({title:'Example Comic', url:'example.com'});            
        });
        
    });

    it("should add a value when 'saveComic' called with new title", async () => {
        const storageService = new StorageService();
        global.crypto = {randomUUID: () => 'fakeId'};

        let setSpy = spyOn(browser.storage.local, 'set');
        await storageService.saveComic("New Comic", "zombo.com").then(async () => {
            let expectedObj = {comics:[
                {title:'Example Comic', url:'example.com'},
                {title:'Another Comic', url:'example2.com'},
                {title:'New Comic', url:'zombo.com', uuid:'fakeId', bookmark: 1},
            ]};
            expect(setSpy).toHaveBeenCalledOnceWith(expectedObj);
            
        });
        
    });

    it("should replace a value when 'saveComic' called with existing title", async () => {
        const storageService = new StorageService();
        global.crypto = {randomUUID: () => 'fakeId'};
        let getSpy = spyOn(browser.storage.local, 'get').and.returnValue(Promise.resolve({
            comics:[
                {
                    title:'Example Comic',
                    url:'example.com/comic1.html',
                    bookmark: 1,
                    uuid:'fakeId'
                },
                {
                    title:'Another Comic', url:'example2.com'
                },
            ]}));
        let setSpy = spyOn(browser.storage.local, 'set');
        await storageService.saveComic("Example Comic", "example.com/comic2.html").then(async () => {
            const expectedObj = {
                comics:[
                    {
                        title:'Example Comic',
                        url:'example.com/comic2.html',
                        bookmark: 1,
                        uuid:'fakeId'
                    },
                    {
                        title:'Another Comic', url:'example2.com'
                    },
                ]};
            expect(setSpy).toHaveBeenCalledWith(expectedObj);
        });
        
    });



    it("should create a bookmark when 'saveComic' called with existing title, " +
            "but no bookmark exists yet", done => {
        const storageService = new StorageService();

        let storageGetSpy = spyOn(browser.storage.local, 'get').withArgs('comics').and.returnValue(
            Promise.resolve({comics:[
                {title:'Example Comic', url:'example.com'},
                {title:'Another Comic', url:'example2.com'}
            ]})
        ).withArgs("save_bookmarks").and.returnValue(Promise.resolve({save_bookmarks:true}))
        .withArgs("use_sync").and.returnValue(Promise.resolve({use_sync:false}));

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

        let setSpy = spyOn(browser.storage.local, 'set');
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

    it("should return a bool indicating if anything is saved in sync", async () => {
        const storageService = new StorageService();
        let getSpy = spyOn(browser.storage.sync, 'get').and.returnValue(
            Promise.resolve({comics:undefined}))
            ;
        let result = await storageService.doesSyncHasData()
        expect(result).toBeFalse();
        expect(getSpy).toHaveBeenCalled();
    });

    it("adds missing UUIDs on upgrade", async () => {
        const storageService = new StorageService();
        global.crypto = {randomUUID: () => 'fakeId'};
        let getSpy = spyOn(browser.storage.local, 'get').and.returnValue(Promise.resolve({
            comics:[
                {
                    title:'Example Comic',
                    url:'example.com/comic1.html',
                    bookmark: 1
                },
                {
                    title:'Another Comic', url:'example2.com'
                },
            ]}));
        let setSpy = spyOn(browser.storage.local, 'set');
        await storageService.addMissingUUIDs();

        expect(setSpy).toHaveBeenCalled()
    });

    it("should merge storage correctly", async () => {
        const storageService = new StorageService();
        let localGetSpy = spyOn(browser.storage.local, 'get').and.returnValue(
            Promise.resolve(
                {comics:[
                    {title:'Example Comic', url:'example.com'},
                    {title:'Another Comic', url:'example2.com'},
                ]}
            ));
        let syncGetSpy = spyOn(browser.storage.sync, 'get').and.returnValue(
            Promise.resolve(
                {comics:[
                    {title:'Silly Comic', url:'example3.com'},
                ]}
            ));

        let setSpy = spyOn(browser.storage.sync, 'set')

        await storageService.mergeLocalIntoSync()

        // expect(getSpy).toHaveBeenCalled();
        
        let expectedMerge = [
            
            {title:'Silly Comic', url:'example3.com'},
            {title:'Example Comic', url:'example.com'},
            {title:'Another Comic', url:'example2.com'},
        ];

        expect(setSpy).toHaveBeenCalledWith("comics", expectedMerge);
    });
});