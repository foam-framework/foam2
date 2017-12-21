package foam.nanos.http;

import foam.core.X;
import foam.nanos.boot.NSpec;
import foam.nanos.boot.NSpecAware;
import foam.util.SafetyUtil;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.text.StringEscapeUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.HashMap;

public class FileWebAgent
    implements WebAgent, NSpecAware
{
  protected static final int                     BUFFER_SIZE = 4096;
  protected static final String                  DEFAULT_EXT = "application/octet-stream";
  protected static final HashMap<String, String> EXTS        = new HashMap<>();

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

  protected NSpec nspec_;
  protected String path_;
  protected String cwd_;

  public FileWebAgent() {
    this("");
  }

  public FileWebAgent(String path) {
    this(path, System.getProperty("user.dir"));
  }

  public FileWebAgent(String path, String cwd) {
    this.path_ = path;
    this.cwd_ = cwd;
  }

  @Override
  public void execute(X x) {
    PrintWriter pw = (PrintWriter) x.get(PrintWriter.class);
    HttpServletRequest req = (HttpServletRequest) x.get(HttpServletRequest.class);
    HttpServletResponse resp = (HttpServletResponse) x.get(HttpServletResponse.class);

    String path = null;
    BufferedInputStream is = null;

    try {
      path = req.getRequestURI().replaceFirst("/?service/" + nspec_.getName() + "/?", "") + path_;
      File src = new File(SafetyUtil.isEmpty(path) ? "./" : path);

      boolean pathStartsWithCwd = src.getAbsolutePath().startsWith(cwd_);
      if ( ! pathStartsWithCwd ) {
        throw new FileNotFoundException("File not found: " + path);
      }

      // handle reading of directories
      if ( src.isDirectory() && src.canRead() ) {
        resp.setContentType(EXTS.get("html"));
        pw.write(
            "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<body>\n" +
                "<ul style=\"list-style-type:disc\">");

        File[] files = src.listFiles();
        for ( File file : files ) {
          pw.write("<li>" + "<a href=\"/service/" + StringEscapeUtils.escapeHtml4(nspec_.getName()) + "/" + path
              + ( ! path.isEmpty() && ! path.endsWith("/") ? "/" : "" )
              + file.getName() + "\"?>" + file.getName() + "</a></li>");
        }

        pw.write("</ul>  \n" +
            "</body>\n" +
            "</html>");
        return;
      }

      // handle reading of files
      if ( src.isFile() && src.canRead() ) {
        String ext = EXTS.get(FilenameUtils.getExtension(src.getName()));
        is = new BufferedInputStream(new FileInputStream(src));

        resp.setContentType(! SafetyUtil.isEmpty(ext) ? ext : DEFAULT_EXT);
        resp.setHeader("Content-Disposition", "filename=\"" + StringEscapeUtils.escapeHtml4(src.getName()) + "\"");
        resp.setContentLengthLong(src.length());

        int read = 0;
        byte[] buffer = new byte[BUFFER_SIZE];
        while ( (read = is.read(buffer, 0, BUFFER_SIZE)) != -1 ) {
          resp.getOutputStream().write(buffer, 0, read);
        }
        return;
      }

      // file not found
      throw new FileNotFoundException("File not found: " + path);
    } catch (Throwable t) {
      t.printStackTrace();
      resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
      resp.setContentType(EXTS.get("json"));
      pw.write("{\"error\": \"File not found\"," + "\"filename\": \"" + StringEscapeUtils.escapeJson(path) + "\"}");
    } finally {
      IOUtils.closeQuietly(is);
    }
  }

  @Override
  public void setNSpec(NSpec spec) {
    this.nspec_ = spec;
  }
}