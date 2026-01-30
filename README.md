# 🦅 Navdactyl - Documentation

Welcome to the official installation guide for **Navdactyl**, a high-performance, modern client dashboard for Pterodactyl. This guide provide the **recommended** way to host the panel on a production Linux server using Node.js, PM2, and Nginx.

---

## 🛠️ Requirements
*   **OS**: Ubuntu 22.04+ (Recommended) or Debian 11+
*   **Hardware**: 1 CPU Core, 2GB RAM (Minimum)
*   **DNS**: A domain pointed to your server IP (e.g., `panel.example.com`)

---

## � One-Path Installation Guide

Follow these steps exactly to get your panel live with Nginx and SSL.

### Step 1: Install System Dependencies
Update your server and install the core stack (Node.js, NPM, Nginx, and Git).

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Setup Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx, Git, and PM2
sudo apt install -y nginx git
sudo npm install -g pm2
```

---

### Step 2: Download & Setup Files
Clone the code and prepare the environment.

```bash
# Navigate to web root
cd /var/www

# Clone repository
git clone https://github.com/probablysubeditor69204/Navdactyl.git navdactyl
cd navdactyl

# Install Panel Dependencies
npm install
```

---

### Step 3: Configuration
Configure your environmental variables and database.

```bash
# Create environment file
cp .env.example .env

# Edit configuration
nano .env
```

**Inside `.env`, make sure to set following:**
*   `NEXTAUTH_URL`: Your full domain (e.g., `https://panel.example.com`)
*   `NEXTAUTH_SECRET`: Any random string (used for security)
*   `PTERODACTYL_PANEL_URL`: Your Pterodactyl Panel URL (e.g., `https://my-ptero.com`)
*   `PTERODACTYL_API_URL`: Your Pterodactyl Panel API URL (e.g., `https://my-ptero.com/api`)
*   `PTERODACTYL_API_KEY`: A **Application API** key with full permissions.
*   `DATABASE_URL`: Keep as `"file:./dev.db"` (Recommended for high performance).

**Initialize Database & Build:**
```bash
# Sync database
npx prisma db push
npx prisma generate

# Build the dashboard (This may take 1-2 minutes)
npm run build
```

---

### Step 4: Go Live with PM2 & Nginx
Now we make the panel run forever and connect it to the internet.

**Start the Process:**
```bash
pm2 start npm --name "navdactyl" -- start
pm2 save
pm2 startup
```

**Configure Nginx:**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/navdactyl
```

**Paste this exact block (Replace `your-domain.com` with your real domain):**
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
}
```

**Activate Nginx:**
```bash
sudo ln -s /etc/nginx/sites-available/navdactyl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Step 5: Secure with SSL (HTTPS)
SSL is mandatory for security and WebSocket support.

```bash
# Install Certbot
sudo apt install -y python3-certbot-nginx

# Request Certificate
sudo certbot --nginx -d your-domain.com
```

---

## 🔄 Maintenance Commands

| Action | Command |
| :--- | :--- |
| **Update Panel** | `git pull && npm install && npm run build && pm2 restart navdactyl` |
| **View Logs** | `pm2 logs navdactyl` |
| **Check Status** | `pm2 status` |
| **Restart** | `pm2 restart navdactyl` |

---

## 🌟 Support & Credits
Created with ❤️ by the Navdactyl Team. If you enjoy this project, consider giving it a star on GitHub!
