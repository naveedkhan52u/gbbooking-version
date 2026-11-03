# GBbooking shared website layout

All six HTML pages use one shared layout system. Do not copy header, navigation or footer markup into individual pages.

## Master files to edit

- `components/site-header.html` — desktop header navigation, mobile/tablet top header, Gutenberg drawer menu, logo and all header links.
- `components/mobile-bottom-nav.html` — fixed Home, Categories, Login and Contact bar for phones and tablets.
- `components/site-footer.html` — desktop footer and mobile/tablet footer.
- `assets/js/layout.js` — loads the three master fragments into each page and initialises the shared Gutenberg drawer behaviour.

## Pages using the master layout

`index.html`, `about.html`, `services.html`, `privacy.html`, `support.html`, and `contact.html`.

Each page contains only shared-component mount points. Edit the relevant master file once and the change will appear on every page after deployment.

## Responsive behaviour

The desktop navigation/footer use the large-screen breakpoint. The Gutenberg menu, bottom navigation and compact footer are enabled below the large-screen breakpoint so tablet users receive the same navigation as mobile users.

## Adding another page

Add the three mount points and include `<script src="assets/js/layout.js"></script>` before the closing body tag. Keep page-specific content outside the shared components.
