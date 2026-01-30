# Navdactyl - Modern Pterodactyl Client Dashboard

A modern, highly customizable client dashboard for Pterodactyl, built with Next.js, TailwindCSS, and Shadcn UI.

---

## 🚀 Deployment Guide (Production)

This guide will walk you through setting up Navdactyl on a Linux server (Ubuntu/Debian recommended) using **Node.js**, **PM2**, and **Nginx** for a production-ready environment.

### 📋 Prerequisites

Ensure your server helps the following installed:
*   **Node.js 18+** (LTS recommended)
*   **Git**
*   **Nginx**
*   **PM2** (Process Manager)

```bash
# Install Node.js & NPM (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx & Git
sudo apt update
sudo apt install nginx git -y

# Install PM2 globally
sudo npm install -g pm2
```

---

### 🛠️ Installation

1.  **Clone the Repository**
    Navigate to your preferred directory (e.g., `/var/www/`) and clone the project.
    ```bash
    cd /var/www
    git clone https://github.com/probablysubeditor69204/Navdactyl.git navdactyl
    cd navdactyl
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables**
    Copy the example environment file and edit it with your details.
    ```bash
    cp .env.local.example .env.local
    nano .env.local
    ```

    **Required Variables:**
    ```env
    NEXTAUTH_URL=https://your-domain.com
    NEXTAUTH_SECRET=generate-a-random-secret-here

    # Pterodactyl Details
    PTERODACTYL_API_URL=https://panel.your-hosting.com
    PTERODACTYL_API_KEY=ptla_your_api_key_here

    # Database (MongoDB)
    DATABASE_URL="mongodb+srv://..."
    ```

4.  **Database Migration (Prisma)**
    Push your schema to the database.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Build the Application**
    Compile the Next.js application for production.
    ```bash
    npm run build
    ```

---

### ⚡ Running with PM2

Use PM2 to keep your application running in the background.

```bash
# Start the application
pm2 start npm --name "navdactyl" -- start

# Save the PM2 list so it restarts on reboot
pm2 save
pm2 startup
```

---

### 🌐 Nginx Configuration (Reverse Proxy)

Set up Nginx to serve your application on port 80/443.

1.  **Create a Config File**
    ```bash
    sudo nano /etc/nginx/sites-available/navdactyl
    ```

2.  **Paste the Configuration**
    Replace `your-domain.com` with your actual domain.

    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Optional: Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
    }
    ```

3.  **Enable the Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/navdactyl /etc/nginx/sites-enabled/
    sudo nginx -t  # Test configuration
    sudo systemctl restart nginx
    ```

---

### 🔒 SSL Certificate (HTTPS)

Secure your site with a free Let's Encrypt SSL certificate.

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain Certificate
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to redirect HTTP to HTTPS.

---

### 🔄 Updating

To update the panel to the latest version:

```bash
cd /var/www/navdactyl

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Rebuild the app
npm run build

# Restart the process
pm2 restart navdactyl
```

---

### 🐛 Troubleshooting

*   **Logs**: Check PM2 logs with `pm2 logs navdactyl`.
*   **Build Errors**: Ensure your server has enough RAM (at least 2GB is recommended for building). providing swap memory can help.
