/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.view',
  name: 'DocumentUploadView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.fs.fileDropZone.FileDropZone',
    'foam.nanos.fs.fileDropZone.FilePreview'
  ],

  css: `
    ^{
      display: inline-grid;
      gird-template-columns: repeat(12, 1fr);
      gap: 24x 12px;
      justify-items: start;
    }
    ^left-container{
      grid-column: 1 / span 3;
    }
    ^right-container{
      grid-column: 4 / 12;
    }
  `,

  methods: [
    function initE() {
      let selectSlot = foam.core.SimpleSlot.create({ value: 0 });
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('left-contianer'))
          .add(this.FileDropZone.create({
            files$: this.data$,
            selected$: selectSlot
          }))
        .end()
        .start()
          .addClass(this.myClass('right-container'))
          .add(this.FilePreview.create({
            data$: this.data$,
            selected$: selectSlot
          }))
        .end();
    }
  ]
});
