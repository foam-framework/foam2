/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FileUploadTextField',
  extends: 'foam.u2.View',

  properties: [
    {
      name: 'data',
      hidden: true,
      postSet: function(_, n) {
        this.isSet = !! n;
      }
    },
    {
      class: 'Boolean',
      name: 'isSet',
      visibility: 'RO'
    },
    {
      name: 'fileInput_'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .startContext({ data: this })
          .addClass(this.myClass())
          .start('input', null, this.fileInput_$)
            .hide()
            .attrs({type: 'file'})
            .on('change', this.onFileUpload)
          .end()
          .add(this.UPLOAD)
          .start('span')
            .style({'margin-left': '8px'})
            .add(this.IS_SET)
          .end()
        .endContext();
    }
  ],

  actions: [
    {
      name: 'upload',
      isAvailable: function(fileInput_) {
        return !! fileInput_;
      },
      code: function() {
        this.fileInput_.el().click();
      }
    }
  ],

  listeners: [
    {
      name: 'onFileUpload',
      code: function() {
        if ( ! this.fileInput_ ) return;
        var el = this.fileInput_.el();
        if ( el.value == '' ) return;
        if ( el.files.length == 0 ) return;
        var file = el.files[0];
        var reader = new FileReader();
        reader.onload = (e) => {
          var csv = e.target.result;
          this.data = csv;
        };
        reader.readAsBinaryString(file);
        el.value = '';
      }
    }
  ]
});
