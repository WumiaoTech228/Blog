/// <reference types="astro/client" />
/// <reference types="@astrojs/cloudflare" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type D1Database = import("@cloudflare/workers-types").D1Database;
type R2Bucket = import("@cloudflare/workers-types").R2Bucket;

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        KEYSTATIC_GITHUB_REPO?: string;
      };
    };
  }
}

interface Window {
  triggerConfetti?: (x: number, y: number, customColors?: string[]) => void;
}
