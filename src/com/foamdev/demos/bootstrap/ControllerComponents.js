/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'com.foamdev.demos.bootstrap',
  name: 'ControllerComponents',
  extends: 'foam.u2.Element',

  exports: [ 'as data' ],
  
  imports: [ 'window' ],//To run bootstrap JavaScript.

  methods: [
    function initE() {

      this.
        start('div').addClass('container').//<div class='container'>.end().
          add('Hello, world!').
        end().
        
        start('h1').add('h1. Bootstrap heading').end().
        start('h2').add('h2. Bootstrap heading').end().
        start('h3').add('h3. Bootstrap heading').end().
        start('h4').add('h4. Bootstrap heading').end().
        start('h5').add('h5. Bootstrap heading').end().
        start('h6').add('h6. Bootstrap heading').end().
        
        start('p').addClass('h1').add('h1. Bootstrap heading').end().
        start('p').addClass('h2').add('h2. Bootstrap heading').end().
        start('p').addClass('h3').add('h3. Bootstrap heading').end().
        start('p').addClass('h4').add('h4. Bootstrap heading').end().
        start('p').addClass('h5').add('h5. Bootstrap heading').end().
        start('p').addClass('h6').add('h6. Bootstrap heading').end().
        
        start('p').add('You can use the mark tag to ').start('mark').add('highlight').end().add(' text').end().
        start('p').start('del').add('This line of text is meant to be treated as deleted text.').end().end().
        start('p').start('s').add('This line of text is meant to be treated as no longer accurate.').end().end().
        start('p').start('ins').add('This line of text is meant to be treated as an addition to the document.').end().end().
        start('p').start('u').add('This line of text will render as underlined').end().end().
        start('p').start('small').add('This line of text is meant to be treated as fine print.').end().end().
        start('p').start('strong').add('This line rendered as bold text.').end().end().
        start('p').start('em').add('This line rendered as italicized text.').end().end().
              
        start('p').start('abbr').attrs({title: 'attribute'}).add('attr').end().end().
        start('p').start('abbr').attrs({title: 'HyperText Markup Language'}).addClass('initialism').add('HTML').end().end().
        
        start('blockquote').addClass('blockquote').
          start('p').addClass('mb-0').add('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.').end().
          start('footer').addClass('blockquote-footer').add('Someone famous in ').start('cite').attrs({title: 'Source Title'}). add('Source Title').end().end().
        end().
        
        start('blockquote').addClass('blockquote').addClass('text-center').
          start('p').addClass('mb-0').add('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante.').end().
          start('footer').addClass('blockquote-footer').add('Someone famous in ').start('cite').attrs({title: 'Source Title'}). add('Source Title').end().end().
        end().

        start('table').addClass('table').
          start('thead').
            start('tr').
              start('th').attrs({scope: 'col'}).add('#').end().
              start('th').attrs({scope: 'col'}).add('First').end().
              start('th').attrs({scope: 'col'}).add('Last').end().
              start('th').attrs({scope: 'col'}).add('Handle').end().
            end().
        end().
        start('tbody').
          start('tr').
            start('th').attrs({scope: 'row'}).add('1').end().
            start('th').add('Mark').end().
            start('th').add('Otto').end().
            start('th').add('@mdo').end().
          end().
          start('tr').
            start('th').attrs({scope: 'row'}).add('2').end().
            start('th').add('Jacob').end().
            start('th').add('Thornton').end().
            start('th').add('@fat').end().
          end().
          start('tr').
            start('th').attrs({scope: 'row'}).add('3').end().
            start('th').add('Larry').end().
            start('th').add('the Bird').end().
            start('th').add('@twitter').end().
          end().
        end().
        end(). 

        start('table').addClass('table').addClass('table-dark').
          start('thead').
            start('tr').
              start('th').attrs({scope: 'col'}).add('#').end().
              start('th').attrs({scope: 'col'}).add('First').end().
              start('th').attrs({scope: 'col'}).add('Last').end().
              start('th').attrs({scope: 'col'}).add('Handle').end().
            end().
          end().
          start('tbody').
            start('tr').
              start('th').attrs({scope: 'row'}).add('1').end().
              start('th').add('Mark').end().
              start('th').add('Otto').end().
              start('th').add('@mdo').end().
            end().
            start('tr').
              start('th').attrs({scope: 'row'}).add('2').end().
              start('th').add('Jacob').end().
              start('th').add('Thornton').end().
              start('th').add('@fat').end().
            end().
            start('tr').
              start('th').attrs({scope: 'row'}).add('3').end().
              start('th').add('Larry').end().
              start('th').add('the Bird').end().
              start('th').add('@twitter').end().
            end().
          end().
        end().     

        start('table').addClass('table').
          start('thead').addClass('table-dark').
            start('tr').
              start('th').attrs({scope: 'col'}).add('#').end().
              start('th').attrs({scope: 'col'}).add('First').end().
              start('th').attrs({scope: 'col'}).add('Last').end().
              start('th').attrs({scope: 'col'}).add('Handle').end().
            end().
        end().
          start('tbody').
            start('tr').
              start('th').attrs({scope: 'row'}).add('1').end().
              start('th').add('Mark').end().
              start('th').add('Otto').end().
              start('th').add('@mdo').end().
            end().
            start('tr').
              start('th').attrs({scope: 'row'}).add('2').end().
              start('th').add('Jacob').end().
              start('th').add('Thornton').end().
              start('th').add('@fat').end().
            end().
            start('tr').
              start('th').attrs({scope: 'row'}).add('3').end().
              start('th').add('Larry').end().
              start('th').add('the Bird').end().
              start('th').add('@twitter').end().
            end().
         end().
        end().  

        start('table').addClass('table').
          start('thead').addClass('table-light').
            start('tr').
              start('th').attrs({scope: 'col'}).add('#').end().
              start('th').attrs({scope: 'col'}).add('First').end().
              start('th').attrs({scope: 'col'}).add('Last').end().
              start('th').attrs({scope: 'col'}).add('Handle').end().
            end().
        end().
        start('tbody').
          start('tr').
            start('th').attrs({scope: 'row'}).add('1').end().
            start('th').add('Mark').end().
            start('th').add('Otto').end().
            start('th').add('@mdo').end().
          end().
          start('tr').
            start('th').attrs({scope: 'row'}).add('2').end().
            start('th').add('Jacob').end().
            start('th').add('Thornton').end().
            start('th').add('@fat').end().
          end().
          start('tr').
            start('th').attrs({scope: 'row'}).add('3').end().
            start('th').add('Larry').end().
            start('th').add('the Bird').end().
            start('th').add('@twitter').end().
          end().
         end().
        end(). 
        
        start('table').addClass('table').
          start('thead').addClass('table-striped').
            start('tr').
              start('th').attrs({scope: 'col'}).add('#').end().
              start('th').attrs({scope: 'col'}).add('First').end().
              start('th').attrs({scope: 'col'}).add('Last').end().
              start('th').attrs({scope: 'col'}).add('Handle').end().
            end().
        end().
        start('tbody').
          start('tr').
            start('th').attrs({scope: 'row'}).add('1').end().
            start('th').add('Mark').end().
            start('th').add('Otto').end().
            start('th').add('@mdo').end().
          end().
          start('tr').
            start('th').attrs({scope: 'row'}).add('2').end().
            start('th').add('Jacob').end().
            start('th').add('Thornton').end().
            start('th').add('@fat').end().
          end().
          start('tr').
            start('th').attrs({scope: 'row'}).add('3').end().
            start('th').add('Larry').end().
            start('th').add('the Bird').end().
            start('th').add('@twitter').end().
          end().
          end().
        end().

        start('div').addClass('alert').addClass('alert-primary').attrs({role: 'alert'}).add(' A simple primary alert—check it out!').
        end().
        start('div'). addClass('alert').addClass('alert-secondary').attrs({role: 'alert'}).add('A simple secondary alert—check it out!').
        end().
        start('div'). addClass('alert').addClass('alert-success').attrs({role: 'alert'}).add('A simple success alert—check it out!').
        end().
        start('div'). addClass('alert').addClass('alert-danger').attrs({role: 'alert'}).add('A simple danger alert—check it out!').
        end().
        start('div'). addClass('alert').addClass('alert-warning').attrs({role: 'alert'}).add('A simple warning alert—check it out!').
        end().
        start('div'). addClass('alert').addClass('alert-info').attrs({role: 'alert'}).add('A simple info alert—check it out!').
        end().
        start('div'). addClass('alert').addClass('alert-light').attrs({role: 'alert'}).add('A simple light alert—check it out!').
        end().
        start('div'). addClass('alert').addClass('alert-dark').attrs({role: 'alert'}).add('A simple dark alert—check it out!').
        end().
        
        start('div'). addClass('alert').addClass('alert-primary').attrs({role: 'alert'}).add('A simple primary alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().
        start('div'). addClass('alert').addClass('alert-secondary').attrs({role: 'alert'}).add(' A simple secondary alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().
        start('div'). addClass('alert').addClass('alert-success').attrs({role: 'alert'}).add('A simple success alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().
        start('div'). addClass('alert').addClass('alert-danger').attrs({role: 'alert'}).add('A simple danger alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().
        start('div'). addClass('alert').addClass('alert-warning').attrs({role: 'alert'}).add('A simple warning alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().
        start('div'). addClass('alert').addClass('alert-info').attrs({role: 'alert'}).add('A simple info alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().
        start('div'). addClass('alert').addClass('alert-light').attrs({role: 'alert'}).add('A simple light alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().
        start('div'). addClass('alert').addClass('alert-dark').attrs({role: 'alert'}).add('A simple dark alert with ').start('a').attrs({href: '#'}).addClass('alert-link').add('an example link').end().add('.. Give it a click if you like.').
        end().

        start('div'). addClass('alert').addClass('alert-success').attrs({role: 'alert'}).
          start('h4'). addClass('alert-heading').add('Well done!').end().
          start('p').add('Aww yeah, you successfully read this important alert message. This example text is going to run a bit longer so that you can see how spacing within an alert works with this kind of content.').end().
          start('hr').end().//<hr> tag('hr')
          start('p').addClass('mb-0').add('Whenever you need to, be sure to use margin utilities to keep things nice and tidy.').end().
        end().

        start('div').addClass('alert').addClass('alert-warning').addClass('alert-dismissible').addClass('fade').addClass('show').attrs({role: 'alert'}).
          start('strong').add('Holy guacamole!').end().add('You should check in on some of those fields below.').
          start('button').attrs({type: 'button','data-dismiss': 'alert','aria-label': 'Close'}).addClass('close').
            start('span').attrs({'aria-hidden': 'true'}).add('&times;').end().
          end().
        end().

        start('button').attrs({type: 'button','data-dismiss': 'alert','aria-label': 'Close'}).addClass('close').
          start('span').attrs({'aria-hidden': 'true'}).add('&times;').end().//TODO evaluet spesific value.
        end().

        start('span').addClass('badge').addClass('badge-primary').add('Primary').end().
        start('span').addClass('badge').addClass('badge-secondary').add('Secondary').end().
        start('span').addClass('badge').addClass('badge-success').add('Success').end().
        start('span').addClass('badge').addClass('badge-danger').add('Danger').end().
        start('span').addClass('badge').addClass('badge-warning').add('Warning').end().
        start('span').addClass('badge').addClass('badge-info').add('Info').end().
        start('span').addClass('badge').addClass('badge-light').add('Light').end().
        start('span').addClass('badge').addClass('badge-dark').add('Dark').end().

        tag('hr').

        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-primary').add('Primary').end().
        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-secondary').add('Secondary').end().
        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-success').add('Success').end().
        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-danger').add('Danger').end().
        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-warning').add('Warning').end().
        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-info').add('Info').end().
        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-light').add('Light').end().
        start('span'). addClass('badge').addClass('badge-pill').addClass('badge-dark').add('Dark').end().
        
        tag('hr').
        
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-primary').add('Primary').end().
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-secondary').add('Secondary').end().
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-success').add('Success').end().
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-danger').add('Danger').end().
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-warning').add('Warning').end().
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-info').add('Info').end().
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-light').add('Light').end().
        start('a').attrs({href: '#'}).addClass('badge').addClass('badge-dark').add('Dark').end().
        
        tag('hr').
        
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-primary').add('Primary').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-secondary').add('Secondary').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-success').add('Success').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-danger').add('Danger').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-warning').add('Warning').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-info').add('Info').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-light').add('Light').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-dark').add('Dark').end().

        tag('hr').
        
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-link').add('Link').end().
        tag('hr').
        start('a'). addClass('btn').addClass('btn-primary').attrs({href: '#'}).attrs({role: 'button'}).add('Link').end().
        start('button'). addClass('btn').addClass('btn-primary').attrs({type: 'submit'}).add('Button').end().
        start('input').addClass('btn').addClass('btn-primary').attrs({type: 'button', value: 'Input'}).end().
        start('input').addClass('btn').addClass('btn-primary').attrs({type: 'submit', value:'Submit'}).end().
        start('input').addClass('btn').addClass('btn-primary').attrs({type: 'reset', value:'Reset'}). end().
        
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-primary').add('Primary').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-secondary').add('Secondary').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-success').add('Success').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-danger').add('Danger').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-warning').add('Warning').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-info').add('Info').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-light').add('Light').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-outline-dark').add('Dark').end().
        tag('hr').
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-primary').addClass('btn-lg').add('Large button').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-secondary').addClass('btn-lg').add('Large button').end().
        tag('hr').
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-primary').addClass('btn-sm').add('Small button').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-secondary').addClass('btn-sm').add('Small button').end().
        tag('hr').
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-primary').addClass('btn-lg').addClass('btn-block').add('Block level button').end().
        start('button').attrs({type: 'button'}).addClass('btn').addClass('btn-secondary').addClass('btn-lg').addClass('btn-block').add('Block level button').end().

        start('a').attrs({href: '#',role:'button', 'aria-pressed':'true'}).addClass('btn').addClass('btn-primary').addClass('btn-lg').addClass('active').add('Primary link').end().
        start('a').attrs({href: '#', role:'button', 'aria-pressed':'true'}).addClass('btn').addClass('btn-secondary').addClass('btn-lg').addClass('active').add('Link').end().
        
        start('button').attrs({type: 'button', disabled: 'true'}).addClass('btn').addClass('btn-lg').addClass('btn-primary').add('Primary button').end().
        start('button').attrs({type: 'button', disabled: 'true'}).addClass('btn').addClass('btn-secondary').addClass('btn-lg').add('Button').end().
        
        start('a').attrs({href: '#', disabled: 'true', tabindex: '-1', role:'button', 'aria-disabled':'true'}).addClass('btn').addClass('btn-primary').add('btn-lg').add('Primary link').end().
        start('a').attrs({href: '#', disabled: 'true', tabindex:'-1', role:'button', 'aria-disabled':'true'}).addClass('btn').addClass('btn-secondary').add('btn-lg').add('Link').end().
              
        start('button').attrs({type: 'button','data-toggle':'button' ,'aria-pressed':'false' ,autocomplete:'off'}).addClass('btn').addClass('btn-primary').add('Single toggle').
        end().

        start('div'). addClass('container').//TODO attrs({'border-color': 'red','border-style': 'solid'}).
          start('div'). addClass('row').
            start('div'). addClass('col-sm').
              add('One of three columns').
            end().
            start('div'). addClass('col-sm').
              add('One of three columns').
            end().
            start('div'). addClass('col-sm').
              add('One of three columns').
            end().
          end().
        end().
    
        start('div'). addClass('container').
          start('div'). addClass('row').
            start('div'). addClass('col').
              add('1 of 2').
            end().
            start('div'). addClass('col').
              add('2 of 2').
            end().
          end().
          start('div'). addClass('row').
            start('div'). addClass('col').
              add('1 of 3').
            end().
            start('div'). addClass('col').
              add('2 of 3').
            end().
            start('div'). addClass('col').
              add('3 of 3').
            end().
          end().
        end().

        start('div'). addClass('container').
          start('div'). addClass('row').
            start('div'). addClass('col').add('Column').end().
            start('div'). addClass('col').add('Column').end().
            start('div'). addClass('w-100').end().
            start('div'). addClass('col').add('Column').end().
            start('div'). addClass('col').add('Column').end().
          end().
        end().

        start('div'). addClass('container').
          start('div'). addClass('row').
            start('div'). addClass('col').
              add('1 of 3').
            end().
            start('div'). addClass('col-6').
              add('2 of 3 (wider)').
            end().
            start('div'). addClass('col').
              add('3 of 3').
            end().
          end().
          start('div'). addClass('row').
            start('div'). addClass('col').
              add('1 of 3').
            end().
            start('div'). addClass('col-5').
              add('2 of 3 (wider)').
            end().
            start('div'). addClass('col').
              add('3 of 3').
            end().
          end().
        end().
        
        start('div'). addClass('row').
          start('div'). addClass('col').add('col').end().
          start('div'). addClass('col').add('col').end().
          start('div'). addClass('w-100').end().
          start('div'). addClass('col').add('col').end().
          start('div'). addClass('col').add('col').end().
        end().
        
        start('div'). addClass('row').
          start('div'). addClass('col').add('col').end().
          start('div'). addClass('col').add('col').end().
          start('div'). addClass('col').add('col').end().
          start('div'). addClass('col').add('col').end().
        end().
        start('div'). addClass('row').
          start('div'). addClass('col-8').add('col-8').end().
          start('div'). addClass('col-4').add('col-4').end().
        end().
        
        start('div'). addClass('row').
          start('div'). addClass('col-sm-8').add('col-sm-8').end().
          start('div'). addClass('col-sm-4').add('col-sm-4').end().
        end().
        start('div'). addClass('row').
          start('div'). addClass('col-sm').add('col-sm').end().
          start('div'). addClass('col-sm').add('col-sm').end().
          start('div'). addClass('col-sm').add('col-sm').end().
        end().

        // Stack the columns on mobile by making one full-width and the other half-width
        start('div'). addClass('row').
          start('div'). addClass('col-12'). addClass('col-md-8').add('.col-12 .col-md-8').end().
          start('div'). addClass('col-6'). addClass('col-md-4').add('.col-6 .col-md-4').end().
        end().
        
        // Columns start at 50% wide on mobile and bump up to 33.3% wide on desktop
        start('div'). addClass('row').
          start('div'). addClass('col-6'). addClass('col-md-4').add('.col-6 .col-md-4').end().
          start('div'). addClass('col-6'). addClass('col-md-4').add('.col-6 .col-md-4').end().
          start('div'). addClass('col-6'). addClass('col-md-4').add('.col-6 .col-md-4').end().
        end().
        
        /*Columns are always 50% wide, on mobile and desktop*/
        start('div'). addClass('row').
          start('div'). addClass('col-6').add('.col-6').end().
          start('div'). addClass('col-6').add('.col-6').end().
        end().

        start('div'). addClass('container').
          start('div').addClass('row').addClass('align-items-start').
            start('div'). addClass('col').
              add('One of three columns').
            end().
            start('div'). addClass('col').
              add('One of three columns').
            end().
            start('div'). addClass('col').
              add('One of three columns').
            end().
          end().
          start('div').addClass('row').addClass('align-items-center').
            start('div'). addClass('col').
              add('One of three columns').
            end().
            start('div'). addClass('col').
              add('One of three columns').
            end().
            start('div'). addClass('col').
              add('One of three columns').
            end().
          end().
          start('div'). addClass('row').addClass('align-items-end').
            start('div'). addClass('col').
              add('One of three columns').
            end().
            start('div'). addClass('col').
              add('One of three columns').
            end().
            start('div'). addClass('col').
              add('One of three columns').
            end().
          end().
        end().

        start('div').addClass('container').
          start('div').addClass('row').addClass('justify-content-start').
            start('div').addClass('col-4').
              add('One of two columns').
            end().
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
          end().
          start('div').addClass('row').addClass('justify-content-center').
            start('div').addClass('col-4').
              add('One of two columns').
            end().
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
          end().
          start('div'). addClass('row').addClass('justify-content-end').
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
          end().
          start('div'). addClass('row').addClass('justify-content-around').
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
          end().
          start('div'). addClass('row').addClass('justify-content-between').
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
            start('div'). addClass('col-4').
              add('One of two columns').
            end().
          end().
        end().

        start('div'). addClass('media').
          start('img'). addClass('mr-3').attrs({src:'.../64x64', alt:'Generic placeholder image'}).
          start('div'). addClass('media-body').
            start('h5').addClass('mt-0').add('Media heading').end().
            add('Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.').
        
            start('div'). addClass('media'). addClass('mt-3').
              start('a').addClass('pr-3').attrs({href: '#'}).
                start('img').attrs({src:'.../64x64', alt:'Generic placeholder image'}).
              end().
              start('div'). addClass('media-body').
                start('h5'). addClass('mt-0').add('Media heading').end().
                add('Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.').
              end().
            end().
          end().
        end();
    }
  ]
});
