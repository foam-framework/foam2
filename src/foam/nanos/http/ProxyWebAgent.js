/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.http',
  name: 'ProxyWebAgent',
  implements: [ 'foam.nanos.http.WebAgent' ],

  documentation: '',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.nanos.http.WebAgent',
      name: 'delegate'
    }
  ],

  // methods: [
  //   {
  //     name: 'execute',
  //     code: function execute(x) {
  //       this.delegate.execute(x);
  //     },
  //     javaCode: 'if ( this.delegate != null ) this.delegate.execute(x);'
  //   }
  // ],

//   axioms: [
//     {
//       buildJavaClass: function(cls) {
//         cls.extras.push(`
// public ProxyWebAgent() {}
// `);
//       }
//     }
//   ]
});
