/$CATALINA_HOME/bin/shutdown.sh
rm -rf ../../../../build/
cd ../../../
./gen.sh
cd ../build/
mvn clean package
cd target
mv foam-1.0-SNAPSHOT.war ROOT.war
cp ROOT.war $CATALINA_HOME/webapps/
cd $CATALINA_HOME/bin/
./startup.sh
