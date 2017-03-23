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

foam.CLASS({
  package: 'foam.net.node',
  name: 'RestDAOHandler',
  extends: 'foam.net.node.Handler',

  requires: [ 'foam.dao.ArraySink' ],
  imports: [
    'info',
    'warn'
  ],

  properties: [
    {
      class: 'String',
      name: 'urlPath',
      documentation: 'URL path prefix.',
      required: true
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      transient: true,
      required: true
    },
    {
      name: 'url',
      factory: function() {  return require('url'); }
    }
  ],

  methods: [
    function handle(req, res) {
      // Check the URL for the prefix.
      var url = this.url.parse(req.url, true);
      var target = url.pathname;
      if ( target.indexOf(this.urlPath) !== 0 ) return false;

      // Look past prefix.
      target = target.substring(this.urlPath.length);
      // Any suffix should be "/"- or ":"-separated from prefix. Otherwise,
      // it's not really a match.
      var sep = target.charAt(0);
      if ( target.length > 0 && sep !== '/' && sep !== ':' ) return false;
      // Look past any separator. Store it for detecting find()/select() URLs.
      target = target.substring(1);

      var send500 = this.send500.bind(this, req, res);
      var self = this;
      var id;
      var payload;
      var data;
      if ( req.method === 'PUT' ) {
        //
        // put()
        //

        // No suffix on put() requests.
        if ( target !== '' ) {
          self.send404(req, res);
          self.warn('Attempt to put() with path suffix');
          return true;
        }

        self.getPayload_(req).then(function(o) {
          return self.dao.put(o);
        }).then(function(o) {
          self.sendJSON(res, 200, self.fo2o_(o));
          self.info('200 OK: put() ' + o.id);
        }).catch(send500);
      } else if ( req.method === 'DELETE' ) {
        //
        // remove()
        //

        try {
          id = JSON.parse(decodeURIComponent(target));
        } catch (error) {
          send500(error);
          return true;
        }

        self.dao.find(id).then(function(o) {
          payload = self.fo2o_(o);
          return self.dao.remove(o);
        }).then(function() {
          self.sendJSON(res, 200, payload);
          self.info('200 OK: remove() ' + id);
        }).catch(send500);
      } else if ( req.method === 'GET' ) {
        if ( sep === '/' && target !== '' ) {
          // Extra fragment: "/<id>" => find().

          //
          // find()
          //

          try {
            id = JSON.parse(decodeURIComponent(target));
          } catch (err) {
            send500(err);
            return true;
          }

          self.dao.find(id).then(function(o) {
            self.sendJSON(res, 200, self.fo2o_(o));
            self.info('200 OK: find() ' + id);
          }).catch(send500);
        } else if ( sep === ':' && target === 'select' ) {
          // Extra fragment: ":select" => select().

          //
          // select()
          //

          // Decode query. E.g., skip=<skip>&predicate=<predicate>
          // Values in key=value are wrapped in
          // uri-encode(json-stringify(foam-jsonify(value))).
          data = url.query;
          try {
            for ( var key in data ) {
              // Note: This would use data.hasOwnProperty(key), except that
              // Node JS ParsedQueryString objects do not descend from
              // Object.prototype.
              data[key] = self.jsonStr2fo_(decodeURIComponent(data[key]));
            }
          } catch (error) {
            send500(error);
            self.error('Failed to decode query from URL fragment: ' + target);
            return true;
          }

          var sink = data.sink;
          var skip = data.skip;
          var limit = data.limit;
          var order = data.order;
          var predicate = data.predicate;
          self.dao.select(sink, skip, limit, order, predicate)
            .then(function(sink) {
              self.sendJSON(res, 200, self.fo2o_(sink));
              self.info('200 OK: select()');
            }).catch(send500);
        } else {
          self.send404(req, res);
          self.warn('Unrecognized DAO GET URL fragment: '  + sep + target);
        }
      } else if ( req.method === 'POST' ) {
        if ( sep !== ':' || target !== 'removeAll' ) {
          self.send404(req, res);
          self.warn('Unknown POST request: ' + target);
          return true;
        }


        //
        // removeAll()
        //

        self.getPayload_(req).then(function(data) {
          var skip = data.skip;
          var limit = data.limit;
          var order = data.order;
          var predicate = data.predicate;
          return self.dao.removeAll(skip, limit, order, predicate);
        }).then(function() {
          self.sendJSON(res, 200, '{}');
          self.info('200 OK: removeAll()');
        }).catch(send500);
      } else {
        self.send404(req, res);
        self.warn('Method not supported: '  + req.method);
      }

      return true;
    },
    {
      name: 'fo2o_',
      documentation: "Transform FOAM object to JSON.stringify'able object.",
      code: function(o) {
        return foam.json.Network.objectify(o);
      }
    },
    {
      name: 'jsonStr2fo_',
      documentation: "Transform JSON string to FOAM object.",
      code: function(str) {
        // TODO(markdittmer): Use a safe JSON deserializer that honours only
        // an allowed list of classes.
        return foam.json.parse(JSON.parse(str));
      }
    },
    function getPayload_(req) {
      var self = this;
      return new Promise(function(resolve, reject) {
        var payload = '';
        req.on('data', function (chunk) {
          payload += chunk.toString();
        });
        req.on('end', function () {
          try {
            resolve(self.jsonStr2fo_(payload));
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  ]
});
