const _ = require('lodash');
const jsonpath = require('jsonpath');
const yaml = require('js-yaml');
const validate = require('./validate');

const PatchJsonError = require('./exception').PatchJsonError;
const ERRORS = require('./exception').ERRORS;

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
    let configJson = null;
    let yamlPatch = null;

    // Parse Config String
    try {
        configJson = JSON.parse(jsonString);
    } catch (err) {
        throw new PatchJsonError(ERRORS.JSON_VALIDATION_ERROR, err);
    }

    // Parse YAML Patch
    try {
        yamlPatch = yaml.load(yamlPatchString);
    } catch (err) {
        throw new PatchJsonError(ERRORS.YAML_VALIDATION_ERROR, err)
    }

    try {
        validate(yamlPatch)
    } catch (err) {
        throw new PatchJsonError(ERRORS.YAML_STRUCTURE_ERROR, err)
    }

    try {
        jsonResult = executeActions(configJson, yamlPatch);
    } catch (err) {
        throw new PatchJsonError(ERRORS.PATCH_ERROR, err);
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
                case 'INSERT':
                    actionInsert(json, path, a);
                    break;
                case 'DELETE':
                    actionDelete(json, path, a);
                    break;
                default:
                    throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                        message: `Action ${a.ACTION} is unknown. Can't apply it to to ${path}`
                    });
            }
        }
    }
    return json;
}

function isJsonPath(path) {
    return (path[0] === '$');
}


/**
 * Process SET Action
 * @param json
 * @param path
 * @param a
 */
function actionSet(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (value) => {
            return a.VALUE;
        });
    } else {
        if (!_.isUndefined(a.VALUE)) {
            _.set(json, path, a.VALUE);
        } else {
            throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                message: `Can't apply SET action to ${path}. VALUE can't be undefined`
            });
        }
    }
}

/**
 * Process UNSET Action
 * @param json
 * @param path
 * @param a
 */
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

/**
 * Process PUSH Action
 * @param json
 * @param path
 * @param a
 */
function actionPush(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (value) => {
            if (_.isArray(value)) {
                value.push(a.VALUE);
                return value;
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't apply PUSH to non-array node ${path}`
                });
            }
        });
    } else {
        let target = _.get(json, path);
        if (_.isArray(target)) {
            if (!_.isUndefined(a.VALUE)) {
                target.push(a.VALUE);
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't apply PUSH action to ${path}. VALUE can't be undefined`
                });
            }
        } else {
            throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                message: `Can't apply PUSH to non-array node ${path}`
            });
        }
    }
}

/**
 * Process UNSHIFT Action
 * @param json
 * @param path
 * @param a
 */
function actionUnshift(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (value) => {
            if (_.isArray(value)) {
                value.unshift(a.VALUE);
                return value;
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't apply UNSHIFT to non-array node ${path}`
                });
            }
        });
    } else {
        let target = _.get(json, path);
        if (_.isArray(target)) {
            if (!_.isUndefined(a.VALUE)) {
                target.unshift(a.VALUE);
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't apply UNSHIFT action to ${path}. VALUE can't be undefined`
                });
            }
        } else {
            throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                message: `Can't apply UNSHIFT to non-array node ${path}`
            });
        }
    }
}

/**
 * Process INSERT Action
 * @param json
 * @param path
 * @param a
 */
function actionInsert(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (arr) => {
            if (_.isArray(arr)) {
                // Get node that used for BEFORE or AFTER
                let targetNode = null;
                let targetPath = a.BEFORE || a.AFTER;
                targetNode = jsonpath.query({root: arr}, '$.root' + targetPath);
                if (targetNode.length > 0) {
                    let targetIndex = _.findIndex(arr, targetNode[0]);
                    if (targetIndex > -1) {
                        targetIndex = (a.BEFORE) ? targetIndex : targetIndex + 1;
                        arr.splice(targetIndex, 0, a.VALUE);
                    } else {
                        throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                            message: `Can't INSERT item into to array ${path}`
                        });
                    }
                } else {
                    throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                        message: `Can't INSERT item into to array ${path}`
                    });
                }
                return arr;
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't apply INSERT to non-array node ${path}`
                });
            }
        });
    } else {
        let arr = _.get(json, path);
        if (_.isArray(arr)) {
            // Get node that used for BEFORE or AFTER
            let targetNode = null;
            let targetPath = a.BEFORE || a.AFTER;
            targetNode = jsonpath.query({root: arr}, '$.root' + targetPath);
            if (targetNode.length > 0) {
                let targetIndex = _.findIndex(arr, targetNode[0]);
                if (targetIndex > -1) {
                    targetIndex = (a.BEFORE) ? targetIndex : targetIndex + 1;
                    arr.splice(targetIndex, 0, a.VALUE);
                } else {
                    throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                        message: `Can't INSERT item into to array ${path}`
                    });
                }
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't INSERT item into to array ${path}`
                });
            }
        } else {
            throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                message: `Can't apply INSERT to non-array node ${path}`
            });
        }
    }
}

/**
 * Process DELETE Action
 * @param json
 * @param path
 * @param a
 */
function actionDelete(json, path, a) {
    if (isJsonPath(path)) {
        jsonpath.apply(json, path, (arr) => {
            if (_.isArray(arr)) {
                // Get node that used for BEFORE or AFTER
                let targetNode = null;
                let targetPath = a.ITEM;
                targetNode = jsonpath.query({root: arr}, '$.root' + targetPath);
                if (targetNode.length > 0) {
                    let targetIndex = _.findIndex(arr, targetNode[0]);
                    if (targetIndex > -1) {
                        arr.splice(targetIndex, 1);
                    } else {
                        throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                            message: `Can't DELETE item  ${targetPath} from array ${path}`
                        });
                    }
                } else {
                    throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                        message: `Can't DELETE item ${targetPath} from array ${path}`
                    });
                }
                return arr;
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't DELETE item from non-array node ${path}`
                });
            }
        });
    } else {
        let arr = _.get(json, path);
        if (_.isArray(arr)) {
            // Get ITEM node
            let targetNode = null;
            let targetPath = a.ITEM;
            targetNode = jsonpath.query({root: arr}, '$.root' + targetPath);
            if (targetNode.length > 0) {
                let targetIndex = _.findIndex(arr, targetNode[0]);
                if (targetIndex > -1) {
                    arr.splice(targetIndex, 1);
                } else {
                    throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                        message: `Can't DELETE item ${targetPath} from array ${path}`
                    });
                }
            } else {
                throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                    message: `Can't DELETE item ${targetPath} from array ${path}`
                });
            }
        } else {
            throw new PatchJsonError(ERRORS.PATCH_ERROR, {
                message: `Can't DELETE from non-array node ${path}`
            });
        }
    }
}


module.exports = patch;