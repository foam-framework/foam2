foam.CLASS({
  package: 'foam.demos.flow2',
  name: 'UserDetailView',
  extends: 'foam.u2.DetailView',
  methods: [
    {
      class: 'foam.flow.Method',
      name: 'initE_',
      markup: `
<grid-layout cols="3">

<cell>
<card>
<title>Balance</title>
$$balance
</card>
</cell>

<cell>
<card>
<title>Overview</title>
<grid-layout cols="3">
<cell>$$createdOn</cell>
<cell>$$createdBy</cell>
<cell>$$accountType</cell>
<cell>$$accontId</cell>
<cell>bar</cell>
<cell>foo</cell>
</grid-layout>
</card>
</cell>

<cell>
<card>
<title>Other Info</title>
<grid-layout>
<cell>$$createdOn</cell>
<cell>$$createdBy</cell>
<cell>$$accountType</cell>
<cell>$$accontId</cell>
<cell>$$averageTransactionSize</cell>
<cell>$$fundedBy</cell>
</grid-layout>
</card>
</cell>

<cell rowspan="3">
<card>
<title>Transactions</title>
<tabs>
<tab>
<title>Pending</title>
$$pendingTransactions
</tab>
<tab>
<title>Recent</title>
$$recentTransactions
</tab>
</tabs>
</card>
</cell>

</grid-layout>
`,
    },
    function initE() {
      this.initE_.call(this, this.__subSubContext__);
    }
  ]
});
