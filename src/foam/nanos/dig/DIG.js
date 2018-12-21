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

  requires: ['foam.net.web.HTTPRequest'],

  tableColumns: [
    'id',
    'daoKey',
    'cmd',
    'format',
    'owner'
  ],

  searchColumns: [],

  constants: [
    {
      name: 'MAX_URL_SIZE',
      value: 2000,
      type: 'int'
    }
  ],

  properties: [
    'id',
    {
      class: 'String',
      name: 'daoKey',
      label: 'DAO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.nSpecDAO
            .where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'))
            .orderBy(foam.nanos.boot.NSpec.ID),
          objToChoice: function(nspec) {
            return [nspec.id, nspec.id];
          }
        });
      }
    },
    'cmd',
    'format',
    {
      class: 'String',
      name: 'dao',
      hidden: true,
      transient: true,
      postSet: function(old, nu) {
        this.daoKey = nu;
      }
    },
    {
      class: 'String',
      name: 'q',
      label: 'Query'
    },
    {
        class: 'String',
        name: 'key'
    },
    {
      class: 'EMail',
      displayWidth: 100,
      name: 'email'
    },
    {
      class: 'EMail',
      displayWidth: 100,
      name: 'subject'
    },
    'data',
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'dataFile',
      label: 'DataFile',
      documentation: 'dig file to put data',
      view: { class: 'foam.nanos.dig.DigFileUploadView', data: this.dataFile$ },
    },
    {
      class: 'URL',
      name: 'postURL',
      hidden: true
    },
    {
      class: 'URL',
      // TODO: appears not to work if named 'url', find out why.
      name: 'digURL',
      label: 'URL',
      displayWidth: 120,
      view: 'foam.nanos.dig.LinkView',
      setter: function() {}, // Prevent from ever getting set
      expression: function(key, data, email, subject, daoKey, cmd, format, q, dataFile) {

        var query = false;
        var url = "/service/dig";

        if ( daoKey ) {
          url += query ? "&" : "?";
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
        if ( email ) {
          url += query ? "&" : "?";
          query = true;
          url += "email=" + email;
        }
        if ( subject ) {
          url += query ? "&" : "?";
          query = true;
          url += "subject=" + subject;
        }
        if ( q ) {
          url += query ? "&" : "?";
          query = true;
          url += "q=" + q;
        }
        this.postURL = url;
        if ( data ) {
          if ( data.length + url.length < this.MAX_URL_SIZE ) {
            url += query ? "&" : "?";
            query = true;
            url += "data=" + data;
          }
        }
        if ( dataFile ) {
          url += query ? "&" : "?";
          query = true;
          url += "&fileaddress=" + dataFile.address;
        }

        return encodeURI(url);
      }
    },
    {
      class: 'String',
      name: 'result',
      value: 'No Request Sent Yet.',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 120 },
      visibility: 'RO'
    }
  ],

  actions: [
    {
      name: 'postButton',
      label: 'Send Request',
      code: async function() {
        var req = this.HTTPRequest.create({
          url: window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + this.postURL,
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
