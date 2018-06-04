/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'HTMLValidator',
  extends: 'foam.u2.DefaultValidator',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    function sanitizeText(text) {
      // TODO: validate text
      return text;
    }
  ]
});


// An Element which does not escape HTML content
foam.CLASS({
  package: 'foam.u2',
  name: 'HTMLElement',
  extends: 'foam.u2.Element',

  requires: [ 'foam.u2.HTMLValidator' ],

  exports: [ 'validator as elementValidator' ],

  properties: [
    {
      class: 'Proxy',
      of: 'foam.u2.DefaultValidator',
      name: 'validator',
      factory: function() {
        // Note that HTMLValidator is a singleton so only one instance of
        // HTMLValidator should ever be created here.
        return this.HTMLValidator.create()
      }
    }
  ]
});
