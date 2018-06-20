const ERRORS = {
    JSON_VALIDATION_ERROR: 'JSON_VALIDATION_ERROR',
    YAML_VALIDATION_ERROR: 'YAML_VALIDATION_ERROR',
    YAML_STRUCTURE_ERROR: 'YAML_STRUCTURE_ERROR',
    PATCH_ERROR: 'PATCH_ERROR',
};

function PatchJsonError(name, error) {
    Error.call(this);
    Error.captureStackTrace(this);
    this.name = name;
    this.message = error.message;
    this.stack = error.stack;
}

PatchJsonError.prototype.__proto__ = Error.prototype;
module.exports = {
    PatchJsonError: PatchJsonError,
    ERRORS: ERRORS
};