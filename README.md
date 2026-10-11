# HW-L03-02 — React Product Recommendation System

**Student:** Aisa Tajik  
**Project:** SmartStore — Advanced Product Recommendation System

## Features implemented
- Fetches products from FakeStoreAPI with loading, error, and retry states.
- Caches fetched products in `localStorage` and provides a manual refresh.
- Category filter and minimum/maximum price filters.
- Product-name search with a 350ms debounce.
- Selecting a product and discovering other products in the same category.
- Add/remove products, quantity controls, cart count, and subtotal.
- Persists the cart and filter settings across page refreshes.
- Responsive layout for desktop and mobile.

## Run locally
Requires Node.js 20.19+ (or a current supported LTS release).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To verify production build:

```bash
npm run build
npm run preview
```

## Git workflow requested by the assignment
Create a separate branch for each meaningful part of the work and merge them into `final`.

Example branch names:
- `feature/api-products`
- `feature/search-debounce`
- `feature/filters-categories`
- `feature/recommendations`
- `feature/cart`
- `feature/local-storage`
- `feature/responsive-ui`
- `final`

Example workflow (run from the project folder):

```bash
git init
git add .
git commit -m "chore: initialize React product app"
git branch feature/api-products
# Work on one feature at a time; commit the changes on that branch.
# Merge each completed feature into final after testing.
git switch -c final
```

For each branch, commit actual feature changes before merging. Do not just create empty branches. If the course expects branches to exist remotely, push each one with `git push -u origin <branch>` after connecting your GitHub repository.

## Deploy to Vercel
1. Push the repository to GitHub.
2. Import that repository in Vercel.
3. Use **Build Command** `npm run build` and **Output Directory** `dist`.
4. Deploy and test the public URL.

The checkout button is intentionally a demo because the assignment asks for a cart, not payment processing.
