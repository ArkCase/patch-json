const Ajv = require('ajv');
const ajv = new Ajv();

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
        console.error(ajv.errors);
    }
    return valid;
}

module.exports = validate;