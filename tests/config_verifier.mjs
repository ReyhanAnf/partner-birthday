/**
 * Config Verifier: Validates centralized romantic content configuration
 * and interface contracts according to PROJECT.md and ORIGINAL_REQUEST.md §R4.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export class ConfigVerifier {
  constructor(workspaceRoot = process.cwd()) {
    this.root = resolve(workspaceRoot);
    this.configPath = join(this.root, 'src', 'config', 'romanticConfig.ts');
  }

  verifyRomanticConfig() {
    if (!existsSync(this.configPath)) {
      // Check if blueprint exists in explorer survey/m1
      const blueprintPath = join(this.root, '.agents', 'teamwork', 'explorer_survey_3', 'survey_ux_spec.md');
      if (existsSync(blueprintPath)) {
        const specContent = readFileSync(blueprintPath, 'utf-8');
        return {
          found: false,
          path: this.configPath,
          status: 'PENDING_M1_CREATION',
          specDefined: specContent.includes('romanticConfig'),
          message: 'src/config/romanticConfig.ts not yet created by coder; spec is defined in survey_ux_spec.md.'
        };
      }
      return {
        found: false,
        path: this.configPath,
        status: 'MISSING',
        message: 'src/config/romanticConfig.ts was not found.'
      };
    }

    const content = readFileSync(this.configPath, 'utf-8');

    // Required fields check based on PROJECT.md interface contract
    const checks = {
      hasRecipientName: /recipientName\s*:/.test(content),
      hasNickname: /nickname\s*:/.test(content),
      hasBirthdayDate: /birthdayDate\s*:/.test(content),
      hasHeroBadge: /badge\s*:/.test(content),
      hasHeroHeadline: /headline\s*:/.test(content),
      hasChapters: /chapters\s*:/.test(content) || /stage2/i.test(content),
      hasFinale: /finale\s*:/.test(content) || /letter/i.test(content),
      hasAudio: /audio\s*:/.test(content) || /trackUrl/i.test(content),
      hasIndonesianText: /selamat|ulang\s*tahun|sayang|cinta|senyuman|terima\s*kasih/i.test(content),
      hasEnglishText: /happy\s*birthday|special|favorite|always/i.test(content)
    };

    const missingKeys = Object.entries(checks)
      .filter(([_, passed]) => !passed)
      .map(([key]) => key);

    return {
      found: true,
      path: this.configPath,
      status: missingKeys.length === 0 ? 'VALID' : 'INCOMPLETE',
      checks,
      missingKeys
    };
  }
}
