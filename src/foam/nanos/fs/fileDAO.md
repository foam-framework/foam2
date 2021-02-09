# FileDAO

FileDAO used to store foam.nanos.fs.File. There are two possible ways of storing file using fileDAO:
- On the file system
- inside ledger

### Saving file to fileDAO
There are two models to which can be used to access file:
- foam.nanos.fs.File
- foam.nanos.fs.FileArray

Both models are picked up by one of three decorators:
- FileArrayDAODecorator ( for foam.nanos.fs.FileArray )
- FileDAODecorator ( for foam.nanos.fs.File )
- FileArrayInCapablePayloadsDecorator ( for foam.nanos.fs.FileArray which is stored incide capable payloads)

This decorators are responsible for saving file to fileDAO, and should be added as client side decorators for dao e.g.
```
    "client": """
        {
          "decorators": [
            {
              "class":"foam.nanos.fs.FileArrayDAODecorator"
            },
            {
              "class":"foam.nanos.fs.FileArrayInCapablePayloadsDecorator"
            }
          ]
        }
    """
```

When decorator receive file, it will check its size and store it on file system or inside FileDAO ledger.

### File system
When file stored in file system, first it is recreated inside /opt/nanopay/journals/tmp folder, by trasfering file as bytes from client to server. When file is uploaded to the server and recreated in tmp folder, it will moved to /opt/nanopay/journals/largefiles folder. It will be named with file id. BlobStore responsible for this action.
```
p({class:"foam.nanos.fs.File",id:"4ca42c2c1ee8d917d8412225e05798c93fd14b3791ccb91579e486bde84e380b",filename:"test_>3mb_img.jpg",filesize:4092988,mimeType:"image/jpeg",owner:2005})
```

File id is generated on client and server sides by calculating hash of the file using sha256 algorithm.

### Ledger
When file stored inside ledger, client side decorator generates string(dataString), which is base64 encoding of the file, and stores it directly on fileDAO:
```
p({class:"foam.nanos.fs.File",id:"b5857f29-04f5-102f-4a44-18be79d05972",filename:"i.jpg",filesize:2,mimeType:"image/jpeg",dataString:"data:image/jpeg;base64,MQo=",owner:2005})
```
