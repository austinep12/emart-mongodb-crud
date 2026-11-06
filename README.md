# E-MART – Ex 11: Node.js + MongoDB product catalogue (CRUD)

## Run on your laptop
1. Copy `.env.example` to `.env` and put your MongoDB Atlas connection string in `MONGODB_URI`.
2. Run:
```bash
npm install
npm start
```
3. Open http://localhost:3000 – add, edit and delete products.

## Deploy
1. Push to GitHub → import the repo in Vercel.
2. In Vercel → Settings → Environment Variables add `MONGODB_URI` = your Atlas connection string.
3. Deploy (or Redeploy).

In MongoDB Atlas → Network Access, allow `0.0.0.0/0` so Vercel can connect.
