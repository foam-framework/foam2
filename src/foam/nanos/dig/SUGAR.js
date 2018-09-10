/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'SUGAR',
  extends: 'foam.nanos.http.DefaultHttpParameters',

  documentation: 'Service Unified GAteway Relay - Perform non-DAO operations against a web service',

  tableColumns: [
    'id',
    'serviceKey',
    'method',
    'cmd',
    'format',
    'owner'
  ],

  searchColumns: [],

  properties: [
    'id',
    {
      class: 'String',
      name: 'serviceKey',
      label: 'SERVICE',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.nSpecDAO
            //.where(E.AND(E.EQ(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'), false), E.EQ(foam.nanos.boot.NSpec.SERVE, false)) )
            .where(E.EQ(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'), false))
            .orderBy(foam.nanos.boot.NSpec.ID),
          objToChoice: function(nspec) {
            return [nspec.id, nspec.id];
          }
        });
      }
    },
    {
      class: 'String',
      name: 'method',
      label: 'Method',
      view: function(_, X) {
        return X.data.slot(function(serviceKey) {
        if ( serviceKey == 'undefined' ) {
          return;
        }
        //debugger;
          alert( this.__context__[serviceKey] );
          //alert( X[serviceKey]); //.getOwnAxiomsByClass(foam.core.Method) );
          //alert( this.__context__.lookup(serviceKey, true) );
          var map = {
            'exchangeRate': [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
            'serviceKey': [ 'getRateFromSource', 'getRateFromTarget', 'fetchRates', 'acceptRate' ]
            // X.serviceKey.getRateFromSourceserviceKey : [ X.serviceKey.getRateFromSource ]
          };
          return foam.u2.view.ChoiceView.create({choices: map[serviceKey], data$: this.method$});
        });
      }

      //javaFactory: 'return getX().get("exchangeRate").getClass().getMethods()[0].toString();'
    },
////   {
////      class: 'String',
////      name: 'method'
////    },
    {
      class: 'String',
      name: 'parameters'
    },
    'cmd',
    'format',
//    {
//      class: 'String',
//      name: 'service',
//      hidden: true,
//      transient: true,
//      postSet: function(old, nu) {
//        this.serviceKey = nu;
//      }
//    },
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
      class: 'URL',
      // TODO: appears not to work if named 'url', find out why.
      name: 'digURL',
      label: 'URL',
      displayWidth: 120,
      view: 'foam.nanos.dig.LinkView',
      setter: function() {}, // Prevent from ever getting set
      expression: function(key, data, email, subject, serviceKey, cmd, format, q, method, parameters) {
        var query = false;
        var url = "/service/sugar";

        if ( serviceKey ) {
          url += query ? "&" : "?";
          query = true;
          url += "service=" + serviceKey;
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
        if ( data ) {
          url += query ? "&" : "?";
          query = true;
          url += "data=" + data;
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
        if ( method ) {
          url += query ? "&" : "?";
          query = true;
          url += "method=" + method;
        }
        if ( parameters ) {
          url += query ? "&" : "?";
          query = true;
          url += "parameters=" + parameters;
        }

        return encodeURI(url);
      }
    }
  ],

  methods: [
  ]
});
