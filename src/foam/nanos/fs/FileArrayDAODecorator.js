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
      var props = obj.cls_.getAxiomsByClass(foam.nanos.fs.FileArray);

      var promises = props.map((prop) => {
        var files = prop.f(obj);
        return Promise.all(files.map((f) => self.fileDAO.put(f)));
      });

      return Promise.all(promises).then((values) => {
        props.forEach((prop, i) => {
          prop.set(obj, values[i]);
        });
        return obj;
      });
    }
  ]
});
