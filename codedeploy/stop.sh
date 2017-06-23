source /home/ec2-user/.bash_profile
sudo ln -s "$(which nodejs)" /usr/local/bin/node
sudo rm -rf /home/ec2-user/quizit
~/node-v4.4.7-linux-x64/bin/forever stopall
