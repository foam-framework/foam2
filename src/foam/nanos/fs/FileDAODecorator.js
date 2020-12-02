/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
    },
    {
      class: 'Long',
      name: 'maxStringDataSize',
      value: 1024 * 3
    }
  ],

  methods: [
    function write(X, dao, obj, existing) {
      var self = this;
      var i = 0;
      var props = obj.cls_.getAxiomsByClass(foam.nanos.fs.FileProperty);

      return Promise.resolve().then(async function a() {
        var prop = props[i++];

        if ( ! prop ) return obj;

        var file = prop.f(obj);

        if ( ! file ) return a();

        // We do not allow file update, so there is no point to send file again
        // if it is already stored and has id
        if ( file.id ) return file;

        if ( file.filesize <= self.maxStringDataSize ) {
          file.dataString = await self.encode(file.data.blob);
          file.instance_.data = undefined;
        } else {
          file.dataString = undefined;
        }
        return self.fileDAO.put(file).then(function (b) {
          prop.set(obj, b);
          return a();
        });
      });
    },

    async function encode(file) {
      const toBase64 = file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
      });
      return await toBase64(file);
    },
  ]
});
