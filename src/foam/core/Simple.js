/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
  A Simple Property skips the regular FOAM Property getter/setter/instance_
  mechanism. In gets installed on the CLASS as a Property constant, but isn't
  added to the prototype at all. From this point of view, it's mostly just for
  documentation. Simple Properties are used only in special cases to maximize
  performance and/or minimize memory use.
  Used for MDAO indices and Slots.

  USE WITH EXTREME CAUTION (OR NOT AT ALL).
*/
foam.CLASS({
  package: 'foam.core',
  name: 'Simple',
  extends: 'Property',

  methods: [
    function installInProto(proto) {}
  ]
});
