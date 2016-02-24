// var Promise = require('promise');
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-load'));

var path = require('path');
var batch = require('./batch');
var jsonGraph = require('falcor-json-graph');

function RService(browserDB) {
    var that = this;
    var dbName = browserDB ? 'rdb' : path.join(__dirname, 'db/rdb');
    this.recommendationsDB = new PouchDB(dbName);
    var initializeDB = true;

    function installDB() {
      that.recommendationsDB = new PouchDB(dbName);
      var imports;
      if (typeof EnvWebPack === 'undefined') {
        var fs = require('fs');
        imports = fs.readFileSync('dbTemplates/rdb.txt') + '';
      }
      else {
        imports = require('../../dbTemplates/rdb.txt');
      }

      // console.log('###imports:', imports);
      that.recommendationsDB.load(imports).then(function () {
          // console.log('RService() DB imported');
      }).catch(function (err) {
          console.log('RService() DB import error:', err);
      });
    }

    if (initializeDB) {
      that.recommendationsDB.destroy()
        .then(function (response) {
          installDB();
        })
        .catch(function (err) {
          console.log('RService() DB does not exist:', err);
          installDB();
        });
    }
}

RService.prototype = {
    getGenreList: function(userId) {
        var that = this;
        userId = (userId || 'all').toString();

        var getGenreLists = batch(function(userIds) {
            return that.recommendationsDB.allDocs({
                keys: userIds.map(function(x) {
                        return x.toString();
                    }),
                include_docs: true
            }).then(function(dbResponse) {
                console.log('dbResponse:', dbResponse);
                var genreLists = {};
                dbResponse.rows.forEach(function(row) {
                    genreLists[row.key] = row;
                });
                return genreLists;
            });
        });

        var result = getGenreLists([userId]).then(function(genreLists) {
            console.log('genreLists::::', genreLists);
            return genreLists[userId].doc.recommendations;
        });

        return result;
    },

	addTitleToGenreList: function(userId, genreIndex, titleId) {
        var that = this;
        userId = userId.toString();
        return that.recommendationsDB.get(userId)
            .then(function(response) {
                if (!response.recommendations[genreIndex]) {
                    return Promise.reject(new Error("genrelist does not exist at index " + genreIndex));
                }
                var titlesLength = response.recommendations[genreIndex].titles.push(titleId);
                return that.recommendationsDB.put({
                    _id: userId,
                    _rev: response._rev,
                    recommendations: response.recommendations
                }).then(function() {
                    return titlesLength;
                });
            });
	},

    removeTitleFromGenreListByIndex: function(userId, genreIndex, titleIndex) {
        var that = this;
        userId = userId.toString();
        return that.recommendationsDB.get(userId)
            .then(function(response) {
                if (!response.recommendations[genreIndex]) {
                    return Promise.reject(new Error("genrelist does not exist at index " + genreIndex));
                }
                var removedTitleId = response.recommendations[genreIndex].titles.splice(titleIndex, 1)[0];
                return that.recommendationsDB.put({
                    _id: userId,
                    _rev: response._rev,
                    recommendations: response.recommendations
                }).then(function() {
                    return {
                        titleId: removedTitleId,
                        length: response.recommendations[genreIndex].titles.length
                    };
                });
            });
    }
};

module.exports = RService;
