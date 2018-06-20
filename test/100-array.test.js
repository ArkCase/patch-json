let expect = require('chai').expect;
let fs = require('fs');
let jsonPatch = require('../index');

const DATA = [
    {
        modifyConfig: fs.readFileSync('test/files/100-array/100-push-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/100-array/100-push-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/100-array/100-push-expect.json', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/100-array/101-unshift-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/100-array/101-unshift-patch.yaml', {encoding: 'utf8'}),
        expectConfig: fs.readFileSync('test/files/100-array/101-unshift-expect.json', {encoding: 'utf8'}),
    },
];


describe('Array testing', () => {
    it('should append new item at the end of array', (done) => {
        let data = DATA[0];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });

    it('should insert new item at the beginning of array', (done) => {
        let data = DATA[1];
        let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        expect(result).to.deep.equal(
            JSON.parse(data.expectConfig)
        );
        done();
    });
});