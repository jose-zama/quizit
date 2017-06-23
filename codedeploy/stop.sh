#!/bin/bash
#sudo rm -rf /home/ec2-user/quizit
sudo ln -s "$(which nodejs)" ~/node-v4.4.7-linux-x64/bin/node
forever stopall
