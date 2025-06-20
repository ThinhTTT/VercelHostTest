# R3F Vite Starter

A React Three Fiber application with Socket.IO real-time features.

## Railway Deployment

### Prerequisites

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm install -g @railway/cli`

### Deployment Steps

1. **Login to Railway:**

   ```bash
   railway login
   ```

2. **Initialize Railway project:**

   ```bash
   railway init
   ```

3. **Deploy to Railway:**

   ```bash
   railway up
   ```

4. **Get your deployment URL:**
   ```bash
   railway domain
   ```

### Environment Variables

The following environment variables are automatically set by Railway:

- `PORT`: Railway sets this automatically
- `NODE_ENV`: Set to 'production' in Railway

### Troubleshooting

1. **Check deployment logs:**

   ```bash
   railway logs
   ```

2. **Test the health endpoint:**
   Visit `https://your-app.railway.app/health`

3. **Check Socket.IO connection:**
   - Open browser dev tools
   - Look for connection logs in the console
   - Check for any CORS errors

### Local Development

```bash
npm install
npm run dev
```

The server will run on `http://localhost:3002`
