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

  imports: [
    'info',
    'warn'
  ],

  properties: [
    {
      class: 'String',
      name: 'prefix',
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
      class: 'Int',
      name: 'suffixOffset',
      documentation: 'Offset to prefix + 1.',
      factory: function() { return this.prefix.length + 1; }
    }
  ],

  methods: [
    function handle(req, res) {
      // Check the URL for the prefix.
      var target = req.url;
      if ( target.indexOf(this.prefix) !== 0 ) return false;

      // Look past prefix.
      target = target.substring(this.prefix.length);
      // Any suffix should be "/"-separated from prefix. Otherwise, it's not
      // really a match.
      if ( target.length > 0 && target.indexOf('/') !== 0 ) return false;
      // Look past any "/" separator.
      target = target.substring(1);

      var send500 = this.send500.bind(this, req, res);
      var self = this;
      var id;
      var payload;
      var data;
      if ( req.method === 'PUT' ) {
        // No suffix on put() requests.
        if ( target !== '' ) {
          self.send404(req, res);
          self.warn('Attempt to put() with path suffix');
          return true;
        }

        self.getPayload_(req).then(function(o) {
          return self.dao.put(o);
        }).then(function(o) {
          self.send(res, 201, self.jsonify_(o));
          self.info('200 OK: put() ' + target + ' ' + o.id);
        }).catch(send500);
      } else if ( req.method === 'DELETE' ) {
        try {
          id = JSON.parse(decodeURIComponent(target));
        } catch (error) {
          send500(error);
          return true;
        }

        self.dao.find(id).then(function(o) {
          payload = self.jsonify_(o);
          return self.dao.remove(o);
        }).then(function() {
          self.send(res, 200, payload);
          self.info('200 OK: remove() ' + id);
        }).catch(send500);
      } else if ( req.method === 'GET' ) {
        if ( target !== '' ) {
          // Additional URL fragment => find().
          try {
            id = JSON.parse(decodeURIComponent(target));
          } catch (err) {
            send500(err);
            return true;
          }

          self.dao.find(id).then(function(o) {
            self.send(res, 200, self.jsonify_(o));
            self.info('200 OK: find() ' + id);
          }).catch(send500);
        } else {
          // No additional URL fragment => select().
          self.getPayload_(req).then(function(data) {
            var skip = data.skip;
            var limit = data.limit;
            var order = data.order;
            var predicate = data.predicate;
            return self.dao.select(undefined, skip, limit, order, predicate);
          }).then(function(sink) {
            self.send(res, 200, self.jsonify_(sink.a));
            self.info('200 OK: select() ' + sink.a.length);
          }).catch(send500);
        }
      } else if ( req.method === 'POST' ) {
        // No suffix on removeAll() requests.
        if ( target !== '' ) {
          self.send404(req, res);
          self.warn('Attempt to removeAll() with path suffix');
          return true;
        }

        self.getPayload_(req).then(function(data) {
          var skip = data.skip;
          var limit = data.limit;
          var order = data.order;
          var predicate = data.predicate;
          return self.dao.select(undefined, skip, limit, order, predicate);
        }).then(function(sink) {
          self.send(res, 200, '');
          self.info('200 OK: removeAll() ' + sink.a.length);
        }).catch(send500);
      } else {
        self.send404(req, res);
        self.warn('Method not supported: '  + req.method);
      }

      return true;
    },
    function jsonify_(o) {
      return JSON.stringify(foam.json.Network.objectify(o));
    },
    function getPayload_(req) {
      return new Promise(function(resolve, reject) {
        var payload = '';
        req.on('data', function (chunk) {
          payload += chunk;
        });
        req.on('end', function () {
          resolve(foam.json.parseString(payload));
        });
      });
    }
  ]
});
