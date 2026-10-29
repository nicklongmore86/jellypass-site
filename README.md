# jellypass-site

The public website for JellyPass at [jellypass.app](https://jellypass.app/): the pages the App Store and Google Play
listings of **JellyPass Household** link to.

| Page | URL |
| --- | --- |
| About | https://jellypass.app/ |
| Privacy policy | https://jellypass.app/privacy/ |
| Support | https://jellypass.app/support/ |

The app itself is in [nicklongmore86/jellypass](https://github.com/nicklongmore86/jellypass) (`mobile/`).

## What is here

Plain static files, served as they are:

- `index.html`, `privacy/index.html`, `support/index.html` and `404.html`, sharing one `style.css`;
- `favicon.png`, the app's icon;
- `_headers`, the security headers Cloudflare Pages sends with every response.

No build step, no JavaScript, no analytics, no cookies, and nothing loaded from another host. The site collects
nothing.

## Deployment

Cloudflare Pages, connected to this repository:

- framework preset: none;
- build command: empty;
- build output directory: `/` (the repository root);
- production branch: `main`;
- custom domain: `jellypass.app`.

Every push to `main` publishes the site; pull requests get a preview deployment.

To preview locally: `python3 -m http.server 8000` in the repository root, then open http://localhost:8000/. (The
`_headers` file only takes effect on Cloudflare Pages.)

## Contact

[support@jellypass.app](mailto:support@jellypass.app)

## Licence

The site's text is licensed under [CC BY 4.0](LICENSE). The JellyPass app and its icon are MIT-licensed in the
[app repository](https://github.com/nicklongmore86/jellypass).
