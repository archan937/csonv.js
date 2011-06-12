if (typeof(Csonv) == "undefined") {

// *
// * csonv.js 0.1.1 (Uncompressed)
// * A tiny library to fetch relational CSV data like JSON
// *
// * (c) 2011 Paul Engel (Internetbureau Holder B.V.)
// * Except otherwise noted, csonv.js is licensed under
// * http://creativecommons.org/licenses/by-sa/3.0
// *
// * $Date: 2011-06-12 17:26:13 +0100 (Sun, 12 June 2011) $
// *

Csonv = (function() {
  var parsers = null, cache = {}, maps = {};

  var defineParsers = function() {
    var n = function(type, values) {
      var strings = values.csvSplit(Csonv.separators.array);
      var array   = [];
      for (var i = 0; i < strings.length; i++) {
        array.push(parsers[type](strings[i]));
      }
      return array;
    };

    parsers = {
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
        return n("string", value);
      },
      "integers": function(value) {
        return n("integer", value);
      },
      "floats": function(value) {
        return n("float", value);
      },
      "booleans": function(value) {
        return n("boolean", value);
      },
      "relational": function(values, type, url) {
        var ids       = values.split(Csonv.separators.array);
        var assoc     = type.split(":");
        var assoc_url = url.replace(/\w+\.csv$/, assoc[0] + ".csv")
        var array     = [];

        assoc_url.toObjects();

        for (var i = 0; i < ids.length; i++) {
          var object = maps[assoc_url][parseInt(ids[i], 10)];
          if (object) {
            array.push(object);
          }
        }

        return assoc[1] == "one" ? array[0] || null : array;
      }
    };
  };

  var ajax = function(url) {
    request = new(window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
    request.open("GET", url, 0);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send();
    return request.responseText;
  };

  var toObjects = function(data, url) {
    var rows  = data.split("\n");
    var keys  = rows.shift().csvSplit();
    var types = rows.shift().csvSplit();

    var methods = [];
    for (var i = 0; i < types.length; i++) {
      methods.push(parsers[types[i]] || parsers["relational"]);
    }

    var data = [];
    var map  = {};

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i].csvSplit(), object = {};
      for (var j = 0; j < keys.length; j++) {
        object[keys[j]] = methods[j](row[j], types[j], url);
      }
      if (object.id) {
        map[object.id] = object;
      }
      data.push(object);
    }

    cache[url] = data;
    maps[url]  = map;

    return data;
  };

  return {
    version: "0.1.1",
    separators: {
      column: ";",
      array : ","
    },
    init : defineParsers,
    fetch: function(url) {
      return cache[url] || toObjects(ajax(url), url);
    }
  };
}());

String.prototype.toObjects = function() {
  return Csonv.fetch(this);
};

String.prototype.csvSplit = function(s) {
  s = s || Csonv.separators.column;

  var reg_exp = new RegExp(("(\\" + s + '|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\' + s + "\\r\\n]*))"), "gi");
  var str = this.trim(), row = [], m = null;

  if (str.match(new RegExp("^\\" + s))) {
    row.push("");
  }

  while (m = reg_exp.exec(str)) {
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
