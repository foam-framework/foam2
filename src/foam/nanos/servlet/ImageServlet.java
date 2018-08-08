/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.servlet;

import foam.util.SafetyUtil;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.text.StringEscapeUtils;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ImageServlet
  extends HttpServlet
{
  protected static final int                 BUFFER_SIZE = 4096;
  protected static final String              DEFAULT_EXT = "application/octet-stream";
  protected static final Map<String, String> EXTS = new HashMap<String, String>();

  static {
    EXTS.put("js",    "application/javascript");
    EXTS.put("json",  "application/json");
    EXTS.put("class", "application/java-vm");
    EXTS.put("xml",   "application/xml");

    EXTS.put("gif",   "image/gif");
    EXTS.put("png",   "image/png");
    EXTS.put("svg",   "image/svg+xml");

    EXTS.put("java",  "text/x-java-source");
    EXTS.put("csv",   "text/csv");
    EXTS.put("txt",   "text/plain");
    EXTS.put("html",  "text/html");
  }

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException
  {
    // get path
    String cwd = System.getProperty("user.dir");
    String[] paths = getServletConfig().getInitParameter("paths").split(":");
    String reqPath = req.getRequestURI().replaceFirst("/?images/?", "/");

    // enumerate each file path
    for ( int i = 0 ; i < paths.length ; i++ ) {
      File src = new File(cwd + "/" + paths[i] + reqPath);
      if ( src.isFile() && src.canRead() && src.getCanonicalPath().startsWith(new File(paths[i]).getCanonicalPath()) ) {
        String ext = EXTS.get(FilenameUtils.getExtension(src.getName()));
        try ( BufferedInputStream is = new BufferedInputStream(new FileInputStream(src)) ) {
          resp.setContentType(!SafetyUtil.isEmpty(ext) ? ext : DEFAULT_EXT);
          resp.setHeader("Content-Disposition", "filename=\"" + StringEscapeUtils.escapeHtml4(src.getName()) + "\"");
          resp.setContentLengthLong(src.length());

          IOUtils.copy(is, resp.getOutputStream());
          return;
        }
      }
    }
    
    resp.sendError(resp.SC_NOT_FOUND);
  }
}
