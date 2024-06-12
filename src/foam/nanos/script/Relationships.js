/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.RELATIONSHIP({
  sourceModel: 'foam.nanos.script.Script',
  targetModel: 'foam.nanos.script.ScriptEvent',
  forwardName: 'events',
  inverseName: 'owner',
  cardinality: '1:*',
  sourceProperty: {
    section: 'scriptEvents',
    visibility: 'RO',
    tableCellFormatter: function(value, obj, axiom) {
      var dao = this.__subSubContext__[foam.String.daoize(this.type)];
      if ( dao ) {
        dao
        .find(value)
        .then((entry) => this.add(entry.id))
        .catch((error) => {
          this.add(value);
        });
      }
    }
  },
  targetProperty: {
    label: 'Script Id',
    visibility: 'RO',
    tableWidth: 300,
    javaPostSet: `
      setScriptId(val);
    `
  }
});
