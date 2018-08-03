/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.apploader',
  name: 'JSON2ModelFileDAO',
  documentation: 'Model DAO that reads json2 models.',
  extends: 'foam.dao.AbstractDAO',
  requires: [
    'foam.json2.Deserializer',
  ],
  properties: [
    {
      name: 'd',
      factory: function() {
        return this.Deserializer.create({parseFunctions: true});
      },
    },
    'fetcher',
  ],
  methods: [
    {
      name: 'find_',
      code: function(x, id) {
        var self = this;
        var promise = self.fetcher.getFile(id);
        return promise.then(function(text) {
          return self.d.aparseString(x, text);
        }, function() { return null });
      }
    }
  ]
});
