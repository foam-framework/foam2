/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.debug',
  name: 'DebugWAO',
  extends: 'foam.u2.wizard.ProxyWAO',
  flags: ['web'],

  topics: ['waoEvent'],

  properties: [
    {
      class: 'Boolean',
      name: 'listen',
      value: true
    },
    {
      class: 'Boolean',
      name: 'trap'
    }
  ],

  methods: [
    async function save(w) {
      if ( this.listen ) this.waoEvent.pub('save', w);
      if ( this.trap ) return;
      return await this.SUPER(w);
    },
    async function load(w) {
      if ( this.listen ) this.waoEvent.pub('load', w);
      if ( this.trap ) return;
      return await this.SUPER(w);
    }
  ]
});
