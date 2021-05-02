/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'UserCapabilityJunctionWAO',
  implements: [ 'foam.u2.wizard.WAO' ],
  flags: ['web'],

  imports: [
    'crunchService'
  ],

  requires: [
    'foam.core.Lock',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.u2.borders.LoadingLevel'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject',
      documentation: `
        The requested subject associated to the ucj. Should only be set
        when used by a permissioned back-office user.
      `
    },
    {
      name: 'saveLock',
      class: 'FObjectProperty',
      of: 'foam.core.Lock',
      documentation: `
        Save operations that are not marked 'disposable' will be queued using
        this lock.
      `,
      factory: function () {
        return this.Lock.create();
      }
    }
  ],

  methods: [
    function save(wizardlet, options) {
      options = {
        // 'reloadData' causes a wizardlet to reload from the server response
        reloadData: true,
        // 'disposable' prevents this save from being queued
        disposable: false,
        ...options
      };
      if ( wizardlet.loading ) {
        // If this is not a disposable save, it must be enqueued
        if ( ! options.disposable ) this.saveLock.then(
          this.save_.bind(this, wizardlet, options));

        return this.cancelSave_(wizardlet);
      }
      if ( ! wizardlet.isAvailable ) return this.cancelSave_(wizardlet);
      return this.save_(wizardlet, options);
    },
    function cancel(wizardlet) {
      let p = this.subject ? this.crunchService.updateJunctionFor(
        null, wizardlet.capability.id, null, null, this.subject.user, this.subject.realUser
      ) : this.crunchService.updateJunction(
        null, wizardlet.capability.id, null, null
      );
      return p.then(ucj => { return ucj; })
        .catch(this.reportNetworkFailure.bind(this, wizardlet, 'cancel', null));
    },
    function load(wizardlet) {
      if ( wizardlet.loading ) return;

      wizardlet.loading = true;
      let p = this.subject ? this.crunchService.getJunctionFor(
        null, wizardlet.capability.id, this.subject.user, this.subject.realUser
      ) : this.crunchService.getJunction(
        null, wizardlet.capability.id
      );
      return p.then(ucj => {
        this.load_(wizardlet, ucj);
      }).catch(this.reportNetworkFailure.bind(this, wizardlet, 'load', null));
    },
    function save_(wizardlet, options) {
      var wData = wizardlet.data ? wizardlet.data.clone() : null;
      wizardlet.loading = true;
      if ( wizardlet.reloadAfterSave && options.reloadData ) {
        wizardlet.loadingLevel = this.LoadingLevel.LOADING;
      }
      let p = this.subject ? this.crunchService.updateJunctionFor(
        null, wizardlet.capability.id, wData, null,
        this.subject.user, this.subject.realUser
      ) : this.crunchService.updateJunction(null,
        wizardlet.capability.id, wData, null
      );
      p = p.then((ucj) => {
        if ( wizardlet.reloadAfterSave && options.reloadData ) {
          wizardlet.loadingLevel = this.LoadingLevel.IDLE;
          this.load_(wizardlet, ucj);
        } else {
          wizardlet.status = ucj.status;
          wizardlet.loading = false;
        }
        return ucj;
      });
      p.catch(this.reportNetworkFailure.bind(this, wizardlet, 'save', options));
      this.saveLock.then(p);
      return p;
    },
    function load_(wizardlet, ucj) {
      wizardlet.status = ucj.status;

      // No 'of'? No problem
      if ( ! wizardlet.of ) {
        wizardlet.loading = false;
        return;
      }

      // Load UCJ data to wizardlet
      var loadedData = wizardlet.of.create({}, wizardlet);
      if ( ucj.data ) loadedData.copyFrom(ucj.data);

      // Set transient 'capability' property if it exists
      // TODO: Get rid of support for this as soon as possible
      var prop = wizardlet.of.getAxiomByName('capability');
      if ( prop ) prop.set(loadedData, wizardlet.capability);

      // Finally, apply new data to wizardlet
      if ( wizardlet.data ) {
        wizardlet.data.copyFrom(loadedData);
      } else {
        wizardlet.data = loadedData.clone(wizardlet.__subSubContext__);
      }

      foam.u2.wizard.Slot.blockFramed().then(() => {
        wizardlet.loading = false;
      });
    },
    function cancelSave_(w) {
      w.loadingLevel = this.LoadingLevel.IDLE;
      return Promise.resolve();
    },
    function reportNetworkFailure(w, op, args, e) {
      w.loadingLevel = this.LoadingLevel.IDLE;
      w.loading = false;
      console.error('WAO caught network failure', e);
      setTimeout(() => {
        this[op](w, args).then(() => {
          w.clearProperty('indicator');
        });
      }, 5000);
      w.reportNetworkFailure(e, {
        retry: 5000 // to indicate to the user if we want this
      });
    }
  ]
});
