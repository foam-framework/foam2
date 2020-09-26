/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
 package: 'foam.u2',
 name: 'MDCurrencyView',
 code: function() {
    var m = foam.json.objectify(foam.u2.CurrencyView.model_);
    m.name = 'MDCurrencyView';
    m.extends = 'foam.u2.property.MDFloatView';
  }
});
