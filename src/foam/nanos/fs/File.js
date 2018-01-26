/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'File',

  documentation: 'Represents a file',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
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
      class: 'Blob',
      name: 'data',
      documentation: 'File data'
    }
  ]
});

foam.CLASS({
  package: 'foam.core',
  name: 'File',
  extends: 'foam.core.FObjectProperty',

  properties: [
    [ 'of', 'foam.nanos.fs.File' ],
    [ 'tableCellView', function () {} ],
    [ 'view', { class: 'foam.u2.view.FileView' } ]
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
