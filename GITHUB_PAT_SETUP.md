# 🔑 GitHub Personal Access Token (PAT) Setup

## Step 1: Create a Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Event Org Deployment"
4. Set expiration: "90 days" (or your preference)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

## Step 2: Use PAT for Git Push

### Option A: Use PAT in URL (Recommended)
```bash
# Replace YOUR_TOKEN with your actual PAT
git remote set-url origin https://YOUR_TOKEN@github.com/ashishdavda35/event-org.git

# Then push normally
git push -u origin main
```

### Option B: Use PAT as Password
```bash
# When prompted for password, use your PAT instead of GitHub password
git push -u origin main
# Username: ashishdavda35
# Password: YOUR_PAT_TOKEN
```

### Option C: Store PAT in Git Credentials
```bash
# Store credentials (will prompt for username and password)
git config --global credential.helper store

# Then push (enter username and PAT as password)
git push -u origin main
```

## Step 3: Test the Push

```bash
# Check current status
git status

# Add any new files
git add .

# Commit changes
git commit -m "Deploy Event Org live polling app"

# Push to GitHub
git push -u origin main
```

## Step 4: Deploy to Vercel

Once your code is on GitHub:

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your `event-org` repository
5. Deploy both frontend and backend

## Expected URLs After Deployment

- **Frontend**: `https://event-org-frontend.vercel.app`
- **Backend**: `https://event-org-backend.vercel.app`
- **Live Demo**: `https://event-org-frontend.vercel.app/poll/U706KM/results-fixed`

## Security Notes

- ✅ PAT tokens are more secure than passwords
- ✅ You can revoke tokens anytime
- ✅ Tokens have specific scopes (limited permissions)
- ✅ Never share your PAT token publicly

## Troubleshooting

If you get permission errors:
1. Make sure the repository exists on GitHub
2. Verify your PAT has `repo` scope
3. Check that your username is correct
4. Ensure the repository name matches exactly

---

**🚀 Once you push to GitHub, you can deploy to Vercel in 2 minutes!**
