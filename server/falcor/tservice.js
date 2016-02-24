var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));
var batch = require('./batch');
var path = require('path');

function TService(browserDB) {
  var that = this;
  var dbName = browserDB ? 'tdb' : path.join(__dirname, 'db/tdb');
  this.titlesDB = new PouchDB(dbName);
  var initializeDB = true;

  function installDB() {
    that.titlesDB = new PouchDB(dbName);
    var imports;
    if (typeof EnvWebPack === 'undefined') {
      var fs = require('fs');
      imports = fs.readFileSync('dbTemplates/tdb.txt') + '';
    }
    else {
      imports = require('../../dbTemplates/tdb.txt');
    }

    that.titlesDB.load(imports).then(function () {
        // console.log('TService() DB imported');
    }).catch(function (err) {
        console.log('TService() DB import error:', err);
    });
  }

  if (initializeDB) {
    that.titlesDB.destroy()
      .then(function (response) {
        installDB();
      })
      .catch(function (err) {
        console.log('TService() DB destroy error:', err);
        // installDB();
      });
  }
}


TService.prototype = {
  getTitles: function(titleIds) {
    var that = this;
    var getTitlesBatch = batch(function(titleIds2) {
      return that.titlesDB.allDocs({
          keys: titleIds2.map(function(x) {
            return x.toString();
          }),
          include_docs: true
      }).then(function(dbResponse) {
        var titles = {};
        dbResponse.rows.forEach(function (row) {
          if (row.error) {
            if (row.error === "not_found") {
              titles[row.key] = {doc: null};
            }
            else {
              titles[row.key] = {error: row.error};
            }
          }
          else if (row.doc) {
            titles[row.key] = row;
          }
          else {
            titles[row.key] = {doc: null};
          }
        });
        return titles;
      });
    });

    return getTitlesBatch(titleIds).then(function(titles) {
        return titles;
    });

  }
};

module.exports = TService;
