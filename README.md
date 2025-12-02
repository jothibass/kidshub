Kidshub Option3 Full Deploy Bundle

Structure:
- backend/        Node backend, routes, migrations
- frontend/       frontend placeholder and demo import
- deploy/         deploy scripts, nginx config, pm2 ecosystem
- .github/workflows/deploy.yml  GitHub Actions to copy files and run deploy.sh on EC2

How to use:
1. Generate a deploy SSH key locally, add its public key to EC2 ~/.ssh/authorized_keys.
2. Add the private key as GitHub secret EC2_SSH_KEY and set EC2_HOST secret.
3. Add RDS secrets if you want Actions to run migrations: RDS_ENDPOINT, RDS_MASTER_USER, RDS_MASTER_PASS, DB_NAME
4. Push to main — Actions will copy /home/ec2-user/deploy and run deploy.sh.

Notes:
- Replace the placeholder ChildProfile UI with the detailed UI bundle I previously provided (or copy from that zip).
- The backend uses environment variables. Create /var/www/kidshub/backend/.env on EC2 or set them in your process manager.
