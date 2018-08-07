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
		height: 20px;
		border-radius: 100px;
		font-family: Roboto;
		font-weight: normal;
		font-style: normal;
		font-stretch: normal;
		line-height: 1.67;
		letter-spacing: 0.2px;
		text-align: center;
		color: #ffffff;
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
  .New {
    width: 35px;
    height: 20px;
    border-radius: 100px;
    background-color: #eedb5f;
  }
  .Updated {
    width: 60px;
    height: 20px;
    border-radius: 100px;
    background-color: #093649;
  }
  .Open {
    width: 49px;
    height: 20px;
    border-radius: 100px;
    background-color: #ee5f71;
  }
  .Pending {
    width: 55px;
    height: 20px;
    border-radius: 100px;
    background-color: #59a5d5;
  }
  .Solved {
    width: 50px;
    height: 20px;
    border-radius: 100px;
    background-color: #a4b3b8;
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
          .start().addClass(this.status).addClass('label').add(this.status).end()
        .end()
    },
  ]
});