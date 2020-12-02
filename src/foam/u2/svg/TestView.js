foam.CLASS({
  package: 'foam.u2.svg',
  name: 'TestView',
  extends: 'foam.u2.Element',

  methods: [
    function initE() {
      /*
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20">
        <rect x="0" y="0" width="30" height="20" fill="#fafafa"/>
        <rect x="4" y="5" width="8" height="10" fill="#007bff"/>
        <rect x="18" y="5" width="8" height="10"   fill="#888"/>
      </svg>
      */
      this
        .start('svg')
          .attrs({
            'xmlns': 'http://www.w3.org/2000/svg',
            'viewBox': '0 0 30 20',
          })
          .start('rect')
            .attrs({
              x: '0', y: '0',
              width: '30', height: '20',
              fill: '#fafafa',
            })
          .end()
          .start('rect')
            .attrs({
              x: '0', y: '0',
              width: '30', height: '20',
              fill: '#fafafa',
            })
          .end()
          .start('rect')
            .attrs({
              x: '4', y: '5',
              width: '8', height: '10',
              fill: '#007bff',
            })
          .end()
          .start('rect')
            .attrs({
              x: '18', y: '5',
              width: '8', height: '10',
              fill: '#888',
            })
          .end()
        .end()
        ;
    }
  ],
});