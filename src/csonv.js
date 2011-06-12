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
      var strings = values.csvSplit(",");
      var array   = [];
      for (var i = 0; i < strings.length; i++) {
        array.push(parseMethods[type](strings[i]));
      }
      return array;
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
      },
      "strings": function(value) {
        return arrayOf("string", value);
      },
      "integers": function(value) {
        return arrayOf("integer", value);
      },
      "floats": function(value) {
        return arrayOf("float", value);
      },
      "booleans": function(value) {
        return arrayOf("boolean", value);
      }
    };
  };

  var fetch = function(url) {
    return csvToObjects(ajax(url));
  };

  var ajax = function(url) {
    request = new(window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
    request.open("GET", url, 0);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send();
    return request.responseText;
  };

  var csvToObjects = function(csv) {
    var rows  = csv.split("\n");
    var keys  = rows.shift().csvSplit();
    var types = rows.shift().csvSplit();

    var methods = [];
    for (var i = 0; i < types.length; i++) {
      methods.push(parseMethods[types[i]]);
    }

    var array = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i].csvSplit(), object = {};
      for (var j = 0; j < keys.length; j++) {
        object[keys[j]] = methods[j](row[j]);
      }
      array.push(object);
    }

    return array;
  };

  return {
    version: "{version}",
    sep    : ";",
    init   : defineParseMethods,
    fetch  : fetch
  };
}());

String.prototype.toData = function() {
  return Csonv.fetch(this);
};

String.prototype.csvSplit = function(s) {
  s = s || Csonv.sep;

  var reg_exp = new RegExp(("(\\" + s + '|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\' + s + "\\r\\n]*))"), "gi");
  var row = [], m = null;

  if (this.match(new RegExp("^\\" + s))) {
    row.push("");
  }

  while (m = reg_exp.exec(this)) {
    var m1 = m[1];
    if (m1.length && (m1 != s)) {
      row.push(m1);
    }
    var value = m[2] ? m[2].replace(new RegExp('""', "g"), '"') : m[3];
    row.push(value);
  }

  return row;
};

Csonv.init();

}