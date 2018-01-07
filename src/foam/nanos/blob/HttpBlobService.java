/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.blob;

import foam.blob.*;
import foam.core.X;
import foam.lib.json.Outputter;
import foam.lib.json.OutputterMode;
import foam.nanos.http.WebAgent;
import org.apache.commons.io.IOUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.channels.Channels;
import java.nio.channels.WritableByteChannel;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;

public class HttpBlobService
    extends ProxyBlobService
    implements WebAgent
{
  public static final int BUFFER_SIZE = 8192;

  public HttpBlobService(X x, BlobService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public void execute(X x) {
    HttpServletRequest  req  = (HttpServletRequest)  x.get(HttpServletRequest.class);
    HttpServletResponse resp = (HttpServletResponse) x.get(HttpServletResponse.class);

    try {
      if ( "GET".equals(req.getMethod()) ) {
        download(req, resp);
      } else if ( "PUT".equals(req.getMethod()) ) {
        upload(req, resp);
      }
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  protected void download(HttpServletRequest req, HttpServletResponse resp) {
    try {
      String path = req.getRequestURI();
      String id = path.substring(path.lastIndexOf("/") + 1);

      Blob blob = getDelegate().find(id);

      if (blob == null) {
        resp.setStatus(resp.SC_NOT_FOUND);
        return;
      }

      long chunk = 0;
      long size = blob.getSize();
      long chunks = (long) Math.ceil((double) size / (double) BUFFER_SIZE);
      Buffer buffer = new Buffer(BUFFER_SIZE, ByteBuffer.allocate(BUFFER_SIZE));

      resp.setStatus(resp.SC_OK);
      if (blob instanceof FileBlob) {
        File file = ((FileBlob) blob).getFile();
        resp.setContentType(Files.probeContentType(Paths.get(file.toURI())));
      } else {
        resp.setContentType("application/octet-stream");
      }
      resp.setHeader("Content-Length", Long.toString(size, 10));
      resp.setHeader("ETag", id);
      resp.setHeader("Cache-Control", "public");

      OutputStream output = resp.getOutputStream();
      WritableByteChannel channel = Channels.newChannel(output);

      while (chunk < chunks) {
        buffer = blob.read(buffer, chunk * BUFFER_SIZE);
        if (buffer == null) {
          break;
        }
        channel.write(buffer.getData());
        buffer.getData().clear();
        chunk++;
      }
      output.flush();
    } catch (Throwable t) {
      throw new RuntimeException(t);
    }
  }

  protected void upload(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp) {
    File temp = null;
    OutputStream os = null;

    try {
      // create a temporary file to store incoming data
      temp = File.createTempFile(UUID.randomUUID().toString(), ".tmp");
      os = new FileOutputStream(temp);
      InputStream is = req.getInputStream();

      int read = 0;
      byte[] buffer = new byte[BUFFER_SIZE];
      while ( (read = is.read(buffer, 0, BUFFER_SIZE)) != -1 ) {
        os.write(buffer, 0, read);
      }

      // create a file blob and store
      FileBlob blob = new FileBlob(temp);
      Blob result = getDelegate().put(blob);
      new Outputter(resp.getWriter(), OutputterMode.NETWORK).output(result);
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(os);
      if ( temp != null ) {
        temp.delete();
      }
    }
  }
}