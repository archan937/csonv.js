if (typeof(Csonv) == "undefined") {

// *
// * csonv.js {version} (Uncompressed)
// * A tiny library to fetch relational CSV data like JSON
// *
// * (c) {year} Paul Engel (Internetbureau Holder B.V.)
// * Except otherwise noted, csonv.js is licensed under
// * http://creativecommons.org/licenses/by-sa/3.0
// *
// * $Date: {date} $
// *

Csonv = (function() {
  var parsers = null, cache = {};

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
      "relational": function(values, type, url, id) {
        var ids       = values.split(Csonv.separators.array);
        var assoc     = type.split(":");
        var assoc_url = url.replace(/\w+\.csv$/, assoc[0] + ".csv")
        var array     = [];

        assoc_url.toObjects(assoc[2], true);
        var map = cache[assoc_url].map;

        if (assoc[2]) {
          for (var key in map) {
            var object_map = map[key];
            if (object_map[assoc[2]].indexOf(id.toString()) != -1) {
              array.push(object_map._object);
            }
          }
        } else {
          for (var i = 0; i < ids.length; i++) {
            var object_map = map[parseInt(ids[i], 10)];
            if (object_map) {
              array.push(object_map._object);
            }
          }
        }

        return parseInt(assoc[1], 10) == 1 ? array[0] || null : array;
      }
    };
  };

  var resolvePath = function(url, relative) {
    url = url.replace(/[^\/]+\/?$/, "") + relative;
    reg_exp = new RegExp(/[^\/]+\/\.\.\/?/);
    while (url.match(reg_exp)) {
      url = url.replace(reg_exp, "");
    }
    return url;
  };

  var ajax = function(url) {
    request = new(window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
    request.open("GET", url, 0);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.send();
    return request.responseText;
  };

  var toObjects = function(data, url, exclude) {
    var rows  = data.split("\n");
    var keys  = rows.shift().csvSplit();
    var types = rows.shift().csvSplit();
    var data  = [], map = {};

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i].csvSplit(), object = {}, object_map = {};
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j], parser = parsers[type = types[j]];

        if (parser) {
          object[key] = parser(row[j], type, url, object.id);
        } else {
          object_map[key] = type.split(":").length == 2 ? row[j].split(Csonv.separators.array) : null;
          if (exclude != key) {
            object[key] = parsers["relational"](row[j], type, url, object.id);
          }
        }

      }
      if (object.id) {
        object_map._object = object;
        map[object.id]     = object_map;
      }
      data.push(object);
    }

    cache[url] = {
      data: data,
      map : map
    };

    return data;
  };

  return {
    version: "{version}",
    separators: {
      column: ";",
      array : ","
    },
    init : defineParsers,
    fetch: function(url, exclude, cache) {
      if (!cache) {
        cache = {};
      }
      return cache[url] ? cache[url].data : toObjects(ajax(url), url, exclude);
    }
  };
}());

Array.indexOf || (Array.prototype.indexOf = function(v) {
  for (var i = this.length; i-- && this[i] != v;);
  return i;
});

String.trim || (String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, "");
});

String.prototype.toObjects = function(exclude, cache) {
  return Csonv.fetch(this, exclude, cache);
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