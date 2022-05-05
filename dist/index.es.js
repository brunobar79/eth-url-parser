import { BigNumber } from 'bignumber.js';
import qs from 'qs';

function parse(uri) {
  if (!uri || typeof uri !== "string") {
    throw new Error("uri must be a string");
  }
  if (uri.slice(0, 9) !== "ethereum:") {
    throw new Error("Not an Ethereum URI");
  }
  var prefix_regex = "(?<prefix>[a-zA-Z]+)-";
  var address_regex = "(?:0x[\\w]{40})|(?:[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9].[a-zA-Z]{2,})";
  var full_regex = "^ethereum:(?:" + prefix_regex + ")?(?<address>" + address_regex + ")\\@?(?<chain_id>[\\w]*)*\\/?(?<function_name>[\\w]*)*";
  var exp = new RegExp(full_regex);
  var data = uri.match(exp);
  if (!data) {
    throw new Error("Couldn not parse the url");
  }
  var _parameters = uri.split("?");
  var parameters = _parameters.length > 1 ? _parameters.at(1) : "";
  var parameters_ = qs.parse(parameters);
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
  if (Object.keys(parameters_).length > 0) {
    result.parameters = parameters_;
    var amountKey = result.function_name === "transfer" ? "uint256" : "value";
    if (result.parameters[amountKey]) {
      result.parameters[amountKey] = new BigNumber(result.parameters[amountKey], 10).toString();
      if (!Number.isFinite(Number.parseInt(result.parameters[amountKey])) || result.parameters[amountKey] < 0) throw new Error("Invalid amount " + result.parameters[amountKey]);
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

export { parse, build };
