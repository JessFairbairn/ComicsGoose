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
    

    beforeEach(function(){        
        
        
        if (typeof window === "undefined") {
            var window = {};
        }
        globalThis.browser = {
            storage: {local: new StorageMock(), sync: new StorageMock()},
            bookmarks: bookmarksMock
        };
        
        // Object.defineProperty(globalThis, "crypto", {
        //     value: { randomUUID: () => "fakeId" },
        //     configurable: true
        // });
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

    it("should upload comics if none exist on activation", () => fail("Test not implemented"))
    it("should merge up comics on local update", () => fail("Test not implemented"));
    it("should merge comics with same domain if no UUID", () => fail("Test not implemented"));
    it("should ignore comics with same domain if server copy has UUID", () => fail("Test not implemented"));
    it("should ignore comics with same domain if server local has UUID", () => fail("Test not implemented"));
});