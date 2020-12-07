/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileDataDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.blob.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'maxStringDataSize',
      value: 1024 * 3
    }
  ],

  methods: [
    {
      documentation: `Server side logic to save file to either file.dataString or to physical files system.`,
      name: 'put_',
      javaCode: `
      File file = (File) obj;
      if ( ! foam.util.SafetyUtil.isEmpty(file.getDataString()) ) {
        return getDelegate().put_(x, obj);
      }

      Blob blob = file.getData();
      if ( blob == null ) {
        return getDelegate().put_(x, obj);
      }

      // save to data string
      if ( file.getFilesize() <= getMaxStringDataSize() ) {
        try {
          java.io.ByteArrayOutputStream os = new java.io.ByteArrayOutputStream((int) file.getFilesize());
          blob.read(os, 0, file.getFilesize());
          String encodedString = java.util.Base64.getEncoder().encodeToString(os.toByteArray());
          String type = file.getMimeType();
          if ( foam.util.SafetyUtil.isEmpty(type) ) {
            if ( ! foam.util.SafetyUtil.isEmpty(file.getFilename()) &&
                 file.getFilename().lastIndexOf(".") != -1 &&
                 file.getFilename().lastIndexOf(".") != 0 ) {
              type = "text/" + file.getFilename().substring(file.getFilename().lastIndexOf(".")+1);
            } else {
              type = "text/html";
            }
          }
          file.setDataString("data:"+type+";base64," + encodedString);
          file.setData(null);
          return getDelegate().put_(x, file);
        } catch (Exception e) {
          ((foam.dao.DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm.Builder(x)
            .setName("Failed to encode")
            .setSeverity(foam.log.LogLevel.ERROR)
            .setReason(foam.nanos.alarming.AlarmReason.UNSPECIFIED)
            .setNote(file.getFilename())
            .build());
          throw new foam.core.FOAMException("Failed to encode file", e);
        }
      }

      try {
        // save to filesystem
        BlobService blobStore = (BlobService) x.get("blobStore");
        IdentifiedBlob result = (IdentifiedBlob) blobStore.put(blob);
        file.setId(result.getId());
        file.setData(null);
        return getDelegate().put_(x, file);
      } catch (Exception e) {
        ((foam.dao.DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm.Builder(x)
          .setName("Failed to save")
          .setSeverity(foam.log.LogLevel.ERROR)
          .setNote(file.getFilename())
          .build());
        throw new foam.core.FOAMException("Failed to save file", e);
      }
      `
    }
  ]
});
