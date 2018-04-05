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

  tableColumns: [
    'id',
    'daoKey',
    'cmd',
    'format',
    'owner'
  ],

  searchColumns: [],

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
      expression: function(key, data, email, subject, daoKey, cmd, format) {
        var url = "/service/dig?dao=" + daoKey + "&cmd=" + cmd + "&format=" + format.name.toLowerCase();

        if ( key )     url += "?id=" + key;
        if ( data )    url += "?data=" + data;
        if ( email )   url += "?email=" + email;
        if ( subject ) url += "?subject=" + subject;

        return url;
      }
    }
  ],

  methods: [
  ]
});
