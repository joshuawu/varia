export var assoc = function (object, key, value) {
    var result = Object.assign({}, object);
    result[key] = value;
    return result;
};
