/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net.node',
  name: 'CORSHandler',
  extends: 'foam.net.node.BaseHandler',
  flags: ['node'],
  documentation: `Handler decorator that adds a CORS header.`,

  properties: [
    {
      class: 'Proxy',
      of: 'foam.net.node.Handler',
      name: 'delegate',
      required: true
    },
    {
      class: 'String',
      name: 'allowOrigin',
      documentation: `
        Value for Access-Control-Allow-Origin header.
      `
    },
    {
      class: 'StringArray',
      name: 'allowMethods',
      documentation: `
        Value for Access-Control-Allow-Methods header.
      `,
      value: ['GET']
    },
    {
      class: 'StringArray',
      name: 'allowHeaders',
      documentation: `
        Value for Access-Control-Allow-Methods header.
      `,
      value: []
    }
  ],

  methods: [
    function handle(req, res) {
      res.setHeader('Access-Control-Allow-Origin', this.allowOrigin);
      if ( this.allowMethods.length > 0 ) {
        res.setHeader('Access-Control-Allow-Methods',
          this.allowMethods.join(','));
      }
      if ( this.allowHeaders.length > 0 ) {
        res.setHeader('Access-Control-Allow-Headers',
          this.allowHeaders.join(','));
      }
      if ( req.method == 'OPTIONS' ) {
        res.setHeader('Allow', this.allowMethods.join(','));
        this.sendMessage(req, res, 204, 'No Content' + req.urlString);
        return true;
      }
      return this.delegate.handle(req, res);
    }
  ]
});
