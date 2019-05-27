/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.blob;

import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.IdentifiedBlob;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.fs.File;
import org.apache.commons.io.IOUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;

public class FileService
    extends HttpBlobService
{
  protected DAO fileDAO_;
  protected DAO userDAO_;
  protected DAO sessionDAO_;


  public FileService(X x, BlobService delegate) {
    this(x, "httpFileService", delegate);
  }

  public FileService(X x, String name, BlobService delegate) {
    super(x, name, delegate);
    fileDAO_ = (DAO) x.get("fileDAO");
    // use the user dao instead of local user dao
    // so that we get the authentication decoration
    userDAO_ = (DAO) x.get("userDAO");
    sessionDAO_ = (DAO) x.get("localSessionDAO");
  }

  @Override
  protected void download(X x) {
    Blob blob = null;
    OutputStream os = null;
    HttpServletRequest  req  = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);

    try {
      String path = req.getRequestURI();
      String id = path.replaceFirst("/service/" + name_ + "/", "");

      // find file from file dao
      File file = (File) fileDAO_.find_(x, id);
      if ( file == null || file.getData() == null ) {
        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      // TODO: Add better ACL support for files.  In the meantime,
      // fileDAO has been decorated to disallow enumeration and File
      // IDs are unguessable cryptographically strong UUIDs, so no
      // permission check is really necessary.
      
// if ( userDAO_.find_(x, file.getOwner()) == null ) {
//  resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//  return;
// }

      // get blob and blob size
      // TODO: figure out why delegate is not being set for IdentifiedBlob
      String blobId = ((IdentifiedBlob) file.getData()).getId();
      blob = getDelegate().find_(x, blobId);
      long size = blob.getSize();

      // set response status, content type, content length
      resp.setStatus(HttpServletResponse.SC_OK);
      resp.setContentType(file.getMimeType());
      resp.setHeader("Content-Length", Long.toString(size, 10));
      resp.setHeader("Cache-Control", "public");

      // output data to response
      os = resp.getOutputStream();
      blob.read(os, 0, size);
      os.close();
    } catch (Throwable t) {
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(os);
    }
  }
}
