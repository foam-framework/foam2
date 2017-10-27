package foam.nanos.blob;

import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.Buffer;
import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.NanoService;

import javax.servlet.http.HttpServlet;
import java.nio.ByteBuffer;
import java.nio.channels.Channels;
import java.nio.channels.WritableByteChannel;

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
    System.out.println("Starting HTTPBlobService.");
    store_ = (foam.blob.BlobService)getX().get("blobStore");
  }

  @Override
  protected void doGet(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp)
      throws javax.servlet.ServletException, java.io.IOException {
    // TODO: Handle HTTP Range requests.

    // TODO: Verify that this is the right id.

    System.out.println("***HTTPBlobService.doGet()");

    String path = req.getRequestURI();
    String id = path.substring(path.lastIndexOf("/") + 1);

    System.out.println("***id = " + id);

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
    resp.setHeader("Content-Type", "application/octet-stream");
    resp.setHeader("Content-Length", Long.toString(size));
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
  }

  @Override
  protected void doPut(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp)
      throws javax.servlet.ServletException, java.io.IOException {
    System.out.println("****HTTPBlobservice.doPut()");

    foam.blob.InputStreamBlob blob = new foam.blob.InputStreamBlob(req.getInputStream());

    foam.blob.Blob result = store_.put(blob);

    new foam.lib.json.Outputter(resp.getWriter(), foam.lib.json.OutputterMode.NETWORK).output(result);
  }
}
