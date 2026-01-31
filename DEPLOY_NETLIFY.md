# Deploying to Netlify

You can deploy the **WaveFuel Dashboard** to Netlify easily using one of the following methods.

## Option 1: Deploy with Git (Recommended)

This method ensures your site updates automatically whenever you push changes to your repository.

1.  **Push your code to GitHub, GitLab, or Bitbucket.**
2.  Log in to [Netlify](https://app.netlify.com/).
3.  Click **"Add new site"** > **"Import an existing project"**.
4.  Select your Git provider (e.g., GitHub).
5.  Choosing the repository `ev-fleet-dashboard` (or whatever you named it).
6.  Netlify will detect the Next.js project. Use the following build settings:
    - **Build command:** `npm run build`
    - **Publish directory:** `.next`
7.  Click **"Deploy site"**.

## Option 2: Deploy using Netlify CLI

If you don't want to use Git or want to deploy directly from your terminal.

1.  Install Netlify CLI:
    ```bash
    npm install -g netlify-cli
    ```
2.  Log in to Netlify:
    ```bash
    netlify login
    ```
3.  Initialize and deploy:
    ```bash
    netlify init
    ```

    - Follow the prompts to create a new site.
    - It will auto-detect the Next.js settings.
4.  Deploy to production:
    ```bash
    npm run build
    netlify deploy --prod
    ```

## Note on Deployment

Since this project uses dynamic features (like the generated App Icon using `next/og`), it requires the **Netlify Next.js Runtime**, which allows server-side features to work on Netlify. This is automatically handled by Netlify when you deploy.
