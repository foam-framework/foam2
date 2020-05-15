/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.extraconfig',
  name: 'ConfigView',
  extends: 'foam.u2.View',
  requires: [
    'foam.nanos.extraconfig.ExtraConfig'
  ],
  properties: [
    'exportConfigArray',
    'exportConfigAddOns'
  ],
  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this.add(this.slot(function(exportConfigAddOns) {
        return self.E().forEach(exportConfigAddOns, function(a) {
          a.typeOfConfig$find.then((v) => {
            var view = { class: v.viewClass };
            if ( a.doesProvideOptions && a.optionsChoice === 'Array' ) {
              view.choices = a.options;
            } else if ( a.doesProvideOptions && a.optionsChoice === 'DAO' ) {
              view.dao = self.__context__[a.daoSource];
              view.objToChoice = function(o) {
                return [o.id, o.id];
              };
            }
            return this.addClass('label').start().add(a.labelForConfig).end()
              .start()
                .startContext({ data: obj })
                  .add(obj.CONFIG_VALUE.clone().copyFrom({
                    view: view
                  }))
                .endContext()
            .end();
          });
          var obj = self.ExtraConfig.create({ exportMetadata: a });
          obj.configValue$.sub(function() {
            if ( obj.configValue ) {
              if ( obj.configValue.toSummary )
                obj.configValueString = obj.configValue.toSummary();
              else
                obj.configValueString = obj.configValue.toString();
            } else {
              obj.configValueString = '';
            }              
          });
          self.exportConfigArray.push(obj);
        });
      }));
    }
  ]
});