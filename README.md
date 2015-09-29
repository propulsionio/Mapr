ssh -i "mapr.pem" ubuntu@52.20.232.179
curl https://install.meteor.com/ | sh
sudo apt-get git
sudo apt-get node
sudo apt-get npm
sudo apt-get java-jre
sudo apt-get java-jdk
git clone https://github.com/propulsionio/Mapr.git
cd Mapr
sh orientdb/bin/server.sh
