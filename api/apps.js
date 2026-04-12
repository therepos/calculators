const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  const appsDir = path.join(process.cwd(), "apps");

  let files;
  try {
    files = fs.readdirSync(appsDir).filter((f) => f.endsWith(".html"));
  } catch {
    return res.status(200).json([]);
  }

  const apps = files.map((file) => {
    const filePath = path.join(appsDir, file);
    const html = fs.readFileSync(filePath, "utf-8");

    // Extract <title>
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : file.replace(".html", "");

    // Extract <meta name="description" content="...">
    const descMatch = html.match(
      /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
    );
    const description = descMatch ? descMatch[1].trim() : null;

    // Extract accent color from CSS custom properties (first --accent or similar)
    const accentMatch = html.match(
      /--accent\s*:\s*(#[0-9a-fA-F]{3,8}|[a-z]+)/i
    );
    const accent = accentMatch ? accentMatch[1] : null;

    const slug = file.replace(".html", "");

    return {
      slug,
      file,
      href: `/apps/${file}`,
      title,
      description,
      accent,
    };
  });

  // Sort alphabetically by title
  apps.sort((a, b) => a.title.localeCompare(b.title));

  res.setHeader("Cache-Control", "public, max-age=60, s-maxage=300");
  res.status(200).json(apps);
};
