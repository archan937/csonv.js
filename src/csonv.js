if (typeof(Csonv) == "undefined") {

// *
// * csonv.js {version} (Uncompressed)
// * A tiny library to fetch CSV data like JSON
// *
// * (c) {year} Paul Engel (Internetbureau Holder B.V.)
// * Except otherwise noted, csonv.js is licensed under
// * http://creativecommons.org/licenses/by-sa/3.0
// *
// * $Date: {date} $
// *

Csonv = (function() {
  var parseMethods = null;

  var defineParseMethods = function() {
    var arrayOf = function(type, values) {
      var strings = values.splitCsv(",");
      var result  = [];
      for (var i = 0; i < strings.length; i++) {
        result.push(parseMethods[type](strings[i]));
      }
      return result;
    };

    parseMethods = {
      "string": function(value) {
        return value.toString();
      },
      "integer": function(value) {
        return parseInt(value, 10);
      },
      "float": function(value) {
        return parseFloat(value);
      },
      "boolean": function(value) {
        return parseInt(value, 10) == 1;
      }
    };

    parseMethods.strings  = function(value) {
      return arrayOf("string" , value);
    };
    parseMethods.integers = function(value) {
      return arrayOf("integer", value);
    };
    parseMethods.floats   = function(value) {
      return arrayOf("float"  , value);
    };
    parseMethods.booleans = function(value) {
      return arrayOf("boolean", value);
    };
  };

  var fetch = function(url) {
    var csv = ajax(url);
    return csvToJson(csv);
  };

  var ajax = function(url) {
    request = new(window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
    request.open("GET", url, 0);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send();
    return request.responseText;
  };

  var csvToJson = function(csv) {
    var rows    = csv.split("\n");
    var keys    = rows.shift().splitCsv();
    var types   = rows.shift().splitCsv();

    var methods = [];
    for (var i = 0; i < types.length; i++) {
      methods.push(parseMethods[types[i]]);
    }

    var json = [];
    for (var i = 0; i < rows.length; i++) {
      var row    = rows[i].splitCsv();
      var object = {};
      for (var j = 0; j < keys.length; j++) {
        object[keys[j]] = methods[j](row[j]);
      }
      json.push(object);
    }

    return json;
  };

  return {
    version: "{version}",
    sep: ";",
    init: function() {
      defineParseMethods();
      if (typeof(onCsonvReady) == "function") {
        onCsonvReady();
      };
    },
    fetch: fetch
  };
}());

csonv = function(url) {
  return Csonv.fetch(url); };

String.prototype.csonv = function() {
  return this.csv(); };

String.prototype.csv = function() {
  return Csonv.fetch(this.toString() + ".csv"); };

String.prototype.splitCsv = function(sep) {
  for (var foo = this.split(sep = sep || Csonv.sep), x = foo.length - 1, tl; x >= 0; x--) {
    if (foo[x].replace(/"\s+$/, '"').charAt(foo[x].length - 1) == '"') {
      if ((tl = foo[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
        foo[x] = foo[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
      } else if (x) {
        foo.splice(x - 1, 2, [foo[x - 1], foo[x]].join(sep));
      } else foo = foo.shift().split(sep).concat(foo);
    } else foo[x].replace(/""/g, '"');
  } return foo; };

Csonv.init();

}