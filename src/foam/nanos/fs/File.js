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
      class: 'String',
      name: 'id',
      documentation: 'GUID'
    },
    {
      class: 'String',
      name: 'filename',
      documentation: 'Filename'
    },
    {
      class: 'Long',
      name: 'filesize',
      documentation: 'Filesize'
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
  package: 'foam.core',
  name: 'FileArray',
  extends: 'foam.core.FObjectArray',

  properties: [
    [ 'of', 'foam.nanos.fs.File' ],
    [ 'tableCellView', function () {} ]
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

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileArrayDAODecorator',
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
      var props = obj.cls_.getAxiomsByClass(foam.core.FileArray);

      return Promise.resolve().then(function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var files = prop.f(obj);

        if ( ! files ) return obj;

        var promiseList = [];
        for ( var j = 0 ; j < files.length ; j++ ) {
          promiseList.push(self.fileDAO.put(files[j]));
        }

        return Promise.all(promiseList).then(function (b) {
          prop.set(obj, b);
          return a();
        });
      });
    }
  ]
});
