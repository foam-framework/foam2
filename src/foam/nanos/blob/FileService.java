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
import foam.nanos.auth.User;
import foam.nanos.fs.File;
import foam.nanos.session.Session;
import org.apache.commons.io.IOUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.util.HashMap;
import java.util.Map;

public class FileService
    extends HttpBlobService
{
  protected DAO fileDAO_;
  protected DAO userDAO_;
  protected DAO sessionDAO_;

  public FileService(X x, BlobService delegate) {
    super(x, delegate);
    fileDAO_ = (DAO) x.get("fileDAO");
    // use the user dao instead of local user dao
    // so that we get the authentication decoration
    userDAO_ = (DAO) x.get("userDAO");
    sessionDAO_ = (DAO) x.get("sessionDAO");
  }

  @Override
  protected void download(X x) {
    OutputStream os = null;
    HttpServletRequest  req  = x.get(HttpServletRequest.class);
    HttpServletResponse resp = x.get(HttpServletResponse.class);

    try {
      String path = req.getRequestURI();
      String id = path.replaceFirst("/service/" + nspec_.getName() + "/", "");

      // find file from file dao
      File file = (File) fileDAO_.find_(x, id);
      if ( file == null || file.getData() == null ) {
        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        return;
      }

      // parse query parameters
      Map<String, String> params = new HashMap<String, String>();
      String query = req.getQueryString();
      String[] pairs = query.split("&");
      for ( String pair : pairs ) {
        int index = pair.indexOf("=");
        params.put(URLDecoder.decode(pair.substring(0, index), "UTF-8"),
            URLDecoder.decode(pair.substring(index + 1), "UTF-8"));
      }

      // get session
      String sessionId = params.get("sessionId");
      Session session = (Session) sessionDAO_.find(sessionId);
      if ( session == null ) {
        resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }

      // get user from session
      User user = (User) userDAO_.find_(x, session.getUserId());
      if ( user == null ) {
        resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }

      // check to see if current user has access to file owner
      if ( userDAO_.find_(x.put("user", user), file.getOwner()) == null ) {
        resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        return;
      }

      // get blob and blob size
      // TODO: figure out why delegate is not being set for IdentifiedBlob
      String blobId = ((IdentifiedBlob) file.getData()).getId();
      Blob blob = getDelegate().find_(x, blobId);
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
      t.printStackTrace();
      throw new RuntimeException(t);
    } finally {
      IOUtils.closeQuietly(os);
    }
  }
}