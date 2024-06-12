/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.internal',
  name: 'WizardletAutoSaveSlot',
  extends: 'foam.core.SimpleSlot',

  requires: [
    'foam.u2.borders.LoadingLevel'
  ],

  properties: [
    {
      name: 'delay',
      class: 'Int',
      value: 5000
    },
    'saveEvent',
    'other',
    'timeout_',
    'cleanup_', // detachable to cleanup old subs when obj changes
  ],

  methods: [
    function init() {
      // Save event clears any pending saves
      this.saveEvent.sub(() => {
        this.timeout_ && clearTimeout(this.timeout_);
      });
      var attach = function(delay, other) {
        this.cleanup();
        this.cleanup_ = foam.core.FObject.create();
        this.cleanup_.onDetach(other.sub(() => {
          // Clear existing timeouts
          this.timeout_ && clearTimeout(this.timeout_);
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
      this.clearProperty('timeout_');
      this.value = s.get();
    }
  ]

});
