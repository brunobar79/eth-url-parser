import { BigNumber } from 'bignumber.js';

var EIP681NamedParameters = ["value", "gas", "gasLimit", "gasPrice"];
var number_regex = /^(?<major>[+-]?\d+)(?:\.(?<minor>\d+))?(?:[Ee](?<exponent>\d+))?$/;
var prefix_regex = "(?<prefix>[a-zA-Z]+)-";
var address_regex = "(?:0x[\\w]{40})|(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,})";
var full_regex = "^ethereum:(?:" + prefix_regex + ")?(?<address>" + address_regex + ")\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*(?<query>\\?.*)?";
function processValue(variable, value) {
  var isReserved = EIP681NamedParameters.includes(variable);
  var isNumber = number_regex.test(value);
  if (isReserved && !isNumber) throw new Error(variable + " needs to be a number");
  if (isNumber) {
    var match = value.match(number_regex).groups;
    value = new BigNumber("" + match.major + (match.minor ? "." + match.minor : "") + (match.exponent ? "e+" + match.exponent : ""), 10).toString();
  }
  return value;
}
function stringifyValue(variable, value) {
  var isNumber = value.match(/^\d+$/);
  if (isNumber) {
    value = new BigNumber(value, 10).toExponential().replace("+", "").replace(/e0$/, "").replace(/e1$/, "0");
  }
  return value;
}
function parse(uri) {
  if (!uri || typeof uri !== "string") {
    throw new Error("uri must be a string");
  }
  if (uri.slice(0, 9) !== "ethereum:") {
    throw new Error("Not an Ethereum URI");
  }
  var exp = new RegExp(full_regex);
  var data = uri.match(exp);
  if (!data) {
    throw new Error("Couldn not parse the url");
  }
  var query = data.groups.query ? data.groups.query.slice(1).split("&") : [];
  var result = {
    scheme: "ethereum",
    target_address: data.groups.address,
    prefix: data.groups.prefix,
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
        var value = processValue(variable, variable_and_value.at(1));
        if (EIP681NamedParameters.includes(variable)) {
          if (!result.parameters) result.parameters = {};
          result.parameters[variable] = value;
          continue;
        }
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
}
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

export { EIP681NamedParameters, parse, build };
