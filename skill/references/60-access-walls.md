# 60 · Access walls (respect the boundary; degrade and document)

If `detect.js` flags a challenge/login/paywall: do NOT bypass CAPTCHA, auth, paywalls, or bot
protection. Options, in order: use content legitimately reachable in the environment; ask the user for
authorized access (their own login) if they want the gated parts; otherwise mirror the public surface
and document exactly what was inaccessible. Rate-limited/geo-blocked: retry sanely, don't hammer.
Never present gated/guessed content as observed.
