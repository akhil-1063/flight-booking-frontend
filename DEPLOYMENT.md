# Frontend Deployment Guide for Render

## Prerequisites
- GitHub repository connected to Render
- Backend deployed and running

## Environment Variables to Set on Render

```
VITE_API_BASE_URL=https://booking-backend-4-8bxx.onrender.com/api/v1
```

## Deployment Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **On Render Dashboard**
   - Go to your frontend service
   - Navigate to "Environment" tab
   - Add `VITE_API_BASE_URL` environment variable
   - Click "Save Changes"

3. **Verify Deployment**
   - Visit: `https://booking-frontend-n6pv.onrender.com`
   - Check browser console for errors
   - Test API connectivity

## Build Configuration

The frontend is configured as a static site with:
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `./dist`
- **Redirects**: Configured via `public/_redirects` for client-side routing

## Local Development

To run locally with production backend:
```bash
npm install
npm run dev
```

Update `.env` to point to localhost backend:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## Troubleshooting

- **API calls fail**: Check `VITE_API_BASE_URL` is set correctly
- **404 on refresh**: Ensure `_redirects` file exists in `public/` folder
- **CORS errors**: Verify backend has frontend URL in CORS whitelist
- **Build fails**: Check Node.js version compatibility

## Testing Production Build Locally

```bash
npm run build
npm run preview
```

This will serve the production build locally at `http://localhost:4173`
