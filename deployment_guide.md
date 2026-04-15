# Growvest Deployment Guide 🚀

Follow these steps to deploy your Growvest application to **Render** (Backend) and **Vercel** (Frontend).

---

## 1. MongoDB Atlas Setup (Database)
Before deploying, ensure you have a cloud database.

1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new **Cluster** (Shared/Free Tier is fine).
3.  Go to **Database Access** and create a user with a password.
4.  Go to **Network Access** and click **Add IP Address** -> **Allow Access From Anywhere** (0.0.0.0/0).
5.  Go to **Deployment** -> **Database** -> **Connect** -> **Drivers**.
6.  Copy your **Connection String** (it looks like `mongodb+srv://user:password@cluster.mongodb.net/...`).

---

## 2. Backend Deployment (Render)
This will host your Node.js API.

1.  Log in to [Render](https://render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `growvest-api`
    *   **Root Directory**: `server`
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node index.js`
5.  Click **Advanced** -> **Add Environment Variable**:
    *   `MONGO_URI`: (Your MongoDB Connection String from Step 1)
    *   `PORT`: `10000`
6.  Click **Create Web Service**.
7.  **Wait for deployment**. Once finished, copy the URL of your Web Service (e.g., `https://growvest-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)
This will host your React/Vite application.

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **Add New** -> **Project**.
3.  Import your GitHub repository.
4.  Configure the Project:
    *   **Framework Preset**: `Vite`
    *   **Root Directory**: `client`
5.  Expand **Environment Variables** and add:
    *   `VITE_API_URL`: (Paste the Render URL from Step 2 **without** a trailing slash)
6.  Click **Deploy**.

---

## 💡 Important Notes

> [!TIP]
> **API URL**: When adding `VITE_API_URL` to Vercel, ensure it looks like `https://growvest-api.onrender.com`. Do not add `/api` or a `/` at the end.

> [!WARNING]
> **Cold Starts**: Render's free tier "spins down" after inactivity. The first request to your dashboard might take 30-50 seconds to load if it hasn't been used recently.

> [!NOTE]
> **CORS**: Your server is currently configured to allow all origins (`app.use(cors())`). This ensures that your Vercel frontend can communicate with your Render backend without issues.
