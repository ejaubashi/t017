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

The rebuilt interface uses full-screen views at `#/`, `#/portfolio`, `#/about`, and `#/contacts`. Project metadata and asset paths live in `src/projects.js`. The gallery uses WebGL with a grid fallback, and the about view keeps the portrait fixed while its content scrolls.

Media under `public/reference` was recovered from the user-provided screen recordings, with the user's confirmation of ownership or permission. The scene and portrait were cleaned with image generation to remove interface overlays. Project previews and stippled portrait details use extracted recording frames. The reference site's source files remain inaccessible from this environment, so Gabarito provides a close font match and the animation effects are recreated in code. The thumbnails are still frames from the recorded projects.

The contact form supports local voice and video recording. Visitors can download a recording and attach it to their email draft. Recordings are kept in browser memory until removed or the page closes. Social profile links can be set in `src/projects.js`.

Motion respects the visitor’s reduced-motion preference. Gallery controls, filters, navigation, and dialogs support keyboard use.
