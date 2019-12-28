foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'GeneralWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  imports: [
    'stack'
  ],

  documentation: `This wizard handles data being the final obj we wish to create,
  but handles using a seperate model to build the final obj.
  buildModel needs to:
  1) have property isSaveDraftAvailable
  2) have method saveDraft(x) // saves progress as user goes through buildModel
  3) have method submit(x) // saves the finished buildModel
  4) have property isSaveAndExitAvailable
  4) have method saveAndExit(x) // user saves progress and leaves.
     // Should only be available for buildModels that are stored in there own daos.`,

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      background-color: white;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      z-index: 950;
      margin: 0;
      padding: 0;
      overflow: scroll;
    }

    ^logo {
      height: 22px;
    }

    ^header {
      height: 64px;
      border: solid 1px #edf0f5;
      justify-content: space-between;
      align-items: center;
      display: flex;
      padding: 0 128px;
    }

    ^ .foam-u2-ProgressView {
      margin: 0;
      width: 100%;

      /* Reset the default appearance */
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
    }

    ^ progress[value]::-webkit-progress-bar {
      background-color: white;
    }

    ^ progress[value]::-webkit-progress-value {
      background-color: #604aff;
      -webkit-transition: all 0.1s ease-in;
      transition: all 0.1s ease-in;
    }

    ^ .foam-u2-wizard-FacetedWizardView-sections {
      flex-grow: 1;
    }

    ^ .foam-u2-wizard-FacetedWizardView-navigation-bar {
      height: 72px;

      background-color: white;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #edf0f5;

      align-items: center !important;
    }
    ^ .foam-u2-view-RadioView-horizontal-radio {
      margin-top: 10px;
    }
    ^ .inner-card {
      padding: 15px 0px;
    }
  `,

  messages: [
    { name: 'SUCCESS_SUBMIT_MESSAGE', message: 'Business profile submitted successfully.' }
  ],

  reactions: [
    ['buildModel', 'propertyChange', 'saveDraft']
  ],

  properties: [
    'buildModel',
    {
      class: 'Int',
      name: 'currentPage',
      expression: function(lastUpdate, currentIndex, sections) {
        var currentPage = 0;
        for ( var i = 0; i < currentIndex; i++ ) {
          if ( sections[i].createIsAvailableFor(this.buildModel$).get() ) {
            currentPage++;
          }
        }
        return currentPage + 1;
      }
    },
    {
      class: 'Int',
      name: 'numPages',
      expression: function(lastUpdate, buildModel, sections) {
        return sections
          .filter((s) => s.createIsAvailableFor(this.buildModel$).get())
          .length;
      }
    },
    {
      name: 'progress',
      expression: function(currentPage, numPages) {
        if ( currentPage < 0 ) return 0;
        if ( currentPage > numPages ) return 100;
        return (currentPage / numPages) * 100;
      },
      view: { class: 'foam.u2.ProgressView' }
    },
    {
      name: 'sectionView',
      value: { class: 'net.nanopay.sme.onboarding.ui.WizardPageView' }
    },
    {
      name: 'submitted',
      type: 'Boolean'
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('header'))
          .start({ class: 'foam.u2.tag.Image', data: 'images/ablii-wordmark.svg' }).addClass(this.myClass('logo')).end()
          .startContext({ data: this })
            .start()
              .tag(this.SAVE_AND_EXIT, {
                buttonStyle: 'TERTIARY',
                size: 'LARGE'
              })
              .addClass(this.myClass('save-exit'))
            .end()
          .endContext()
        .end()
        .startContext({ data: this })
          .add(this.PROGRESS)
        .endContext()
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E()
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.buildModel$
              });
          })).addClass(this.myClass('wizard-body'))
          .startContext({ data: this })
            .start(self.Cols)
              .addClass(this.myClass('footer'))
              .start()
                .tag(this.PREV, {
                  buttonStyle: 'TERTIARY',
                  icon: '/images/ablii/gobackarrow-grey.svg',
                  size: 'LARGE'
                })
              .end()
              .start()
                .tag(this.NEXT, {
                  size: 'LARGE',
                  label: 'Continue'
                })
                .tag(this.SUBMIT, { size: 'LARGE' })
              .end()
            .end()
          .endContext()
        .end();
    }
  ],
  listeners: [
    {
      name: 'saveDraft',
      isMerged: true,
      mergeDelay: 2000,
      code: function(x) {
        if ( this.buildModel.isSaveDraftAvailable ) {
          this.buildModel.saveDraft(x);
        }
      }
    }
  ],
  actions: [
    {
      name: 'prev',
      label: 'Go back',
      code: function() {
        if ( this.prevIndex == -1 ) {
          this.stack.back();
        }
        this.currentIndex = this.prevIndex;
      }
    },
    {
      name: 'submit',
      label: 'Finish',
      isAvailable: function(buildModel$errors_, nextIndex) {
        return ! buildModel$errors_ && nextIndex === -1;
      },
      code: function(x) {
        this.buildModel.submit(x);
      }
    },
    {
      name: 'saveAndExit',
      label: 'Save & Exit',
      isAvailable: function(buildModel$isSaveAndExitAvailable) {
        return buildModel$isSaveAndExitAvailable;
      },
      code: function(x) {
        this.buildModel.saveAndExit(x);
      }
    }
  ]
});
