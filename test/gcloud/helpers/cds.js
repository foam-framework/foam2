/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var env = require('process').env;
var http = require('http');

require('./foam.js');

global.clearCDS = function() {
  return new Promise(function(resolve, reject) {
    var more = 'MORE_RESULTS';
    var resultsReqData = {
      query: {
        projection: [{
          property: { name: '__key__' }
        }]
      }
    };
    var nextCursor = null;
    var results = [];

    function deleteResults() {
      var req = http.request({
        protocol: env.CDS_EMULATOR_PROTOCOL,
        host: env.CDS_EMULATOR_HOST,
        port: env.CDS_EMULATOR_PORT,
        method: 'POST',
        path: '/v1/projects/' + env.CDS_PROJECT_ID + ':commit',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      req.on('aborted', function() {
        reject(new Error('Request aborted by server'));
      });
      req.on('response', function(message) {
        if ( message.statusCode !== 200 ) {
          reject(new Error('Bad request status code: ' + message.statusCode));
          return;
        }

        var jsonText = '';
        message.on('data', function(data) { jsonText += data.toString(); });
        message.on('end', function() {
          var json;
          try {
            json = JSON.parse(jsonText);
          } catch (err) {
            reject(err);
            return;
          }

          var mutationResults = json.mutationResults;
          for ( var i = 0; i < mutationResults.length; i++ ) {
            if ( mutationResults[i].conflictDetected ) {
              reject(new Error('Conflict-on-delete'));
              return;
            }
          }

          resolve();
        });
      });

      req.write(JSON.stringify({
        mode: 'NON_TRANSACTIONAL',
        mutations: results.map(function(result) {
          return {delete: result.entity.key};
        })
      }));
      req.end();
    }

    function getMoreResults() {
      if ( nextCursor ) resultsReqData.query.startCursor = nextCursor;

      var req = http.request({
        protocol: env.CDS_EMULATOR_PROTOCOL,
        host: env.CDS_EMULATOR_HOST,
        port: env.CDS_EMULATOR_PORT,
        method: 'POST',
        path: '/v1/projects/' + env.CDS_PROJECT_ID + ':runQuery',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      req.on('aborted', function() {
        reject(new Error('Request aborted by server'));
      });
      req.on('response', function(message) {
        if ( message.statusCode !== 200 ) {
          reject(new Error('Bad request status code: ' + message.statusCode));
          return;
        }

        var jsonText = '';
        message.on('data', function(data) { jsonText += data.toString(); });
        message.on('end', function() {
          var json;
          try {
            json = JSON.parse(jsonText);
          } catch (err) {
            reject(err);
            return;
          }

          var moreResults =
              // TODO(markdittmer): entityResults check should be
              // unnecessary. Is MORE_RESULTS when no more results exist a
              // Cloud Datastore bug?
              json.batch.entityResults && json.batch.entityResults.length > 0 &&
              json.batch.moreResults.indexOf('MORE_RESULTS') === 0;
          nextCursor = moreResults ? json.batch.endCursor : null;

          results = results.concat(json.batch.entityResults || []);

          if ( moreResults ) getMoreResults();
          else if ( results.length > 0 ) deleteResults();
          else resolve();
        });
      });

      req.write(JSON.stringify(resultsReqData));
      req.end();
    }

    getMoreResults();
  });
};
