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
    {
      name: 'saveWarnDelay',
      class: 'Int',
      value: 3500
    },
    {
      name: 'loadingLevel',
      class: 'Enum',
      of: 'foam.u2.borders.LoadingLevel'
    },
    'saveEvent',
    'other',
    'timeout_',
    'animationTimeout_',
    'cleanup_', // detachable to cleanup old subs when obj changes
  ],

  methods: [
    function init() {
      // Save event clears any pending saves
      this.saveEvent.sub(() => {
        this.timeout_ && clearTimeout(this.timeout_);
        this.animationTimeout_ && clearTimeout(this.animationTimeout_);
      });
      var attach = function(delay, other) {
        this.cleanup();
        this.cleanup_ = foam.core.FObject.create();
        this.cleanup_.onDetach(other.sub(() => {
          // Clear existing timeouts
          this.timeout_ && clearTimeout(this.timeout_);
          this.animationTimeout_ && clearTimeout(this.animationTimeout_);
          // Hide loading spinner only if it was in warning state
          if ( this.loadingLevel == this.LoadingLevel.PENDING ) {
            this.loadingLevel = this.LoadingLevel.IDLE;
          }
          this.animationTimeout_ = setTimeout(() => {
            this.loadingLevel = this.LoadingLevel.PENDING;
          }, this.saveWarnDelay);
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
      this.animationTimeout_ && clearTimeout(this.animationTimeout_);
      this.clearProperty('timeout_');
      this.clearProperty('animationTimeout_');
      this.value = s.get();
    }
  ]

});
