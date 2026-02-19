# Push Your Project to GitHub

Your code is on your computer but not on GitHub yet. Follow these steps to get it online.

## Step 1: Install Git (if not already done)

Git may still be installing. When finished:
- **Restart your terminal** (or close and reopen Cursor) so Git is recognized
- Or open a **new** terminal tab

## Step 2: Create a New Repository on GitHub

1. Go to https://github.com/new
2. **Repository name:** `snag-management-system` (or any name you like)
3. Set to **Public**
4. **Leave unchecked:** "Add a README", "Add .gitignore", "Add license" (you already have these locally)
5. Click **Create repository**

## Step 3: Push Your Local Code to GitHub

Open a **new** terminal in your project folder and run these commands one by one:

```powershell
cd c:\Users\User\snag-management-system

# Initialize git (if not already)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit - Snag Management System"

# Rename branch to main (if needed)
git branch -M main

# Add your GitHub repo as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/snag-management-system.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username (e.g., if your GitHub profile is `github.com/johndoe`, use `johndoe`).

## Step 4: If Git Asks for Login

- GitHub no longer accepts passwords for `git push`
- Use a **Personal Access Token** instead:
  1. Go to https://github.com/settings/tokens
  2. Click "Generate new token (classic)"
  3. Name it "Cursor" or "Deploy"
  4. Check the **repo** scope
  5. Generate and **copy the token**
  6. When `git push` asks for a password, paste the token (not your GitHub password)

## Step 5: Deploy on Railway

Once your code is on GitHub:
1. Go to https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Select your `snag-management-system` repo
4. Railway will detect the project. You may need to configure the **root directory** to `backend` (since your backend is in a subfolder)
5. Add your environment variables
6. Deploy!

---

## Alternative: Deploy Without GitHub (Railway CLI)

If you prefer not to use GitHub, you can deploy directly with Railway CLI:

1. Install Railway CLI: `npm install -g @railway/cli`
2. Run `railway login` in a terminal
3. Run `railway init` in your project
4. Run `railway up` from the `backend` folder to deploy

This deploys from your local files without needing GitHub.
