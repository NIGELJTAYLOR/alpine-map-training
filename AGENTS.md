<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dev server command

Nigel checks every change on his mobile phone alongside the laptop. Whenever you tell him to run the dev server, ALWAYS use the LAN-accessible form:

```
npm run dev -- --hostname 0.0.0.0
```

Never tell him `npm run dev` on its own. He'll then reach it from the phone at `http://<laptop-ip>:3000/`, finding the IP via `ipconfig` on Windows. If Windows Firewall blocks the connection on first run, approving node.exe for private networks fixes it.

Next.js 15+ blocks cross-origin requests to dev resources (HMR socket, fonts) when the request comes from an IP that is not in `allowedDevOrigins`. The project's `next.config.ts` already whitelists `192.168.0.*`, `192.168.1.*`, and `10.0.0.*` to cover common home/office subnets. If Nigel's network uses a different subnet, add it there.

# Versioning convention

The app sits in the **V1.x.0** series for the life of this release line. Nigel's rule:

- Each meaningful iteration bumps the **middle digit**: V1.2.0, V1.3.0, V1.4.0, and so on.
- The third digit stays at `0` for normal iterations. Use `V1.x.1` etc. only for a quick patch within an iteration (a hotfix).
- Do **not** suggest bumping to V2.0.0 unilaterally. The move from V1 to V2 is a joint decision; wait for Nigel to indicate it.

The version is read from `package.json`'s `version` field and surfaced in the sidebar via `BRAND.version` in `src/config/brand.ts`. Bumping `package.json` is the only step needed.
