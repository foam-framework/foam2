/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
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
  extends: 'foam.net.node.PathnamePrefixHandler',
  flags: ['node'],
  documentation: `Server-side handler that is the dual of a client-side
      foam.dao.RestDAO.

      E.g.,

      // Client:
      var dao = foam.dao.RestDAO.create({ baseURL: 'https://my.server/a/dao' });

      // Server:
      myServerRootPathnameRouter.addPathnamePrefix(
          '/a/dao', foam.net.node.RestDAOHandler.create({
            dao: daoOnMyServer
          }, myServerRootPathnameRouter));`,

  requires: [ 'foam.json.Parser' ],

  imports: [
    'creationContext',
    'info'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      transient: true,
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'foam.json.Parser',
      name: 'parser',
      transient: true,
      factory: function() {
        // NOTE: Configuration must be consistent with outputters in
        // corresponding foam.dao.RestDAO.
        return this.Parser.create({
          strict: true,
          creationContext: this.creationContext
        });
      }
    }
  ],

  methods: [
    function handle(req, res) {
      // Check the URL for the prefix.
      var url = req.url;
      var target = url.pathname;
      if ( target.indexOf(this.pathnamePrefix) !== 0 ) {
        this.send404(req, res);
        this.reportWarnMsg(req, `PathnamePrefix Route/Handler mismatch:
                                    URL pathname: ${req.url.pathname}
                                    Handler prefix: ${this.pathnamePrefix}`);
        return true;
      }

      // Look past prefix.
      target = target.substring(this.pathnamePrefix.length);
      // Any suffix should be "/"- or ":"-separated from prefix. Otherwise,
      // it's not really a match.
      var sep = target.charAt(0);
      if ( target.length > 0 && sep !== '/' && sep !== ':' ) return false;
      // Look past any separator. Store it for detecting find()/select() URLs.
      target = target.substring(1);

      var send400 = this.send400.bind(this, req, res);
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
          self.reportWarnMsg(req, 'Attempt to put() with path suffix');
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
        } else {
          self.send404(req, res);
          self.reportWarnMsg(
            req, 'Unrecognized DAO GET URL fragment: '  + sep + target);
        }
      } else if ( req.method === 'POST' ) {
        if ( sep === ':' && target === 'select' ) {
          // Extra fragment: ":select" => select().

          //
          // select()
          //

          self.getPayload_(req).then(function(data) {
            var sink = data.sink;
            var skip = data.skip;
            var limit = data.limit;
            var order = data.order;
            var predicate = data.predicate;
            self.dao.select_(self.dao.__context__, sink, skip, limit, order, predicate)
                .then(function(sink) {
                  // Prevent caching of select() responses.
                  var dateString = new Date().toUTCString();
                  res.setHeader('Expires', dateString);
                  res.setHeader('Last-Modified', dateString);
                  res.setHeader(
                      'Cache-Control',
                      'max-age=0, no-cache, must-revalidate, proxy-revalidate');

                  self.sendJSON(res, 200, self.fo2o_(sink));
                  self.info('200 OK: select()');
                }).catch(send500);
          });
        } else if ( sep === ':' && target === 'removeAll' ) {

          //
          // removeAll()
          //

          self.getPayload_(req).then(function(data) {
            var skip = data.skip;
            var limit = data.limit;
            var order = data.order;
            var predicate = data.predicate;
            return self.dao.removeAll_(self.dao.__context__, skip, limit, order, predicate);
          }).then(function() {
            self.sendJSON(res, 200, '{}');
            self.info('200 OK: removeAll()');
          }).catch(send500);
        } else {
          self.send404(req, res);
          self.reportWarnMsg(req, 'Unknown POST request: ' + target);
        }
      } else {
        self.send404(req, res);
        self.reportWarnMsg(req, 'Method not supported: '  + req.method);
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
    function getPayload_(req) {
      return req.payload.then(function(buffer) {
        return this.parser.parseString(buffer.toString());
      }.bind(this));
    }
  ]
});
