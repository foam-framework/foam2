/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.ContextAware;
import foam.core.X;
import foam.nanos.logger.Logger;
import java.io.*;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;
import java.util.concurrent.LinkedBlockingQueue;
import javax.servlet.http.HttpServletResponse;
import static java.nio.file.FileVisitResult.CONTINUE;
import io.methvin.watcher.DirectoryWatcher;

public class LiveScriptBundler
  implements WebAgent, ContextAware
{
  protected X x_;

  // Filesystem
  protected String path_;
  protected Set<String> fileNames_;

  // Caching
  protected String javascriptBuffer_;

  // Configuration
  protected static final String FOAM_BIN_PATH = "./tools/js_build/foam-bin.js";
  protected static final String JS_BUILD_PATH = "./tools/js_build/build.js";

  private interface FileUpdateListener {
    public void onFileUpdate();
  }

  public X getX() {
    return x_;
  }

  public void setX(X x) {
    x_ = x;
  }

  public LiveScriptBundler() {
    this(System.getProperty("user.dir"));
  }

  public LiveScriptBundler(String path) {
    fileNames_ = new HashSet<>();
    path_ = path;

    try {
      // Create list of files.js locations
      ArrayList<Pair<String, String>> filesPaths = new ArrayList<>();

      // Walk through the project directory to find files.js files
      Files.walkFileTree(Paths.get(path_), new SimpleFileVisitor<Path>() {
        @Override
        public FileVisitResult visitFile(Path path, BasicFileAttributes attr) {
          path = Paths.get(path_).relativize(path);
          Path sourcePath = null;

          if ( ! attr.isRegularFile() ) {
            return CONTINUE;
          }

          // Find any file named files.js
          String filename = path.getFileName().toString();
          if (
            filename.equals("files.js") ||
            filename.equals("nanos.js") ||
            filename.equals("support.js")
          ) {
            // Locate the closest `src` folder if one exists
            for ( int i = path.getNameCount()-1; i >= 0; i-- ) {
              String dirname = path.getName(i).getFileName().toString();
              if ( dirname.equals("src") ) {
                sourcePath = path.subpath(0, i+1);
                break;
              }
            }

            // Add this file if it was found inside a `src` folder
            if ( sourcePath != null ) {
              filesPaths.add(new Pair<>(
                sourcePath.toString(), path.toString()
              ));
            }
          }
          return CONTINUE;
        }
      });

      doRebuildJavascript();

      // Read each files.js file
      for ( Pair<String,String> currentFilesPath : filesPaths ) {
        DirectoryWatcher.builder()
          .path(Paths.get(path_, currentFilesPath.getKey()))
          .listener(event -> {
            if ( event.path().getFileName().toString().endsWith(".js") ) {
              this.doRebuildJavascript();
            }
          })
          .build().watchAsync();
      }
    } catch ( Throwable t ) {
      t.printStackTrace();
      System.err.println("Failed to initialize filesystem watcher! :(");
      System.exit(1);
    }
  }

  private synchronized void doRebuildJavascript() {
    try {
      log_("START", "Building javascript... (JS)");

      Process        p  = new ProcessBuilder(JS_BUILD_PATH).start();
      BufferedReader br = new BufferedReader(new InputStreamReader(p.getInputStream()));
      String         line;
      while ( (line = br.readLine()) != null ) {
        log_("JS", "js> " + line);
      }

      String contents = new String(Files.readAllBytes(Paths.get(FOAM_BIN_PATH)));
      javascriptBuffer_ = contents;
      log_("DONE", "JS");
    } catch (IOException e) {
      log_("ERROR", e.getMessage());
    }
  }

  @Override
  public void execute(X x) {
    PrintWriter         pw = x.get(PrintWriter.class);
    HttpServletResponse r  = x.get(HttpServletResponse.class);
    r.setHeader("Content-Type", "application/javascript");

    synchronized (this) { /* Wait for build to finish before serving */ } 
    pw.println(javascriptBuffer_);
  }

  private void log_(String evt, String msg) {
    String eventStr =
        ( (evt.equals("UPDATE") ) ? "\033[32m" : "" ) +
        ( (evt.equals("IGNORE") ) ? "\033[36m" : "" ) +
        ( (evt.equals("ERROR")  ) ? "\033[31m" : "" ) +
        "[" + evt + "]" +
        ( (evt.equals("UPDATE") || evt.equals("IGNORE") || evt.equals("ERROR") )
          ? "\033[0m"
          : "" );

    // Fallback in case setX has not been called yet
    if ( x_ == null ) {
      System.err.printf(
        "NO_LOGGER,%s,%s,%s,%s\n",
        ( evt.equals("ERROR") ) ? "ERROR" : "INFO",
        this.getClass().getSimpleName(), eventStr, msg);
      return;
    }

    Logger logger = (Logger) x_.get("logger");
    if ( evt.equals("ERROR") ) {
      logger.error(this.getClass().getSimpleName(), eventStr, msg);
    }
    else {
      logger.info(this.getClass().getSimpleName(), eventStr, msg);
    }
  }

  private class Pair<K,V> {
    private K k;
    private V v;

    public Pair(K k, V v) {
      this.k = k;
      this.v = v;
    }

    public K getKey() { return k; }
    public V getValue() { return v; }
  }
}
