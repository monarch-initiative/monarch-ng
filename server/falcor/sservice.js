// var Promise = require('promise');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));
var path = require('path');

// ratings service
function SService(browserDB) {
  var that = this;
  var dbName = browserDB ? 'sdb' : path.join(__dirname, 'db/sdb');
  this.ratingsDB = new PouchDB(dbName);

  var initializeDB = true;

  function installDB() {
    that.ratingsDB = new PouchDB(dbName);

    var imports;
    if (typeof EnvWebPack === 'undefined') {
      var fs = require('fs');
      imports = fs.readFileSync('dbTemplates/sdb.txt') + '';
    }
    else {
      imports = require('../../dbTemplates/sdb.txt');
    }

    that.ratingsDB.load(imports).then(function () {
        // console.log('SService() DB imported');
    }).catch(function (err) {
        console.log('SService() DB import error:', err);
    });
  }

  if (initializeDB) {
    that.ratingsDB.info().then(function(result) {
      that.ratingsDB.destroy()
        .then(function (response) {
          installDB();
        })
        .catch(function (err) {
          console.log('SService() Error destroying DB:', err, dbName);
          installDB();
        });

    }).catch(function (err) {
      console.log(err);
    });
  }
}

SService.prototype = {

  getRatings: function(titleIds, userId) {
    var that = this;
    userId = userId || 'all';

    return that.ratingsDB.allDocs({
        keys: titleIds.map(function(id) {
            return userId + "," + id;
        }),
        include_docs: true
    }).then(function(dbResponse) {
        var ratings = {};
        dbResponse.rows.forEach(function(row) {
          if (row.error) {
            if (row.error === "not_found") {
              ratings[row.key.substr((userId + ",").length)] = {doc: null};
            }
            else {
              ratings[row.key.substr((userId + ",").length)] = {error: row.error};
            }
          }
          else if (row.doc) {
              ratings[row.key.substr((userId + ",").length)] = row;
          }
          else {
            ratings[row.key.substr((userId + ",").length)] = {doc: null};
          }
        });
        return ratings;
    });
  },

    setRatings: function(userId, titlesIdsAndRating) {
        var that = this;
        function coerce(rating) {
            if (rating > 5) {
              return 5;
            }
            else if (rating < 1) {
              return 1;
            }
            else {
              return rating;
            }
        }

        var ids = Object.keys(titlesIdsAndRating);

        /* eslint no-undefined: 0 */
        return that.ratingsDB.allDocs({
            keys: ids.map(function(id) {
                return userId + "," + id;
            }),
            include_docs: true
        }).then(function(getResponse) {
            return that.ratingsDB.bulkDocs(
                ids.filter(function(id, index) {
                    return !(getResponse.rows[index].doc === null || getResponse.rows[index].error === "not_found");
                }).map(function(id, index) {
                    return {
                        _id: userId + "," + id,
                        _rev: (!getResponse.rows[index].error ? getResponse.rows[index].value.rev : undefined),
                        userRating: coerce(titlesIdsAndRating[id].userRating)
                    };
                })
            ).then(function(setResponse) {

                var results = {};
                getResponse.rows.forEach(function(response, index) {
                    if (!setResponse[index]) {
                        results[response.key.substr((userId + ",").length)] = {doc: null};
                    }
                    else if (setResponse[index].ok) {
                        if (getResponse.rows[index].doc === null || getResponse.rows[index].error) {
                            results[response.key.substr((userId + ",").length)] = {
                              id: setResponse[index].id,
                              key: setResponse[index].id,
                              value: {
                                 rev: setResponse[index].rev
                              },
                              doc: {
                                 userRating: coerce(titlesIdsAndRating[response.key.substr((userId + ",").length)].userRating),
                                 _id: setResponse[index].id,
                                 _rev: setResponse[index].rev
                              }
                           };
                        }
                        else {
                            response.doc.userRating = coerce(titlesIdsAndRating[response.key.substr((userId + ",").length)].userRating);
                            results[response.key.substr((userId + ",").length)] = response;
                        }
                    }
                    else {
                        results[response.key.substr((userId + ",").length)] = {error: setResponse[index].message};
                    }
                });
                return results;
            });
        });
  }
};

module.exports = SService;
