/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'foam.nanos.logger',
    name: 'DiscardLogger',
    implements: [ 'foam.nanos.logger.Logger' ],
    extends: [ 'ProxyLogger' ],

    properties: [
        {
          name: 'discardInfo',
          class: 'Boolean',
          value: 'false'
        },
        {
          name: 'discardWarning',
          class: 'Boolean',
          value: 'false'
        },
        {
          name: 'discardError',
          class: 'Boolean', 
          value: 'false'
        },        
        {
          name: 'discardDebug',
          class: 'Boolean',
          value: 'false'
        }
      ]
  });
  