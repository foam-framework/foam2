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
  requires: [
    'foam.nanos.fs.File'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'Long',
      name: 'maxStringDataSize',
      value: 1024 * 3
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var self  = this;
      var props = obj.cls_.getAxiomsByClass(foam.nanos.fs.FileArray);

      var promises = props.map((prop) => {
        let files = prop.f(obj);
        return Promise.all(files.map(async f => {

          // We do not allow file update, so there is no point to send file again
          // if it is already stored and has id
          if ( f.id ) return f;

          if ( f.filesize <= this.maxStringDataSize ) {
            f.dataString = await this.encode(f.data.blob);
            f.data = undefined;
          } else {
            f.dataString = undefined;
          }
          return self.fileDAO.put(f);
        }));
      });

      return Promise.all(promises).then((values) => {
        props.forEach((prop, i) => {
          prop.set(obj, values[i]);
        });
        return obj;
      });
    },

    async function encode(file) {
      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload  = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      return await toBase64(file);
    }
  ]
});
