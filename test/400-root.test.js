let expect = require('chai').expect;
let fs = require('fs');
let jsonPatch = require('../index');

const DATA = [
    {
        modifyConfig: fs.readFileSync('test/files/400-root/401-add-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/400-root/401-add-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/400-root/401-add-expect.json', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/400-root/402-remove-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/400-root/402-remove-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/400-root/402-remove-expect.json', {encoding: 'utf8'}),
    },
];


describe('Object testing', () => {
    it('should add  object property into the roor', (done) => {
        let data = DATA[0];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });

    it('should remove property form the roor', (done) => {
        let data = DATA[1];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });
});