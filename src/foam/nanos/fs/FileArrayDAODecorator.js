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
    },
    {
      class: 'Boolean',
      name: 'skipToData',
      value: false
    }
  ],

  methods: [
    async function write(X, dao, obj, existing) {
      var newObj = this.skipToData ? obj.data : obj;
      if ( ! newObj ) {
        return Promise.resolve(obj);
      }
      await this.arrayRecursion(newObj, this);
      return Promise.resolve(obj);
    },

    async function processFiles(obj) {
      var props1 = obj.cls_.getAxiomsByClass(foam.nanos.fs.FileArray);
      var values = await Promise.all(props1.map(prop => Promise.all(prop.f(obj).map(f => this.processFile(f)))));
      values.forEach(f => f.forEach(f2 => {
        f2.dataString = undefined;
        f2.data = undefined;
      }));
      props1.forEach((prop, i) => prop.set(obj, values[i]));
      var props2 = obj.cls_.getAxiomsByClass(foam.core.FObjectProperty).filter((p) => ! foam.dao.DAOProperty.isInstance(p));
      for ( let prop of props2 ) {
        var subFObject = prop.f(obj);
        if ( ! subFObject ) continue;
        await this.processFiles(subFObject);
      }
    },

    async function processFile(f) {
      // We do not allow file update, so there is no point to send file again
      // if it is already stored and has id
      if ( f.id ) return f;
      if ( f.filesize <= this.maxStringDataSize ) {
        f.dataString = await this.encode(f.data.blob);
        f.data = undefined;
      } else {
        f.dataString = undefined;
      }
      return await this.fileDAO.put(f);
    },

    async function encode(file) {
      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload  = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      return await toBase64(file);
    },

    // Some models can include other models with file
    // Do recursive look up for fileArrays on inside models
    async function arrayRecursion(obj, self) {
      await self.processFiles(obj);
      let arr = obj.cls_.getAxiomsByClass(foam.core.Array);
      await Promise.all(arr.map(async a => await Promise.all(await a.f(obj).map(async f => await this.arrayRecursion(f, self)))));
    }
  ]
});
