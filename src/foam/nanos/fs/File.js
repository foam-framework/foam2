/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'File',

  documentation: 'Represents a file',

  ids: [ 'data' ],

  properties: [
    {
      class: 'String',
      name: 'filename',
      documentation: 'Filename'
    },
    {
      class: 'String',
      name: 'mimeType',
      documentation: 'File mime type'
    },
    {
      class: 'Reference',
      of: 'foam.blob.Blob',
      name: 'data',
      documentation: 'File data'
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileDAODecorator',
  extends: 'foam.dao.AbstractDAODecorator',

  imports: [
    'fileDAO'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var self = this;
      var i = 0;
      var props = obj.cls_.getAxiomsByClass(foam.core.File);

      return Promise.resolve().then(function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var file = prop.f(obj);

        if ( ! file ) return obj;

        return self.fileDAO.put(file).then(function (b) {
          prop.set(obj, b);
          return a();
        });
      });
    }
  ]
});
