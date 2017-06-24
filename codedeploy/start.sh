source /home/ec2-user/.bash_profile
cd /home/ec2-user/quizit
forever start --workingDir /home/ec2-user/quizit -c "npm start" ./
