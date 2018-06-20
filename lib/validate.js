const Ajv = require('ajv');
const ajv = new Ajv();

const PatchJsonError = require('./exception').PatchJsonError;
const ERRORS = require('./exception').ERRORS;

// JSON Patch Schema
const schema = {
    "title": "JSON Patch command file description",
    "type": "object",
    "patternProperties": {
        "^.*$": {
            "type": "array",
            "minItems": 1,
            "items": {
                "anyOf": [
                    {
                        "type": "object",
                        "required": ["ACTION", "VALUE"],
                        "properties": {
                            "ACTION": {"const": "SET"},
                            "VALUE": {}
                        }
                    },
                    {
                        "type": "object",
                        "required": ["ACTION"],
                        "properties": {
                            "ACTION": {"const": "UNSET"}
                        }
                    },
                    {
                        "type": "object",
                        "required": ["ACTION", "VALUE"],
                        "properties": {
                            "ACTION": {"const": "PUSH"},
                            "VALUE": {}
                        }
                    },
                    {
                        "type": "object",
                        "required": ["ACTION", "VALUE"],
                        "properties": {
                            "ACTION": {"const": "UNSHIFT"},
                            "VALUE": {}
                        }
                    },
                    {
                        "type": "object",
                        "required": ["ACTION", "ITEM"],
                        "properties": {
                            "ACTION": {"const": "DELETE"},
                            "ITEM": {
                                "type": "string"
                            }
                        }
                    },
                    {
                        "type": "object",
                        "required": ["ACTION", "AFTER", "VALUE"],
                        "properties": {
                            "ACTION": {"const": "INSERT"},
                            "AFTER": {
                                "type": "string"
                            },
                            "VALUE": {}
                        }
                    },
                    {
                        "type": "object",
                        "required": ["ACTION", "BEFORE", "VALUE"],
                        "properties": {
                            "ACTION": {"const": "INSERT"},
                            "BEFORE": {
                                "type": "string"
                            },
                            "VALUE": {}
                        }
                    }
                ]
            }
        }
    }
};

const compiledValidate = ajv.compile(schema);

/**
 * Validate Patch YAML string
 * @param data {String}
 * @returns {Boolean}
 */
function validate(data) {
    let valid = compiledValidate(data);
    if (!valid) {
        throw new PatchJsonError(ERRORS.YAML_STRUCTURE_ERROR, {
            message: compiledValidate.errors
        });
    }
    return valid;
}

module.exports = validate;