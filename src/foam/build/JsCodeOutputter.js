/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'JsCodeOutputter',
  requires: [
    'foam.core.Script',
    'foam.build.Lib',
    'foam.build.output.CodeSerializerImpl',
    'foam.build.output.ValueReplacingSerializer',
    'foam.dao.Relationship',
    'foam.core.EnumModel',
    'foam.core.InterfaceModel',
  ],
  methods: [
    function stringify(x, v) {
      var f = this.Relationship.isInstance(v) ? 'RELATIONSHIP' :
        this.EnumModel.isInstance(v) ? 'ENUM' :
        this.InterfaceModel.isInstance(v) ? 'INTERFACE' :
        this.Script.isInstance(v) ? 'SCRIPT' :
        this.Lib.isInstance(v) ? 'LIB' :
        'CLASS';

      var serializer = this.ValueReplacingSerializer.create({
        delegate: this.CodeSerializerImpl.create()
      });
      x = x.createSubContext({out: serializer})
      serializer.output(x, this.Lib.isInstance(v) ? v.json : v);
      return `foam.${f}(${serializer.getString()});`;
    }
  ],
});
