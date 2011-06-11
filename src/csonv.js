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
    var methods = collectParseMethods(types);

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

  var collectParseMethods = function(types) {
    var methods = {
      "string": function(value) {
        return value.toString();
      },
      "integer": function(value) {
        return parseInt(value, 10);
      },
      "boolean": function(value) {
        return parseInt(value, 10) == 1;
      },
      "strings": function(value) {
        return value.splitCsv(",");
      },
      "integers": function(value) {
        var strings  = value.split(",");
        var integers = [];
        for (var i = 0; i < strings.length; i++) {
          integers.push(parseInt(strings[i], 10));
        }
        return integers;
      },
      "booleans": function(value) {
        var strings  = value.split(",");
        var booleans = [];
        for (var i = 0; i < strings.length; i++) {
          booleans.push(parseInt(strings[i], 10) == 1);
        }
        return booleans;
      }
    }
    var result = [];
    for (var i = 0; i < types.length; i++) {
      result.push(methods[types[i]]);
    }
    return result;
  };

  return {
    version: "{version}",
    sep: ";",
    init: function() {
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

}