/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'Phone',

  documentation: 'Phone number information.',

  properties: [
    {
      class: 'Boolean',
      name: 'verified'
    },
    {
      class: 'PhoneNumber',
      name: 'number',
      required: true,
      validateObj: function (number) {
        var numberRegex = /([+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}/g;
        
        if ( ! numberRegex.test(number) ) {
          return 'Invalid phone number.';
        }
      },
      preSet: function(o, n){
        return n.replace(/[- )(]/g,'');
      }
    }
  ]
});
