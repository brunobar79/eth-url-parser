import { BigNumber } from 'bignumber.js';
import qs from 'qs';

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
    target_address: data.groups.address
  };
  if (data.groups.prefix) {
    result.prefix = data.groups.prefix;
  }
  if (data.at(3)) {
    result.chain_id = data.groups.chain_id;
  }
  if (data.at(4)) {
    result.function_name = data.groups.function_name;
  }
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
        if (!result.arguments) result.arguments = [];
        result.arguments.push([variable, value]);
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
  return result;
}
function build(_ref) {
  var prefix = _ref.prefix,
      target_address = _ref.target_address,
      chain_id = _ref.chain_id,
      function_name = _ref.function_name,
      parameters = _ref.parameters;

  var query = void 0;
  if (parameters) {
    var amountKey = function_name === "transfer" ? "uint256" : "value";
    if (parameters[amountKey]) {
      parameters[amountKey] = new BigNumber(parameters[amountKey], 10).toExponential().replace("+", "").replace("e0", "");
      if (!Number.isFinite(Number.parseInt(parameters[amountKey])) || parameters[amountKey] < 0) throw new Error("Invalid amount");
    }
    query = qs.stringify(parameters);
  }
  return "ethereum:" + (prefix ? prefix + "-" : "") + target_address + (chain_id ? "@" + chain_id : "") + (function_name ? "/" + function_name : "") + (query ? "?" + query : "");
}

export { EIP681NamedParameters, parse, build };
