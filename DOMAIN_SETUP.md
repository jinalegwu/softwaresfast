# Domain Configuration Guide for Softwaresfast.com

## Overview
This guide helps you connect your GitHub Pages website (hosted at `jinalegwu.github.io/softwaresfast/`) to your custom domain at Hostinger (`softwaresfast.com`).

## Step-by-Step Instructions

### Phase 1: GitHub Pages Configuration

#### Step 1.1: Enable GitHub Pages
1. Go to: https://github.com/jinalegwu/softwaresfast
2. Click **Settings** → **Pages** (left sidebar)
3. Under "Build and deployment":
   - Source: Select `Deploy from a branch`
   - Branch: Select `main`
   - Folder: Select `/ (root)`
4. Click **Save**

#### Step 1.2: Add Custom Domain to GitHub
1. Still in Settings → Pages
2. Under "Custom domain", enter: `softwaresfast.com`
3. Click **Save**
4. GitHub will create a `CNAME` file automatically
5. Wait for the DNS check to complete (usually 24 hours)

### Phase 2: Hostinger DNS Configuration

#### Step 2.1: Access Hostinger DNS Settings
1. Log in to Hostinger: https://www.hostinger.com
2. Go to **Hosting** → Your Domain
3. Click **Manage** or **DNS/Nameserver Settings**
4. Find **DNS Zone** or **DNS Records**

#### Step 2.2: Add GitHub Pages DNS Records

**Option A: Using Hostinger's Recommended Method (CNAME)**

Add these DNS records:

| Record Type | Host/Name | Value | TTL |
|------------|-----------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | jinalegwu.github.io | 3600 |

**Option B: Alternative - Using CNAME for Root Domain**

If Hostinger doesn't support root domain CNAME:
| Record Type | Host/Name | Value | TTL |
|------------|-----------|-------|-----|
| CNAME | www | jinalegwu.github.io | 3600 |

Then redirect root domain (`softwaresfast.com`) to `www.softwaresfast.com` using Hostinger's URL redirect feature.

#### Step 2.3: Verify DNS Changes
1. After adding records, wait 24-48 hours for DNS propagation
2. Check DNS status: https://dnschecker.org/
3. Verify your records are pointing to GitHub Pages

### Phase 3: Final Configuration

#### Step 3.1: Enable HTTPS
1. Return to GitHub Settings → Pages
2. Check **"Enforce HTTPS"** (this will appear once DNS is verified)
3. GitHub will automatically issue an SSL certificate

#### Step 3.2: Test Your Website
1. Visit: https://softwaresfast.com
2. It should display your Softwaresfast website
3. Check that HTTPS is working (green lock icon)

## Troubleshooting

### DNS Not Resolving
- **Problem**: Website still shows Hostinger page
- **Solution**: 
  - Clear browser cache (Ctrl+Shift+Delete)
  - Wait 24-48 hours for full DNS propagation
  - Check DNS records at: https://dnschecker.org/

### GitHub Showing DNS Check Failed
- **Problem**: GitHub says DNS check failed
- **Solution**:
  - Verify A records are correctly added in Hostinger
  - Ensure CNAME record for www subdomain is set
  - Wait and retry the DNS check in GitHub

### Mixed Content Warnings
- **Problem**: HTTPS page shows unsecure content warnings
- **Solution**:
  - Enable "Enforce HTTPS" in GitHub Pages settings
  - Wait for SSL certificate to be issued

### Email Not Working After Domain Transfer
- **Problem**: Email forwarding from Hostinger stops working
- **Solution**:
  - Update MX records in Hostinger DNS
  - Keep original Hostinger MX records
  - Don't modify email-related DNS records

## Important Files for GitHub Pages

Your repository automatically uses:
- `.nojekyll` - Tells GitHub to skip Jekyll processing
- `CNAME` - Created automatically by GitHub, contains your domain
- `index.html` - Your main website file

## Final Checklist

- [ ] GitHub Pages enabled in repository settings
- [ ] Custom domain added to GitHub Pages
- [ ] DNS A records added in Hostinger (4 records)
- [ ] CNAME record added for www in Hostinger
- [ ] Waited 24-48 hours for DNS propagation
- [ ] Website accessible at softwaresfast.com
- [ ] HTTPS working (green lock icon)
- [ ] Mobile site displays correctly
- [ ] All links and forms working

## Support Resources

- **GitHub Pages Docs**: https://docs.github.com/en/pages
- **Hostinger Support**: https://support.hostinger.com
- **DNS Checker**: https://dnschecker.org/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

## Next Steps

1. Enable GitHub Pages in repository settings
2. Add custom domain in GitHub Pages settings
3. Configure DNS records in Hostinger
4. Wait for DNS propagation
5. Verify HTTPS is working
6. Your website is live at softwaresfast.com!

---

**Questions?** Contact Hostinger support or GitHub support for domain-specific issues.
