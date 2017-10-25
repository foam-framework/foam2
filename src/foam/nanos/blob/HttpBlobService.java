package foam.nanos.blob;

public class HttpBlobService
  extends javax.servlet.http.HttpServlet
  implements foam.nanos.NanoService, foam.core.ContextAware
{
  private foam.core.X x_;

  private foam.blob.BlobService blobService_;

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
    blobService_ = (foam.blob.BlobService)getX().get("blobService");
  }

  @Override
  protected void doGet(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp)
    throws javax.servlet.ServletException, java.io.IOException {
    // TODO: Handle HTTP Range requests.

    // TODO: Verify that this is the right id.
    String id = req.getContextPath();

    foam.blob.Blob blob = blobService_.find(id);

    if ( blob == null ) {
      req.setStatus(resp.SC_NOT_FOUND);
      return;
    }

    resp.setStatus(resp.SC_OK);
    resp.setHeader("Content-Type", "application/octet-stream");
    resp.setHeader("Content-Length", blob.getSize());
    resp.setHeader("ETag", id);
    resp.setHeader("Cache-Control", "public");

    java.io.OutputStream output = resp.getOutputStream();

    // TODO: Read chunks of "blob" and write them to "output"
  }

  @Override
  protected void doPut(javax.servlet.http.HttpServletRequest req, javax.servlet.http.HttpServletResponse resp)
    throws javax.servlet.ServletException, java.io.IOException {
    System.out.println("**** " + req.getContextPath());

    foam.blob.InputStreamBlob blob = new foam.blob.InputStreamBlob(req.getInputStream());

    foam.blob.IdentifiedBlob result = (foam.blob.IdentifiedBlob)blobService_.put(blob);

    java.io.PrintWriter writer = resp.getWriter();
    writer.write(result.getId());
  }
}
