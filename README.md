## Usage

Visit the live site at:
- [SAAS](https://therepos.github.io/financetools/apps/saas.html)
- [Leases](https://therepos.github.io/financetools/apps/leases.html)

## Structure

```
calculators/
├── .scraps/                # Superseded work
├── apps/                   # Finance tools (HTML pages)
│   ├── saas.html
│   └── leases.html
├── scripts/
│   └── nav.js              # Shared navigation
├── .gitignore
├── LICENSE
└── README.md
```

## Notes

- All calculations run in the browser at runtime — no embedded data
- External dependencies (Chart.js, Google Fonts) load from CDN
- Pages work offline if CDN assets are cached
