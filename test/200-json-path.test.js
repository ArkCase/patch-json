let expect = require('chai').expect;
let fs = require('fs');
let jsonPatch = require('../index');

const DATA = [
    {
        modifyConfig: fs.readFileSync('test/files/200-json-path/200-components-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/200-json-path/200-components-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/200-json-path/200-components-expect.json', {encoding: 'utf8'}),
    }
];

describe('JSON Path Query testing', () => {
    it('should make update of components', (done) => {
        let data = DATA[0];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });
});