/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs.fileDropZone',
  name: 'FileDropZone',
  extends: 'foam.u2.Controller',

  documentation: 'A default zone to drag & drop files',

  requires: [
    'foam.log.LogLevel',
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileArray'
  ],

  imports: [
    'ctrl',
    'user',
    'fileTypeDAO'
  ],

  exports: [
    'allowRemoval',
    'removeFile',
    'highlight'
  ],

  css: `
    ^ {
      box-sizing: border-box;
      max-width: 15vw;
      max-height: 45vh;
      height: 100%;
      padding: 16px;
      border: 2px dashed #8e9090;
      border-radius: 3px;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    ^instruction-container {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      text-align: center;
      height: 228px;
    }
    ^instruction-container.selection {
      height: 172px;
      margin-bottom: 16px;
    }
    ^input {
      -webkit-appearance: none;
      appearance: none;
      opacity: 0;
      position: absolute;
    }
    ^title {
      font-size: 16px;
      font-weight: 900;
      margin: 0;
    }
    ^or {
      display: inline-block;
      vertical-align: bottom;
      margin:0;
      margin-top: 8px;
    }
    ^link {
      display: inline-block;
      cursor: pointer;
      color: /*%PRIMARY3%*/ #406dea;
      margin: 0;
      margin-left: 5px;
      margin-top: 8px;
    }
    ^input:focus + ^instruction-container > ^browse-container > ^link{
      border: 1px solid;
      border-color: /*%PRIMARY1%*/ #406dea;
    }
    ^caption-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    ^caption {
      font-size: 10px;
      color: #525455;
    }
  `,

  messages: [
    { name: 'LABEL_DEFAULT_TITLE', message: 'Drag your file here' },
    { name: 'LABEL_OR',            message: 'or' },
    { name: 'LABEL_BROWSE',        message: 'select from your device' },
    { name: 'LABEL_SUPPORTED',     message: 'Supported file types:' },
    { name: 'LABEL_MAX_SIZE',      message: 'Max size:' },
    { name: 'ERROR_FILE_TYPE',     message: 'Invalid file type' },
    { name: 'ERROR_FILE_SIZE',     message: 'File size exceeds 15MB' }
  ],

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      name: 'supportedFormats',
      documentation: `Please use the following format: { 'image/jpg' : 'JPG' }`,
      value: {}
    },
    {
      class: 'Boolean',
      name: 'isMultipleFiles',
      value: true
    },
    {
      class: 'Boolean',
      name: 'allowRemoval',
      value: true
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'files',
      factory: function() {
        return [];
      }
    },
    {
      class: 'Long',
      name: 'maxSize',
      value: 15,
      documentation: 'Dictates maximum file size in MB (Megabyte).'
    },
    {
      name: 'onFilesChanged',
      class: 'Function',
      documentation: 'When a file has been selected/changed/removed, this function will be called. (OPTIONAL)'
    },
    {
      name: 'selected'
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();
      var self = this;

      if ( Object.keys(this.supportedFormats).length == 0 ) {
        let s = await this.fileTypeDAO.select();
        s.array.forEach(type => {
          this.supportedFormats[type.toSummary()] = type.abbreviation;
        });
      }

      this
        .addClass(this.myClass())
        .callIf(this.isMultipleFiles, function() {
          this.start('input')
            .addClass(this.myClass('input'))
            .addClass(this.instanceClass('input'))
            .attrs({
              type: 'file',
              accept: this.getSupportedTypes(),
              multiple: 'multiple'
            })
            .on('change', this.onChange)
          .end();
        })
        .callIf(! this.isMultipleFiles, function() {
          this.start('input')
            .addClass(this.myClass('input'))
            .addClass(this.instanceClass('input'))
            .attrs({
              type: 'file',
              accept: this.getSupportedTypes()
            })
            .on('change', this.onChange)
          .end();
        })
        .start().addClass(this.myClass('instruction-container')).enableClass('selection', this.files$.map((v) => { return v.length > 0; }))
          .start().addClass(this.myClass('browse-container'))
            .start('p').addClass(this.myClass('title')).add(this.title || this.LABEL_DEFAULT_TITLE).end()
              .start('p').addClass(this.myClass('or')).add(this.LABEL_OR).end()
              .start('label').addClass(this.myClass('link'))
                .add(this.LABEL_BROWSE)
                .attrs({
                  for: 'file-upload'
                })
                .on('click', this.onAddAttachmentClicked)
              .end()
          .end()
          .start().addClass(this.myClass('caption-container')).hide(this.files$.map((v) => { return v.length > 0; }))
            .start()
              .start('p').addClass(this.myClass('caption')).add(this.LABEL_SUPPORTED).end()
              .start('p').addClass(self.myClass('caption')).add(this.getSupportedTypes(true)).end()
            .end()
            .start()
              .start('p').addClass(this.myClass('caption')).add(this.LABEL_MAX_SIZE + ' ' + this.maxSize + 'MB').end()
            .end()
          .end()
        .end()
        .add(this.slot(function(files) {
          var e = this.E();
          for ( var i = 0; i < files.length; i++ ) {
            e.tag({
              class: 'foam.nanos.fs.fileDropZone.FileCard',
              data: files[i],
              selected: this.selected,
              index: i
            });
          }
          return e;
        }, this.files$))
        .on('drop', this.onDrop)
        .on('dragover', e => e.preventDefault() )
        .on('dragenter', e => e.preventDefault() );
    },

    function getSupportedTypes(readable) {
      var supportedTypes = Object.keys(this.supportedFormats);
      var constructedString = '';

      if ( readable ) {
        supportedTypes.forEach((type, index) => {
          constructedString += this.supportedFormats[type];
          if ( index < supportedTypes.length - 1 ) {
            constructedString += ', ';
          }
        });
      } else {
        supportedTypes.forEach((type, index) => {
          constructedString += type;
          if ( index < supportedTypes.length - 1 ) {
            constructedString += ', ';
          }
        });
      }
      return constructedString;
    },

    function addFiles(files) {
      var errors = false;
      for ( var i = 0 ; i < files.length ; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( this.maxSize * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          ctrl.notify(this.ERROR_FILE_SIZE, '', this.LogLevel.ERROR, true);
          continue;
        }
        var isIncluded = false;
        for ( var j = 0; j < this.files.length; j++ ) {
          if ( this.files[j].filename.localeCompare(files[i].name) === 0 ) {
            isIncluded = true;
            break;
          }
        }
        if ( isIncluded ) continue;
        if ( this.isMultipleFiles ) {
          var f = this.File.create({
            owner:    this.user.id,
            filename: files[i].name,
            filesize: files[i].size,
            mimeType: files[i].type,
            data:     this.BlobBlob.create({
              blob: files[i]
            })
          });
          this.files.push(f);
        } else {
          this.files[0] = this.File.create({
            owner:    this.user.id,
            filename: files[i].name,
            filesize: files[i].size,
            mimeType: files[i].type,
            data:     this.BlobBlob.create({
              blob: files[i]
            })
          });
        }
      }
      this.selected = this.files.length - 1;
      this.files = Array.from(this.files);
    },

    function isFileType(file) {
      return ( file.type in this.supportedFormats );
    },

    function removeFile(atIndex) {
      if ( this.controllerMode === this.controllerMode.VIEW ) {
        return;
      }
      var files = Array.from(this.files);
      files.splice(atIndex, 1);
      if ( this.selected === files.length )
              this.selected = files.length - 1;
      this.files = files;
      this.document.querySelector('.' + this.instanceClass(`input`)).value = null;

    },

    function highlight(atIndex) {
      this.selected = atIndex;
      this.files = this.files;
    }
  ],

  listeners: [
    function onAddAttachmentClicked(e) {
      if ( this.controllerMode === this.controllerMode.VIEW ) {
        return;
      }
      if ( typeof e.target != 'undefined' ) {
        if ( e.target.tagName == 'LABEL' && e.target.tagName != 'A' ) {
          this.document.querySelector('.' + this.instanceClass(`input`)).click();
        }
      } else {
        // For IE browser
        if ( e.srcElement.tagName == 'LABEL' && e.srcElement.tagName != 'A' ) {
          this.document.querySelector('.' + this.instanceClass(`input`)).click();
        }
      }
    },

    function onDrop(e) {
      if ( this.controllerMode === this.controllerMode.VIEW ) {
        return;
      }
      e.preventDefault();
      var files = [];
      var inputFile;
      if ( e.dataTransfer.items ) {
        inputFile = e.dataTransfer.items;
        if ( inputFile ) {
          for ( var i = 0 ; i < inputFile.length ; i++ ) {
            // If dropped items aren't files, reject them
            if ( inputFile[i].kind === 'file' ) {
              var file = inputFile[i].getAsFile();
              if ( this.isFileType(file) ) {
                files.push(file);
              } else {
                ctrl.notify(this.ERROR_FILE_TYPE, '', this.LogLevel.ERROR, true);
              }
            }
          }
        }
      } else if ( e.dataTransfer.files ) {
        inputFile = e.dataTransfer.files;
        for ( var i = 0 ; i < inputFile.length ; i++ ) {
          var file = inputFile[i];
          if ( this.isFileType(file) ) {
            files.push(file);
          } else {
            ctrl.notify(this.ERROR_FILE_TYPE, '', this.LogLevel.ERROR, true);
          }
        }
      }
      this.addFiles(files);
    },

    function onChange(e) {
      var files = e.target.files;
      this.addFiles(files);
      // Remove all temporary files in the element.target.files
      this.document.querySelector('.' + this.instanceClass(`input`)).value = null;
      this.onFilesChanged();
    }
  ]
});
