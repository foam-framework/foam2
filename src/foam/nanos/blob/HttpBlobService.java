/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.blob;

import foam.blob.*;
import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.NanoService;

import javax.servlet.http.HttpServlet;
import java.io.File;
import java.nio.ByteBuffer;
import java.nio.channels.Channels;
import java.nio.channels.WritableByteChannel;
import java.nio.file.Files;
import java.nio.file.Paths;

public class HttpBlobService
    extends HttpServlet
    implements NanoService, ContextAware, BlobService
{
  public static final int BUFFER_SIZE = 8192;

  private foam.core.X x_;

  private foam.blob.BlobService store_;

  @Override
  public Blob put(Blob blob) {
    return this.put_(getX(), blob);
  }

  @Override
  public Blob put_(X x, Blob blob) {
    return this.store_.put_(x, blob);
  }

  @Override
  public Blob find(Object id) {
    return this.find_(getX(), id);
  }

  @Override
  public Blob find_(X x, Object id) {
    return this.store_.find_(x, id);
  }

  @Override
  public String urlFor(Blob blob) {
    return this.urlFor_(getX(), blob);
  }

  @Override
  public String urlFor_(X x, Blob blob) {
    return this.store_.urlFor_(x, blob);
  }

  @Override
  public foam.core.X getX() {
    return x_;
  }

  @Override
  public void setX(foam.core.X x) {
    x_ = x;
  }

  @Override
  public void start() {
    store_ = (foam.blob.BlobService)getX().get("blobStore");
  }

  @Override
  protected void doGet(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp)
      throws javax.servlet.ServletException, java.io.IOException
  {
    String path = req.getRequestURI();
    String id = path.substring(path.lastIndexOf("/") + 1);

    foam.blob.Blob blob = store_.find(id);

    if ( blob == null ) {
      resp.setStatus(resp.SC_NOT_FOUND);
      return;
    }

    long chunk = 0;
    long size = blob.getSize();
    long chunks = (long) Math.ceil((double) size / (double) BUFFER_SIZE);
    Buffer buffer = new Buffer(BUFFER_SIZE, ByteBuffer.allocate(BUFFER_SIZE));

    resp.setStatus(resp.SC_OK);
    if ( blob instanceof FileBlob ) {
      File file = ((FileBlob) blob).getFile();
      resp.setHeader("Content-Type", Files.probeContentType(Paths.get(file.toURI())));
    } else {
      resp.setHeader("Content-Type", "application/octet-stream");
    }
    resp.setHeader("Content-Length", Long.toString(size, 10));
    resp.setHeader("ETag", id);
    resp.setHeader("Cache-Control", "public");

    java.io.OutputStream output = resp.getOutputStream();
    WritableByteChannel channel = Channels.newChannel(output);

    while ( chunk < chunks ) {
      buffer = blob.read(buffer, chunk * BUFFER_SIZE);
      if ( buffer == null ) {
        break;
      }
      channel.write(buffer.getData());
      buffer.getData().clear();
      chunk++;
    }
    output.flush();
    output.close();
  }

  @Override
  protected void doPut(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp)
      throws javax.servlet.ServletException, java.io.IOException
  {
    HttpServletRequestBlob blob = new HttpServletRequestBlob(req);
    Blob result = store_.put(blob);
    new foam.lib.json.Outputter(resp.getWriter(), foam.lib.json.OutputterMode.NETWORK).output(result);
  }
}