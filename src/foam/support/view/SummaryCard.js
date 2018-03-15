foam.CLASS({
	package:'foam.support.view',
  name:'SummaryCard',
	extends: 'foam.u2.View',
	
  css:`
		^  
		{
			width: 228px;
			height: 92px;
			display:inline-block;
		}
		^ .firstdiv 
		{       
			width: 223px;
			height: 92px;
			border-radius: 2px;
			margin-left:0px;
			margin-bottom:140px;
		}
		^ .label
		{
			width: 15px;
			height: 30px;
			font-family: Roboto;
			font-size: 30px;
			font-weight: 300;
			font-style: normal;
			font-stretch: normal;
			line-height: 1;
			letter-spacing: 0.5px;
			text-align: left;
			color: #093649;
			padding-top:15px;
			margin-left:5px;
		}
		^ .statuslabel 
		{
			width: 37px;
			height: 20px;
			font-family: Roboto;
			font-size: 12px;
			font-weight: normal;
			font-style: normal;
			font-stretch: normal;
			line-height: 1.67;
			letter-spacing: 0.2px;
			text-align: left;
			color: #ffffff;
			padding-left:10px;
		}
		^ .ticketCount 
		{
			width: 57px;
			height: 20px;
			border-radius: 100px;
			background-color: #a4b3b8;
			margin-left:5px;
			margin-top:7px; 	         
		}
  `,
	
	methods: [
    function initE(){
			this
			.addClass(this.myClass())
			.start()
				.start().addClass('firstdiv')
					.start().add('1001').addClass('label').end()
					.start().addClass('ticketCount')
						.start().add('Status').addClass('statuslabel').end()
					.end() 
				.end()
			.end()
    }  
  ]
});