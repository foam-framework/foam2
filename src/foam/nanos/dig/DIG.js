/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DIG',
  extends: 'foam.nanos.http.DefaultHttpParameters',

  documentation: 'Data Integration Gateway - Perform DAO operations against a web service',

  requires: [
    'foam.net.web.HTTPRequest'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  tableColumns: [
    'id',
    'daoKey',
    'cmd',
    'format'
  ],

  searchColumns: [],

  constants: [
    {
      name: 'MAX_URL_SIZE',
      value: 2000,
      type: 'Integer'
    }
  ],

  imports: [
    'AuthenticatedNSpecDAO'
  ],

  properties: [
    {
      name: 'id',
      label: 'Request Name'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      label: 'Data Access Object (DAO)',
      name: 'daoKey',
      documentation: `The DAO in the DIG request.`,
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.AuthenticatedNSpecDAO
                .where(E.AND(
                  E.EQ(foam.nanos.boot.NSpec.SERVE, true),
                  E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO')
                ))
                .orderBy(foam.nanos.boot.NSpec.ID)
            }
          ]
        };
      },
      value: 'userDAO'
    },
    {
      name: 'cmd',
      label: 'API Command'
    },
    {
      name: 'format',
      label: 'Data Format',
      visibility: function(cmd) {
        return ( cmd == 'SELECT' || cmd == 'PUT' ) ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'key',
      label: 'Object ID',
      visibility: function(cmd) {
        return ( cmd == 'SELECT' || cmd == 'REMOVE' ) ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
  },
  {
      class: 'String',
      name: 'q',
      label: 'Select Query',
      visibility: function(cmd) {
        return (cmd == 'SELECT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Long',
      name: 'limit',
      visibility: function(cmd) {
        return (cmd == 'SELECT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      value: 1000,
      max: 1000,
      min: 0
    },
    {
      class: 'Long',
      name: 'skip',
      visibility: function(cmd) {
        return (cmd == 'SELECT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      min: 0
    },
    {
      name: 'data',
      visibility: function(cmd) {
        return (cmd == 'PUT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'URL',
      name: 'postURL',
      hidden: true
    },
    {
      name: 'snippet',
      label: 'Snippet',
      documentation: 'show a specific type of request would look like in a given language.',
      view: { class: 'foam.nanos.dig.DigSnippetView' },
      expression: function(key, data, daoKey, cmd, format, q, limit, skip) {
        var query = false;
        var url = "/service/dig";

        if ( daoKey ) {
          url += "?";
          query = true;
          url += "dao=" + daoKey;
        }
        if ( cmd ) {
          url += query ? "&" : "?";
          query = true;
          url += "cmd=" + cmd.name.toLowerCase();
        }
        if ( format ) {
          url += query ? "&" : "?";
          query = true;
          url += "format=" + format.name.toLowerCase();
        }
        if ( key ) {
          url += query ? "&" : "?";
          query = true;
          url += "id=" + key;
        }
        if ( q ) {
          url += query ? "&" : "?";
          query = true;
          url += "q=" + encodeURIComponent(q);
        }
        if ( limit > 0 && limit != Number.MAX_SAFE_INTEGER && limit != 1000 ) {
          url += query ? "&" : "?";
          query = true;
          url += "limit=" + limit;
        }
        if ( skip > 0 && skip != Number.MAX_SAFE_INTEGER ) {
          url += query ? "&" : "?";
          query = true;
          url += "skip=" + skip;
        }
        this.postURL = url;

        if ( data ) {
          if ( data.length + url.length < this.MAX_URL_SIZE ) {
            url += query ? "&" : "?";
            query = true;
            url += "data=" + encodeURIComponent(data);
          }
        }

        return url;
      }
    },
    {
      class: 'String',
      name: 'result',
      value: 'No Request Sent Yet.',
      view: { class: 'foam.nanos.dig.ResultView' },
      visibility: 'RO'
    }
  ],

  actions: [
    {
      name: 'postButton',
      label: 'Send Request',
      code: async function() {
        var req = this.HTTPRequest.create({
          url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + this.postURL + "&sessionId=" + localStorage.defaultSession,
          method: 'POST',
          payload: this.data,
        }).send();

        var resp = await req.then(async function(resp) {
          var temp = await resp.payload.then(function(result) {
            return result;
          });
          return temp;
        }, async function(error) {
          var temp = await error.payload.then(function(result) {
            return result;
          });
          return temp;
        });
        this.result = resp;
      }
    }
  ]
});
