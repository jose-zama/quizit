PATH=$PATH:$HOME/.local/bin:$HOME/bin

export PATH

export NODE_ENV=production

export PATH="$PATH:/home/ec2-user/node-v4.4.7-linux-x64/bin"

sudo rm -rf /home/ec2-user/quizit
forever stopall
