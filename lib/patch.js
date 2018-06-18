const _ = require('lodash');
const jsonpath = require('jsonpath');
const yaml = require('js-yaml');
const validate = require('./validate');

/**
 *
 * Apply patch
 *
 * @param jsonString
 * @param yamlPatch
 * @returns jsonResult
 */
function patch(jsonString, yamlPatchString) {
    let jsonResult = null;

    // Parse Config String
    let configJson = JSON.parse(jsonString);


    // Parse YAML Patch
    let yamlPatch = yaml.load(yamlPatchString);

    if (validate(yamlPatch)) {
        jsonResult = executeActions(configJson, yamlPatch);
    }


    return jsonResult;
}

/**
 * Execute actions
 * @param jsonParam
 * @param yamlPatch
 * @returns {*}
 */
function executeActions(jsonParam, yamlPatch) {
    let json = _.cloneDeep(jsonParam);

    for (let path in yamlPatch) {
        let actions = yamlPatch[path];
        for (let a of actions) {
            switch (a.ACTION) {
                case 'SET':
                    actionSet(json, path, a);
                    break;
                case 'UNSET':
                    actionUnset(json, path, a);
                    break;
                case 'PUSH':
                    actionPush(json, path, a);
                    break;
                case 'UNSHIFT':
                    actionUnshift(json, path, a);
                    break;
                default:
                    console.error(`Action ${a.action} is unknown. Can't apply it to to ${path}`);
            }
        }
    }
    return json;
}

function isJsonPath(path) {
    return (path[0] === '$');
}

function actionSet(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (value) => {
            return a.VALUE;
        });
    } else {
        if (!_.isUndefined(a.VALUE)) {
            _.set(json, path, a.VALUE);
        } else {
            console.error(`Can't apply SET action to ${path}. VALUE can't be undefined`);
        }
    }
}

function actionUnset(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (value) => {
            return undefined;
        });
        // JsonPath doesn't allow to remove node, that's why we replace node by undefined and
        cleanUndefined(json);
    } else {
        _.unset(json, path);
    }
}

/**
 * Remove all undefined elements form object
 * @param obj
 */
function cleanUndefined(obj) {
    if (_.isArray(obj)) {
        let removed = [];
        for (let i = 0; i < obj.length; i++) {
            if (_.isArray(obj[i]) || _.isObject(obj[i])) {
                cleanUndefined(obj[i]);
            } else if (_.isUndefined(obj[i])) {
                removed.push(i);
            }
        }
        // Remove undefined elements starting from the end
        if (removed.length > 0) {
            for (let i = removed.length - 1; i >= 0; i--) {
                obj.splice(removed[i], 1);
            }
        }
    } else if (_.isObject(obj)) {
        for (let k in obj) {
            if (_.isArray(obj[k]) || _.isObject(obj[k])) {
                cleanUndefined(obj[k])
            } else if (_.isUndefined(obj[k])) {
                delete obj[k];
            }
        }
    }
}

function actionPush(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (value) => {
            if (_.isArray(value)) {
                value.push(a.VALUE);
                return value;
            }
        });
    } else {
        let target = _.get(json, path);
        if (_.isArray(target)) {
            if (!_.isUndefined(a.VALUE)) {
                target.push(a.VALUE);
            } else {
                console.error(`Can't apply PUSH action to ${path}. VALUE can't be undefined`);
            }
        } else {
            console.error(`Can't apply PUSH to non-array node ${path}`);
        }
    }
}

function actionUnshift(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (value) => {
            if (_.isArray(value)) {
                value.unshift(a.VALUE);
                return value;
            }
        });
    } else {
        let target = _.get(json, path);
        if (_.isArray(target)) {
            if (!_.isUndefined(a.VALUE)) {
                target.unshift(a.VALUE);
            } else {
                console.error(`Can't apply UNSHIFT action to ${path}. VALUE can't be undefined`);
            }
        } else {
            console.error(`Can't apply UNSHIFT to non-array node ${path}`);
        }
    }
}

module.exports = patch;