/**
* @license
* Copyright 2020 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Language',
  documentation: 'Language codes.',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  ids: [ 'code', 'variant' ],
  
  properties: [
    {
      class: "String",
      name: "code"
    },
    {
      class: "String",
      name: "name",
      factory: function() {
        return this.variant === "" ? this.code : this.code + "-" + this.variant
      }
    },
    {
      class: "Boolean",
      name: "enabled",
      value: true
    },
    {
      class: "String",
      name: "variant",
      value: ""
    }
  ],
  methods: [
    function toSummary() {
      return this.toString() + ' - ' + this.natureCode;
    },
    {
      name: 'toString',
      code: function() {
        return this.variant === "" ? this.code : this.code + "-" + this.variant
      },
      javaCode: `
        return "".equals(getVariant()) ? getCode() : getCode() + "-" + getVariant();
      `
    },
  ]
});
