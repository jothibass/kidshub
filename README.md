KidsHub EC2 deployable repo

Instructions:
1. Create Postgres RDS and get DB credentials.
2. Launch Amazon Linux 2 EC2 (t2.micro), open ports 22/80/443, associate elastic IP if needed.
3. SSH to EC2 and run ec2/bootstrap.sh (paste contents and execute).
4. On your machine, build frontend: cd frontend && npm ci && npm run build
5. Create deploy.tar.gz as in workflow or use GitHub Actions.
6. Upload deploy.tar.gz to EC2, extract to /home/ec2-user/, move frontend to /var/www/kidshub/dist and backend to /var/www/kidshub/backend
7. Create /var/www/kidshub/backend/.env with DB creds.
8. On EC2: cd /var/www/kidshub/backend && npm ci --production && pm2 start server.js --name kidshub
9. Visit http://EC2_PUBLIC_IP/ to see the site.
