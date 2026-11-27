// Dompet Keluarga — entry program for the make.fun household-budget-site bounty.
//
// What it does: copies the static site (app/) and its screenshots (screenshots/)
// into the output directory, then asks the kit's buildDossier to describe that
// directory and writes the dossier it returns as dossier.json. Node 22,
// standard library only, no network, no required arguments; running it twice
// over the same repo writes byte-identical output.

import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildDossier } from './vendor/makefun-frontend.ts';

// The repo is wherever this file lives, so the program works no matter which
// directory it is started from.
const repoDir = dirname(fileURLToPath(import.meta.url));

// The output directory comes from the environment when the harness sets it,
// and defaults to /output otherwise.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Prepare the output directory: create it when missing, then clear only its
// contents — the directory itself is never removed.
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

// Copy the site and its screenshots into the output directory, keeping every
// file name and subdirectory exactly as it is in the repo.
cpSync(join(repoDir, 'app'), join(outDir, 'app'), { recursive: true });
cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

// Build the dossier from the copied app/ and screenshots/ in the output
// directory, and write it out verbatim as dossier.json.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);
