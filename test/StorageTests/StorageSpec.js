
describe("Storage Service",function(){
    let storageMock = {
        get:function(key){
            if(key !== "comics"){
                return new Promise(resolve => resolve({}));
            }
            return new Promise(resolve => resolve(
                {comics:[
                    {title:'Example Comic', url:'example.com'},
                    {title:'Another Comic', url:'example2.com'}
                ]}
            ));
        },

        set: function(obj){

        }
    };

    beforeEach(function(){        

        browser = {storage:{local:storageMock}};
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

    it("should replace a value when 'saveComic' called with existing title", () => {
        const storageService = new StorageService();

        let setSpy = spyOn(storageMock, 'set');
        storageService.saveComic("Example Comic", "example.com/comic2.html").then(comics => {
            let expectedObj = {comics:[
                {title:'Example Comic', url:'example.com/comic2.html'},
                {title:'Another Comic', url:'example2.com'},
            ]};
            expect(setSpy).toHaveBeenCalledWith(expectedObj)
        });
        
    });

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

    it("should throw an error when 'deleteComic' is called with non-existant title", done => {
        const storageService = new StorageService();

        let setSpy = spyOn(storageMock, 'set');
        
        storageService.deleteComic('not a real comic').then(() => 
            fail('Didn\'t throw error')
        ).catch(done);        
        
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