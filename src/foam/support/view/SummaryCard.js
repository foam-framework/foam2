foam.CLASS({
    package:'foam.support.view',
    name:'SummaryCard',
    extends: 'foam.u2.View',
    css:`
        ^ .abc{
            width: 223px;
            height: 92px;
            border-radius: 2px;
            margin-left:0px;
            margin-bottom:140px;
            background-color:red;
        }
        ^ .label{
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
            }

           ^ .New {
                width: 25px;
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
                padding-left:5px;
              }
              ^ .anu 
              {
                width: 40px;
                height: 20px;
                border-radius: 100px;
                background-color: #eedb5f;
                margin-top:10px;
                margin-left:30px;
              }

    `,
    methods:
    [
    function initE(){
        this
        .addClass(this.myClass())
            .start('div')
                  
                  //.start().add("Tickets").addClass('label').end()
                  .start().addClass('abc')
                  .start().add('100').addClass('label').end()
                      .start().addClass('anu')
                      .start().add('Status').addClass('New').end()
                      .end()
                  
               
            .end()
        .end()
        // .start()
        //     .start('h1').add("testing").addClass('title').end()
        //          .start('div').add().addClass('abc').end()
                  
    
        // .end();
        }
        
    ]

})
