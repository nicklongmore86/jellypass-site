# jellypass-site

The public website for JellyPass at [jellypass.app](https://jellypass.app/): the pages the App Store and Google Play
listings of **JellyPass Household** link to.

| Page | URL |
| --- | --- |
| Home | https://jellypass.app/ |
| Documentation | https://jellypass.app/docs/ (introduction, prerequisites, installation, reverse proxy, settings, Seerr webhook, households, apps, upgrading, troubleshooting, security) |
| Privacy policy | https://jellypass.app/privacy/ |
| Support | https://jellypass.app/support/ |

The app links to `/`, `/privacy/` and `/support/`: never move them.

The app itself is in [nicklongmore86/jellypass](https://github.com/nicklongmore86/jellypass) (`mobile/`).

## What is here

Plain static files, served as they are:

- `index.html`, `docs/**/index.html`, `privacy/index.html`, `support/index.html` and `404.html`, sharing one `style.css`;
- `favicon.png`, the app's icon, and `img/`, the screenshots the pages show;
- `_headers`, the security headers Cloudflare Pages sends with every response.

No build step, no JavaScript, no analytics, no cookies, and nothing loaded from another host. The site collects
nothing.

Every page is hand-written HTML. The header, footer and docs sidebar are repeated in each page, so a change to them
is made in every file; `scripts/check-site.mjs` (Node 18+, no dependencies; it is never run by Cloudflare) fails if
they differ, if a page loads anything from another host or has a script, if the TMDB notice or JustWatch credit is
missing, if a docs page lacks its "Edit this page on GitHub" link, or if an internal link or anchor is broken. Before
a pull request:

```sh
node scripts/check-site.mjs
npx html-validate "**/*.html"
```

The docs describe JellyPass server 3.x; facts in them are checked against the server's code, not its older docs.

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
