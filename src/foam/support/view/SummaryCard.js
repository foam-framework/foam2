
foam.CLASS({
  package: 'foam.support.view',
  name: 'SummaryCard',
  extends: 'foam.u2.View',

  documentation: 'Cards for summary views',

	css: `
		^{
			display: inline-block;
			width: 20%;
			background: white;
			height: 100px;
			vertical-align: top;
			margin-left: 6px;
			border-radius: 3px;
			overflow: hidden;
		}
		^ .label{
			position: relative;
			top: 35;
			left: 10;
			font-size: 12px;
		}
		^ .count{
			font-size: 30px;
			font-weight: 300;
			line-height: 1;
			position: relative;
			top: 20;
			left: 20;
		}
		^ .amount{
			line-height: 0.86;
			text-align: left;
			color: #093649;
			opacity: 0.6;
			float: right;
			margin-right: 15px;
		}
	`,

  properties: [
    'count',
    'status'
 	],

  methods: [
    function initE(){
      var self = this;
      this
        .addClass(this.myClass())
          .start().addClass('count').add(this.count$).end()
          .start().addClass(this.status + ' label special-status-tag').add(this.status).end()
        .end()
    },
  ]
});