/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.internal',
  name: 'WizardletAutoSaveSlot',
  extends: 'foam.core.SimpleSlot',

  properties: [
    {
      name: 'delay',
      class: 'Int',
      value: 200
    },
    'other',
    'timeout_',
    'cleanup_', // detachable to cleanup old subs when obj changes
  ],

  methods: [
    function init() {
      var attach = function(delay, other) {
        this.cleanup();
        this.cleanup_ = foam.core.FObject.create();
        this.cleanup_.onDetach(other.sub(() => {
          if ( this.timeout_ ) {
            clearTimeout(this.timeout_);
          }
          this.timeout_ = setTimeout(this.update.bind(this, other), delay);
        }));
      };
      foam.core.ExpressionSlot.create({
        args: [this.delay$, this.other$],
        code: attach,
        obj: this
      });
      attach.call(this, this.delay, this.other);
    },
    function cleanup() { this.cleanup_ && this.cleanup_.detach(); },
    function update(s) {
      console.log('update happen', this);
      this.clearProperty('timeout_');
      this.value = s.get();
    }
  ]

});
