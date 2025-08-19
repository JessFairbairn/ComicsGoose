import NameService from "../resources/js/services/name.js";
describe("Name Service",function(){
    'use strict';

    it("should return comic name when a simple name entered", () => {
        const nameService = new NameService();

        const testCases = [
            {input: 'Blah horse', output: 'Blah horse'},
            {input: 'Skin Horse » 2012-03-01', output: 'Skin Horse'},
            {input: 'Comic - Issue', output: 'Comic'},
        ];
        
        for (let testCase of testCases) {
            let output = nameService.generateComicName(testCase.input);

            expect(output).toBe(testCase.output);
        };
        
    });
});