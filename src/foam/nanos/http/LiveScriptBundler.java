/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import com.sun.nio.file.SensitivityWatchEventModifier;
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
import static java.nio.file.StandardWatchEventKinds.*;

public class LiveScriptBundler
  implements WebAgent, ContextAware
{
  protected X x_;

  // Filesystem
  protected String path_;
  protected WatchService watcher_;
  protected LinkedBlockingQueue<String> fileNames_;

  // Caching
  protected String javascriptBuffer_;

  // Configuration
  protected static final String FOAM_BIN_PATH = "./tools/js_build/foam-bin.js";
  protected static final String JS_BUILD_PATH = "./tools/js_build/build.js";

  private interface FileUpdateListener {
    public void onFileUpdate(String foamName, Path realPath);
  }

  public X getX() {
    return x_;
  }

  public void setX(X x) {
    x_ = x;
  }

  private class WatcherThread implements Runnable {
    protected Path               realDir_;
    protected String             foamDir_;
    protected WatchService       watcher_;
    protected FileUpdateListener listener_;

    public WatcherThread(
      WatchService watcher, Path realDir, String foamDir,
      FileUpdateListener listener
    ) {
      watcher_  = watcher;
      realDir_  = realDir;
      foamDir_  = foamDir;
      listener_ = listener;
    }

    // Standard WatchService loop
    public void run() {
      for ( ; ; ) {
        WatchKey key;
        try {
          key = watcher_.take();
        } catch (InterruptedException x) {
          return;
        }
        for ( WatchEvent<?> event : key.pollEvents() ) {
          WatchEvent.Kind<?> kind = event.kind();
          if ( kind == OVERFLOW ) {
            log_("ERROR", "File watch buffer overflowed!");
            continue;
          }

          WatchEvent<Path> ev = (WatchEvent<Path>) event;
          Path filename = ev.context();

          // Ex: foamPath="foam/core/Property.js"
          String foamPath = foamDir_ + "/" + filename.toString();

          if ( fileNames_.contains(foamPath) ) {
            log_("UPDATE", foamPath);

            // Run the javascript builder
            listener_.onFileUpdate(foamPath, realDir_.resolve(filename));

          } else {
            log_("IGNORE", foamPath);
          }

          if ( ! key.reset() ) break;
        }
      }
    }
  }

  public LiveScriptBundler() {
    this(System.getProperty("user.dir"));
  }

  public LiveScriptBundler(String path) {
    fileNames_ = new LinkedBlockingQueue<>();
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

      doRebuildJavascript(null, null);

      watcher_ = FileSystems.getDefault().newWatchService();

      // Read each files.js file
      for ( Pair<String,String> currentFilesPath : filesPaths ) {
        BufferedReader filesJsReader = new BufferedReader(
          new FileReader(Paths.get(currentFilesPath.getValue()).toString()));
        List<String>   paths         = parseFilesjs(filesJsReader);
        Set<Path>      directories   = new LinkedHashSet<>();

        for ( String foamName : paths ) {
          Path f = Paths.get(path_, currentFilesPath.getKey(), foamName);

          // Add containing folder to a set for registering watchers
          directories.add(f.getParent());

          fileNames_.add(foamName);
        }

        // Register a separate thread to watch each directory.
        // (this is necessary with WatchService)
        for ( Path d : directories ) {
          WatchService watcher = FileSystems.getDefault().newWatchService();
          d.register(watcher,
            new WatchEvent.Kind[]{ENTRY_CREATE, ENTRY_DELETE, ENTRY_MODIFY},
            SensitivityWatchEventModifier.HIGH
          );

          // Find relative path from `src` folder to get foam path
          Path relative = Paths.get(path_, currentFilesPath.getKey())
            .relativize(d.toAbsolutePath()).normalize();

          Thread watcherThread = new Thread(new WatcherThread(
            watcher,
            d,
            relative.toString(),
            this::doRebuildJavascript
          ));
          watcherThread.start();
        }
      }
    } catch ( Throwable t ) {
      t.printStackTrace();
      System.err.println("Failed to initialize filesystem watcher! :(");
      System.exit(1);
    }
  }

  private synchronized void doRebuildJavascript(String foamName, Path realPath) {
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

    synchronized (this) {} // Wait for build to finish before serving
    pw.println(javascriptBuffer_);
  }

  // Proof-of-concept parser, to be replaced with a foam.lib.parse.Parser soon
  private List<String> parseFilesjs(BufferedReader reader)
    throws IOException
  {
    // This is what we want to get
    List<String> paths = new ArrayList<>();

    // For one specific line in iso20022 files.js
    boolean lineException = false;

    for ( String line = reader.readLine() ; line != null ; line = reader.readLine() ) {
      line = line.trim();
      if ( line.length() < 1 ) continue;
      if ( lineException ) {
        line = "{" + line + "}";
        lineException = false;
      } else if ( line.charAt(0) != '{' ) {
        continue;
      }
      if ( line.length() < 3 ) {
        lineException = true;
        continue;
      }

      String name  = "";
      String flags = "";
      int    pos   = 1;

      final int STATE_FIND_NAME          = 1;
      final int STATE_EAT_NAME           = 2;
      final int STATE_EAT_NAME_2         = 0x12;
      final int STATE_SKIP_COMMA         = 3;
      final int STATE_SKIP_COMMA_2       = 0x13;
      final int STATE_FIND_FLAGS_OR_TERM = 4;
      final int STATE_SKIP_WS            = 5;

      int state         = STATE_FIND_NAME;
      int stateStack[]  = {0, 0, 0}; // nested control flow makes it fun
      int stateStackPtr = 0;

      for ( boolean done = false; !done; ) {
        switch (state) {
          case STATE_SKIP_WS:
            if (
              line.charAt(pos) == ' '  ||
              line.charAt(pos) == '\t' ||
              line.charAt(pos) == '\r' // unlikely, but just to be safe
              // '\n' is not possible here
            ) {
              pos++;
            } else {
              // Go to the next state which the previous state
              // wanted us to go to.
              state = stateStack[--stateStackPtr];
            }
            break;
          case STATE_FIND_NAME:
            if ( line.substring(pos).startsWith("name:") ) {
              pos += 5;
              state = STATE_EAT_NAME;
            } else if ( line.substring(pos).startsWith("\"name\":") ) {
              pos += 7;
              state = STATE_EAT_NAME;
            } else {
              pos++;
            }
            break;
          case STATE_EAT_NAME:
            // Remember where we were after skipping whitespace
            stateStack[stateStackPtr++] = STATE_EAT_NAME_2;
            state = STATE_SKIP_WS;
            break;
          case STATE_EAT_NAME_2:
            char term = line.charAt(pos);
            pos++;
            int nameStart = pos;
            boolean inEscape = false;
            for ( ;;pos++ ) {
              char thisChar = line.charAt(pos);
              if ( inEscape ) {
                inEscape = false;
              } else {
                if ( thisChar == '\\' ) {
                  inEscape = true;
                } else if (thisChar == term) {
                  break;
                }
              }
            }
            name = line.substring(nameStart, pos);
            pos++;
            // Remember where we were after skipping a comma
            stateStack[stateStackPtr++] = STATE_FIND_FLAGS_OR_TERM;
            state = STATE_SKIP_COMMA;
            break;
          case STATE_SKIP_COMMA:
            // Remember where we were after skipping whitespace
            stateStack[stateStackPtr++] = STATE_SKIP_COMMA_2;
            state = STATE_SKIP_WS;
            break;
          case STATE_SKIP_COMMA_2:
            if ( line.charAt(pos) == ',' ) {
              pos++;
            }
            state = stateStack[--stateStackPtr];
            break;
          case STATE_FIND_FLAGS_OR_TERM:
            // For now, don't actually "find" the flags;
            // instead, take the whole line after the file name
            // to later see if it contains "web" anywhere.
            flags = line.substring(pos);
            done = true;
        }
      }

      name += ".js";
      paths.add(name);
    }

    return paths;
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
