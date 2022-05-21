'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var BigNumber = require('bignumber.js');
var BigNumber__default = _interopDefault(BigNumber);

var EIP681NamedParameters = ["value", "gas", "gasLimit", "gasPrice"];
var parse681 = function parse681(uri) {
  var sixeightyone = new RegExp(REGEX.regex_681);
  var data = uri.match(sixeightyone);
  if (!data) return;
  var query = data.groups.query ? data.groups.query.slice(1).split("&") : [];
  var result = {
    scheme: "ethereum",
    prefix: "pay",
    target_address: data.groups.address,
    chain_id: data.groups.chain_id,
    function_name: data.groups.function_name
  };
  if (query) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = query[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var queryEntry = _step.value;

        var variable_and_value = queryEntry.split("=");
        if (variable_and_value.length != 2) throw new Error("Query Parameter Malformat (" + queryEntry + ")");
        var variable = variable_and_value.at(0);
        var value = processEIP681Value(variable, variable_and_value.at(1));
        if (EIP681NamedParameters.includes(variable)) {
          if (!result.parameters) result.parameters = {};
          result.parameters[variable] = value;
          continue;
        }
        if (!result.function_name) throw new Error("Missing function_name");
        if (!result.args) result.args = [];
        result.args.push([variable, value]);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = Object.keys(result)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      if (result[key] === void 0) delete result[key];
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return result;
};
function processEIP681Value(variable, value) {
  var isReserved = EIP681NamedParameters.includes(variable);
  var isNumber = REGEX.number_regex.test(value);
  if (isReserved && !isNumber) throw new Error(variable + " needs to be a number");
  if (isNumber) {
    var match = value.match(REGEX.number_regex).groups;
    value = new BigNumber__default("" + match.major + (match.minor ? "." + match.minor : "") + (match.exponent ? "e+" + match.exponent : ""), 10).toString();
  }
  return value;
}

var EIP2400NamedParameters = ["method", "events"];
var parse2400 = function parse2400(uri) {
  var sixeightyone = new RegExp(REGEX.regex_2400);
  var data = uri.match(sixeightyone);
  if (!data) return;
  var query = data.groups.query ? data.groups.query.slice(1).split("&") : [];
  var result = {
    scheme: "ethereum",
    prefix: "tx",
    transaction_hash: data.groups.address,
    chain_id: data.groups.chain_id
  };
  if (query) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = query[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var queryEntry = _step.value;

        var variable_and_value = queryEntry.split("=");
        if (variable_and_value.length != 2) throw new Error("Query Parameter Malformat (" + queryEntry + ")");
        var variable = variable_and_value.at(0);
        var value = variable_and_value.at(1);
        if (EIP2400NamedParameters.includes(variable)) {
          if (!result.parameters) result.parameters = {};
          result.parameters[variable] = decodeURIComponent(value);
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = Object.keys(result)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      if (result[key] === void 0) delete result[key];
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return result;
};

var parse5094 = function parse5094(uri) {
  var sixeightyone = new RegExp(REGEX.regex_5094);
  var data = uri.match(sixeightyone);
  if (!data) return;
  var result = {
    scheme: "ethereum",
    prefix: "networkadd",
    parameters: {
      chain_name: "",
      rpc_url: ""
    }
  };
  return result;
};

var ethereum_regex = "^ethereum:";
var number_regex = /^(?<major>[+-]?\d+)(?:\.(?<minor>\d+))?(?:[Ee](?<exponent>\d+))?$/;
var prefix_regex = "(?<prefix>[a-zA-Z]+)-";
var address_regex = "(?:0x[\\w]{40})|(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,})";
var txaddress_regex = "0x[\\w]{64}";
var regex_generic = "${ethereum_regex}(?:${prefix_regex})";
var regex_681 = ethereum_regex + "(?:pay-)?(?<address>" + address_regex + ")\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*(?<query>\\?.*)?";
var regex_2400 = ethereum_regex + "tx-(?<address>" + txaddress_regex + ")\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*(?<query>\\?.*)?";
var regex_5094 = ethereum_regex + "network-add\\@?(?<chain_id>[\\w]*)*\\/?(?<query>\\?.*)?";
var REGEX = {
  ethereum_regex: ethereum_regex,
  number_regex: number_regex,
  prefix_regex: prefix_regex,
  address_regex: address_regex,
  txaddress_regex: txaddress_regex,
  regex_generic: regex_generic,
  regex_681: regex_681,
  regex_2400: regex_2400,
  regex_5094: regex_5094
};
function stringifyValue(variable, value) {
  var isNumber = !Number.isNaN(value) && !value.toString().startsWith("0x");
  if (isNumber) {
    value = new BigNumber.BigNumber(value, 10).toExponential().replace("+", "").replace(/e0$/, "").replace(/e1$/, "0");
  }
  return value;
}
var supported_specs = [parse2400, parse5094, parse681];
var parse = function parse(uri) {
  if (!uri || typeof uri !== "string") {
    throw new Error("uri must be a string");
  }
  if (uri.slice(0, 9) !== "ethereum:") {
    throw new Error("Not an Ethereum URI");
  }
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = supported_specs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var parseFunc = _step.value;

      var result = parseFunc(uri);
      if (result) return result;
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  throw new Error("Unknown Ethereum Standard");
};
function build(data) {
  var query = [];
  var queryParameters = [].concat(Object.keys(data.parameters || {}).map(function (key) {
    return [key, data.parameters[key]];
  }), data.args).filter(function (value) {
    return !!value;
  });
  query = queryParameters.map(function (data2) {
    return data2.at(0) + "=" + encodeURIComponent(stringifyValue(data2.at(0), data2.at(1)));
  });
  return "ethereum:" + (data.prefix ? data.prefix + "-" : "") + data.target_address + (data.chain_id ? "@" + data.chain_id : "") + (data.function_name ? "/" + data.function_name : "") + (query.length > 0 ? "?" + query.join("&") : "");
}

exports.REGEX = REGEX;
exports.parse = parse;
exports.build = build;
