# ENOSX AI Deployment Guide

## Web Deployment (Vercel)

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial ENOSX AI commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/enosx-ai.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Set Environment Variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
   - Click "Deploy"

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Electron Desktop App Deployment

### Prerequisites

- Windows 10/11
- Code signing certificate (optional but recommended for distribution)
- electron-builder configured

### Build Windows Installer

1. **Install electron-builder**
   ```bash
   pnpm add -D electron-builder
   ```

2. **Add to package.json**
   ```json
   {
     "build": {
       "appId": "com.enosx.ai",
       "productName": "ENOSX AI",
       "files": [
         "public/**/*",
         "app/**/*",
         "components/**/*",
         "lib/**/*",
         "hooks/**/*",
         "node_modules/**/*"
       ],
       "win": {
         "target": [
           "nsis",
           "portable"
         ],
         "icon": "public/icon.png"
       },
       "nsis": {
         "oneClick": false,
         "allowToChangeInstallationDirectory": true
       }
     }
   }
   ```

3. **Build**
   ```bash
   pnpm build
   pnpm electron-build
   ```

   Output: `dist/ENOSX AI Setup x.x.x.exe`

### Code Signing (Optional)

For production releases, sign your executable:

```bash
# Get a code signing certificate from DigiCert, Sectigo, etc.
# Then set environment variables:
export WIN_CSC_LINK=/path/to/certificate.pfx
export WIN_CSC_KEY_PASSWORD=your_password

pnpm electron-build
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_PUBLIC_SUPABASE_URL=\
    NEXT_PUBLIC_SUPABASE_ANON_KEY=\
    SUPABASE_SERVICE_ROLE_KEY=\
    OPENAI_API_KEY=

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Deploy to Docker Hub

```bash
docker build -t yourusername/enosx-ai:1.0.0 .
docker push yourusername/enosx-ai:1.0.0
```

## Environment Setup Checklist

- [ ] Supabase project created
- [ ] Database tables initialized
- [ ] Supabase credentials in environment
- [ ] OpenAI API key obtained
- [ ] All environment variables set in deployment platform
- [ ] Database backups configured
- [ ] Error logging configured (optional)

## Post-Deployment

1. **Test the application**
   - Create a test chat
   - Verify messages are saved
   - Test streaming responses

2. **Monitor Performance**
   - Check API logs
   - Monitor database performance
   - Track error rates

3. **Update DNS** (if using custom domain)
   ```bash
   vercel env pull  # Pull environment variables
   vercel domains add yourdomain.com
   ```

## Troubleshooting Deployment

### Build Fails
- Check Node version: `node --version` (needs 18+)
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `pnpm install`

### Environment Variables Not Found
- Verify all variables are in platform settings
- Redeploy after adding variables
- Check for typos in variable names

### Database Connection Issues
- Test connection string
- Check Supabase project is active
- Verify IP whitelist if applicable

### Slow Performance
- Check API response times in logs
- Optimize database queries
- Consider caching layer

## Scaling Considerations

### Database
- Monitor Supabase usage
- Set up automatic backups
- Consider read replicas for high traffic

### API
- Cache frequent responses
- Use CDN for static assets
- Implement rate limiting

### Frontend
- Use image optimization
- Implement code splitting
- Monitor bundle size

## Support & Monitoring

- **Error Tracking**: Consider integrating Sentry or similar
- **Analytics**: Use Vercel Analytics or Plausible
- **Performance**: Use Lighthouse CI for CI/CD
- **Uptime**: Use UptimeRobot or similar for monitoring

---

For more information, see the main [README.md](README.md)
