/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
      var props = obj.cls_.getAxiomsByClass(foam.nanos.fs.FileArray);

      return Promise.resolve().then(function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var files = prop.f(obj);

        if ( ! files ) return a();

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
