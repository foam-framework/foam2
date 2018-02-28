foam.CLASS({
    package:'foam.support.view',
    name:'SummaryCard',
    extends: 'foam.u2.View',
    css:`
       
       
        ^ .abc{
            width: 223px;
            height: 92px;
            border-radius: 2px;
            background: red;
            margin-left:110px;
            margin-bottom:140px;
        }
        ^ .bg {
            width: 100px;
            height: 92px;
            border-radius: 2px;
            background-color: #59a5d5;
            margin-top:100px;
           
          }
          ^ .def{
            width: 223px;
            height: 92px;
            border-radius: 2px;
            background: red;
            margin-left:230px;
            margin-bottom:140px;
        }
        ^ .ghi{
            width: 223px;
            height: 92px;
            border-radius: 2px;
            background: red;
            margin-left:230px;
            margin-bottom:140px;
        }
        ^ .jkl{
            width: 223px;
            height: 92px;
            border-radius: 2px;
            background: red;
            margin-left:230px;
            margin-bottom:140px;
        }

        ^ .mno{
            width: 223px;
            height: 92px;
            border-radius: 2px;
            background: red;
            margin-left:230px;
            margin-bottom:140px;
        }
        ^ .label{
            width: 52px;
            height: 20px;
            font-family: Roboto;
            font-size: 16px;
            font-weight: bold;
            font-style: normal;
            font-stretch: normal;
            line-height: 1.25;
            letter-spacing: 0.3px;
            text-align: center;
            color: #ffffff;
            }

    `,
    methods:
    [
    function initE(){
        this
        .addClass(this.myClass())
            .start('div')
                  .start().addClass('bg')
                  //.start().add("Tickets").addClass('label').end()
                  .start().addClass('abc')
                  .start().addClass('def')
                  .start().addClass('ghi')
                  .start().addClass('jkl') 
                  .start().addClass('mno')
                  .end()
                  .end()
                  .end()
                  .end()
                  .end()
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
