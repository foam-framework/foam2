package foam.nanos.blob;

public class HttpBlobService
  extends javax.servlet.http.HttpServlet
  implements foam.nanos.NanoService, foam.core.ContextAware, foam.blob.BlobService
{
  private foam.core.X x_;

  private foam.blob.BlobService store_;


  // Proxy BlobService methods to the actual BlobStore.
  @Override
  public foam.blob.Blob put(foam.blob.Blob blob) {
    return store_.put(blob);
  }

  @Override
  public foam.blob.Blob put_(foam.core.X x, foam.blob.Blob blob) {
    return store_.put_(x, blob);
  }

  @Override
  public foam.blob.Blob find(Object id) {
    return store_.find(id);
  }

  @Override
  public foam.blob.Blob find_(foam.core.X x, Object id) {
    return store_.find_(x, id);
  }

  @Override
  public String urlFor(foam.blob.Blob blob) {
    return store_.urlFor(blob);
  }

  @Override
  public String urlFor_(foam.core.X x, foam.blob.Blob blob) {
    return store_.urlFor_(x, blob);
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

    String id = req.getContextPath();

    foam.blob.Blob blob = store_.find(id);

    if ( blob == null ) {
      resp.setStatus(resp.SC_NOT_FOUND);
      return;
    }

    resp.setStatus(resp.SC_OK);
    resp.setHeader("Content-Type", "application/octet-stream");
    resp.setHeader("Content-Length", Long.toString(blob.getSize()));
    resp.setHeader("ETag", id);
    resp.setHeader("Cache-Control", "public");

    java.io.OutputStream output = resp.getOutputStream();

    // TODO: Read chunks of "blob" and write them to "output"
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
