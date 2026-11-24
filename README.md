# Endy J portfolio

A responsive React portfolio with a cinematic introduction, filterable project carousel and grid, project detail dialogs, an about section, and a contact form.

## Development

```sh
npm ci --cache /workspace/.cache/npm
npm run dev
```

Vite listens on all interfaces at port 5173. In Codex Cloud, enable port 5173 under **Edit Environment → HTTP Previews** to open an authenticated preview.

## Production

```sh
npm run build
npm run preview
```

The GitHub Actions workflow in `.github/workflows/deploy.yml` builds and deploys the site to GitHub Pages on each push to `main`. In the repository's Pages settings, select **GitHub Actions** as the build source. Relative asset URLs support the repository's `/t017/` path and local previews.

## Content

The identity and contact address are Endy J and jaubashi@gmail.com. Contact information is in `src/App.jsx`. Submitting the form prepares a `mailto` draft for the visitor to review and send in their email application. Copying the inquiry is also supported. No server-side email service is configured.

The five portfolio entries are original demonstration concepts. Their text and metadata live in `src/projects.js`, with preview artwork in the `ProjectArt` component. The studio scene and architectural photograph are generated imagery. Replace the studio image with your own photo before presenting it as a personal portrait.

Motion respects the visitor’s reduced-motion preference. Gallery controls, filters, navigation, and dialogs support keyboard use.
