/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.apploader',
  name: 'WebModelFileFetcher',
  requires: [
    'foam.net.HTTPRequest'
  ],
  properties: [
    {
      name: 'root',
      preSet: function(_, a) {
        if ( a.endsWith('/') )
          a = a.substring(0, a.lastIndexOf('/'));
        
        return a;
      }
    }
  ],
  methods: [
    function getFile(id) {
      return this.HTTPRequest.create({
        method: 'GET',
        url: this.root + '/' + id.replace(/\./g, '/') + '.js'
      }).send().then(function(payload) {
        return payload.resp.text();
      })
    },
  ]
});
