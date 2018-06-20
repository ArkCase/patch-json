let expect = require('chai').expect;
let fs = require('fs');
let jsonPatch = require('../index');

const DATA = [
    {
        modifyConfig: fs.readFileSync('test/files/000-object/00-modify-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/000-object/00-modify-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/000-object/00-modify-expect.json', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/000-object/01-add-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/000-object/01-add-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/000-object/01-add-expect.json', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/000-object/02-remove-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/000-object/02-remove-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/000-object/02-remove-expect.json', {encoding: 'utf8'}),
    },
];


describe('Object testing', () => {
    it('should modify object property', (done) => {
        let data = DATA[0];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });

    it('should add property the object', (done) => {
        let data = DATA[1];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });

    it('should remove property from object', (done) => {
        let data = DATA[2];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });
});