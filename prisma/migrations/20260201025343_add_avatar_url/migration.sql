-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TicketMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site-settings',
    "siteTitle" TEXT NOT NULL DEFAULT 'Navdactyl',
    "siteDescription" TEXT NOT NULL DEFAULT 'Premium Pterodactyl Client Portal',
    "faviconUrl" TEXT NOT NULL DEFAULT '/favicon.ico',
    "dashboardGreeting" TEXT NOT NULL DEFAULT 'Welcome to Navdactyl Dashboard. Happy Hosting!',
    "announcementText" TEXT NOT NULL DEFAULT 'Welcome to Subdactyl Dashboard. Happy Hosting!',
    "showAnnouncement" BOOLEAN NOT NULL DEFAULT true,
    "turnstileEnabled" BOOLEAN NOT NULL DEFAULT false,
    "turnstileSiteKey" TEXT,
    "turnstileSecretKey" TEXT,
    "freeServerMemory" INTEGER NOT NULL DEFAULT 4096,
    "freeServerDisk" INTEGER NOT NULL DEFAULT 10240,
    "freeServerCpu" INTEGER NOT NULL DEFAULT 100,
    "serverLimit" INTEGER NOT NULL DEFAULT 2,
    "allowedNodes" TEXT,
    "pterodactylAccountKey" TEXT,
    "updatedAt" DATETIME NOT NULL
);
