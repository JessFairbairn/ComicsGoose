// import options from "../resources/js/options.js"

describe("Sync option", function () {
    beforeEach(function(){});

    it("should move local storage to sync if sync empty", () =>{
        options.storageService = {};
        options.sync_toggle_callback({target:{checked:true}});
    });

    it("should warn then merge if sync has content", () => {

    });
});