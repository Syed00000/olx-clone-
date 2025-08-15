# OLX Clone - Development Guide

## 🚀 Quick Start (Development)

### Running Both Backend & Frontend Together (Recommended)
```bash
npm run dev
```
यह command concurrently backend और frontend दोनों को एक साथ run करती है:
- **Backend (API)** - Express server on http://localhost:5000
- **Frontend (UI)** - Vite dev server on http://localhost:5173
- **Proxy Setup** - Frontend automatically proxies `/api/*` calls to backend

### 🎯 What's Fixed:
✅ **Concurrent Setup** - Both servers run together with colored logs  
✅ **API Proxy** - Frontend `/api` calls automatically route to backend  
✅ **Dialog Warning** - Fixed AuthModal accessibility warning  
✅ **Favicon Issue** - Added favicon placeholder  
✅ **Image Carousel** - Fixed ProductDetailPage image navigation  

### Running Services Separately

#### Backend Only
```bash
npm run dev:backend-only
```
- Starts Express.js server with TypeScript
- API endpoints available at http://localhost:5000

#### Frontend Only
```bash
npm run dev:frontend-only
```
- Starts Vite React development server
- UI available at http://localhost:5173

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Both backend + frontend concurrently |
| `npm run dev:backend` | Backend server only (used by concurrently) |
| `npm run dev:frontend` | Frontend Vite server only (used by concurrently) |
| `npm run dev:backend-only` | Backend only (standalone) |
| `npm run dev:frontend-only` | Frontend only (standalone) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push database schema |

## 🎨 Console Output

When you run `npm run dev`, you'll see colored output:
- 🟡 **Yellow** - Backend (API) logs
- 🔵 **Cyan** - Frontend (UI) logs

## 🏗️ Project Structure

```
OLXClone/
├── client/          # Frontend React app
│   ├── src/
│   ├── public/
│   └── index.html
├── server/          # Backend Express app
│   └── index.ts
├── vite.config.ts   # Vite configuration
└── package.json     # Project dependencies & scripts
```

## 🔧 Development Tips

1. **First time setup:**
   ```bash
   npm install
   npm run db:push
   npm run dev
   ```

2. **If ports are busy:**
   - Backend uses port 5000
   - Frontend uses port 5173
   - Check if any other services are running on these ports

3. **Stopping the servers:**
   - Press `Ctrl + C` to stop both servers
   - Both backend and frontend will stop together

4. **Database changes:**
   ```bash
   npm run db:push
   ```

## 🐛 Troubleshooting

- If frontend can't connect to API, check backend is running on port 5000
- If you see CORS errors, ensure both servers are running
- For database issues, run `npm run db:push`

Happy coding! 🎉
