# How to Set Yourself as a Moderator

The moderator role system has been implemented! Here's how to make yourself a moderator:

## Quick Start (Easiest Method)

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Visit the Admin Setup Page

Go to: **http://localhost:3000/admin/setup**

### 3. Set Your Role

- Enter your email address (the one you signed up with)
- Select **"Moderator"** from the dropdown
- Click **"Set Role"**
- Wait 2 seconds - you'll be automatically redirected to the moderator dashboard

### 4. Access the Moderator Dashboard

After setting your role, you can access:
**http://localhost:3000/admin/moderator**

---

## Alternative Methods

### Method 1: MongoDB Atlas (Direct Database Edit)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in and navigate to your cluster
3. Click **"Browse Collections"**
4. Find the **`stem-magazine`** database
5. Click on the **`User`** collection
6. Find your user document (search by your email)
7. Click **"Edit"**
8. Change `"role": "USER"` to `"role": "MODERATOR"` or `"role": "ADMIN"`
9. Click **"Update"**
10. Refresh your app

### Method 2: Prisma Studio

1. Open terminal in your project
2. Run: `npx prisma studio`
3. This opens a GUI at `http://localhost:5555`
4. Click on **`User`** table
5. Find your user record
6. Change the `role` field to `"MODERATOR"` or `"ADMIN"`
7. Click **"Save 1 change"**
8. Refresh your app

---

## Role Types

### USER (Default)

- Can create submissions
- Can save drafts
- Can view their own dashboard
- **Cannot** access moderator dashboard

### MODERATOR

- All USER permissions
- Can view all submissions at `/admin/moderator`
- Can approve submissions (creates published posts)
- Can reject submissions (with reason)
- **Cannot** set roles for other users

### ADMIN

- All MODERATOR permissions
- Can set roles for any user
- Full system access

---

## Security Notes

⚠️ **Important:** The `/admin/setup` page currently allows ANY authenticated user to set their own role. This is for initial setup convenience.

### For Production, you should:

1. **Remove the setup page** after setting up your initial moderators:

   ```bash
   del src\app\admin\setup\page.tsx
   ```

2. **Or restrict the setup page** by modifying `src/app/api/admin/set-role/route.ts` to only allow the first user, or check for an environment variable:

   ```typescript
   // Only allow if no admins exist yet
   const adminCount = await prisma.user.count({
     where: { role: 'ADMIN' },
   });

   if (adminCount > 0 && !callerHasAdminRole) {
     return NextResponse.json(
       { error: 'Setup already completed' },
       { status: 403 }
     );
   }
   ```

3. **Use MongoDB Atlas** to manually set roles for additional moderators

---

## How the System Works

### Protected Routes

- `/admin/*` routes check for authentication (via Clerk)
- `/admin/moderator` page checks for MODERATOR or ADMIN role
- `/api/admin/submissions` API checks for MODERATOR or ADMIN role

### Role Checking Flow

1. User visits `/admin/moderator`
2. Clerk middleware checks authentication
3. Page component calls `/api/admin/check-role`
4. API queries database for user's role
5. If MODERATOR or ADMIN: show dashboard
6. If USER: redirect to home page

### Setting Roles

1. User visits `/admin/setup`
2. Enters email and selects role
3. Submits form to `/api/admin/set-role`
4. API checks if caller is ADMIN or setting their own role
5. Updates user record in database
6. User can now access moderator dashboard

---

## Testing the System

1. **Sign up** with a new account or use your existing one
2. **Set your role** to MODERATOR using the setup page
3. **Visit** `/admin/moderator` - you should see the dashboard
4. **Create a submission** as a regular user
5. **Approve/reject** it from the moderator dashboard
6. **Check** that approved posts appear in `/posts`

---

## Troubleshooting

### "Access Denied" when visiting `/admin/moderator`

- Check that you've set your role correctly
- Make sure you're signed in with the same email you used in the setup page
- Try signing out and back in
- Check MongoDB to verify the `role` field is set

### Role changes not taking effect

- Sign out and sign back in
- Restart the dev server
- Clear your browser cache
- Check that Prisma generated correctly: `npx prisma generate`

### Can't access setup page

- Make sure the dev server is running
- Check that the file exists: `src/app/admin/setup/page.tsx`
- Navigate directly to: `http://localhost:3000/admin/setup`

---

## Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify your MongoDB connection is working
4. Make sure Clerk authentication is configured correctly
