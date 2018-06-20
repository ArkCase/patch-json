let expect = require('chai').expect;
let fs = require('fs');
let jsonPatch = require('../index');

const DATA = [
    {
        modifyConfig: fs.readFileSync('test/files/300-errors/301-json-invalid-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/300-errors/301-json-invalid-patch.yaml', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/300-errors/302-yaml-invalid-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/300-errors/302-yaml-invalid-patch.yaml', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/300-errors/303-yaml-invalid-structure-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/300-errors/303-yaml-invalid-structure-patch.yaml', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/300-errors/304-patch-push-error-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/300-errors/304-patch-push-error-patch.yaml', {encoding: 'utf8'}),
    },
    {
        modifyConfig: fs.readFileSync('test/files/300-errors/305-patch-unshift-error-config.json', {encoding: 'utf8'}),
        modifyPatch: fs.readFileSync('test/files/300-errors/305-patch-unshift-error-patch.yaml', {encoding: 'utf8'}),
    },
];

describe('Test errors handling', () => {
    it('should get JSON validation error', (done) => {
        let data = DATA[0];
        try {
            let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        }catch (err) {
            expect(err.name).to.equal('JSON_VALIDATION_ERROR');
            done();
        }
    });

    it('should get YAML validation error', (done) => {
        let data = DATA[1];
        try {
            let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        } catch(err) {
            expect(err.name).to.equal('YAML_VALIDATION_ERROR');
            done();
        }
    });

    it('should get YAML structure error', (done) => {
        let data = DATA[2];
        try {
            let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        } catch(err) {
            expect(err.name).to.equal('YAML_STRUCTURE_ERROR');
            done();
        }
    });

    it('should get YAML structure PUSH error', (done) => {
        let data = DATA[3];
        try {
            let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        } catch(err) {
            expect(err.name).to.equal('PATCH_ERROR');
            done();
        }
    });

    it('should get YAML structure UNSHIFT error', (done) => {
        let data = DATA[4];
        try {
            let result = jsonPatch.patch(data.modifyConfig, data.modifyPatch);
        } catch(err) {
            expect(err.name).to.equal('PATCH_ERROR');
            done();
        }
    });
});