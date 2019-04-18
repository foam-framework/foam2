foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'GridLayout',
  extends: 'foam.u2.Element',
  methods: [
    function initE() {
      this.add('GRID_LAYOUT');
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'UserDetailView',
  extends: 'foam.u2.DetailView',
  methods: [
    {
      class: 'foam.flow.Method',
      name: 'initE_',
      markup: `
<gridlayout cols="3">

<cell>
<card>
<title>Balance</title>
$$balance
</card>
</cell>

<cell>
<card>
<title>Overview</title>
<gridlayout cols="3">
<cell>$$createdOn</cell>
<cell>$$createdBy</cell>
<cell>$$accountType</cell>
<cell>$$accontId</cell>
<cell>bar</cell>
<cell>foo</cell>
</gridlayout>
</card>
</cell>

<cell>
<card>
<title>Other Info</title>
<gridlayout>
<cell>$$createdOn</cell>
<cell>$$createdBy</cell>
<cell>$$accountType</cell>
<cell>$$accontId</cell>
<cell>$$averageTransactionSize</cell>
<cell>$$fundedBy</cell>
</gridlayout>
</card>
</cell>

<cell rowspan="3">
<card>
<title>Transactions</title>
<tabs>
<tab label="Pending">
Pending Transcations
$$pendingTransactions
</tab>
<tab label="Recent">
Recent Transactions
$$recentTransactions
</tab>
</tabs>
</card>
</cell>

</gridlayout>
`,
    },
    function initE() {
      var x = this.__subSubContext__;

      x.registerElement(foam.demos.flow2.GridLayout);
      x.registerElement(foam.u2.Tabs, 'tabs');
      x.registerElement(foam.u2.Tab, 'tab');
      this.initE_.call(this, this.__subSubContext__);
    }
  ]
});
