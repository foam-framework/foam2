foam.CLASS({
  package: 'foam.u2.view',
  name: 'FileUploadTextField',
  extends: 'foam.u2.View',
  properties: [
    {
      name: 'data',
      hidden: true,
      postSet: function(_, n) {
        this.isSet = !!n;
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
        reader.onload = function(e) {
          var csv = e.target.result;
          this.data = csv;
        }.bind(this);
        reader.readAsBinaryString(file);
        el.value = '';
      }
    }
  ],
  methods: [
    function initE() {
      this.SUPER();
      this
        .start('input', null, this.fileInput_$)
          .attrs({type: 'file'})
          .on('change', this.onFileUpload)
        .end()
        .startContext({data: this})
          .add(this.IS_SET)
        .endContext();
    }
  ]
});