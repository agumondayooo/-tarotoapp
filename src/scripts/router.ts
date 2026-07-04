import type { AudioController } from "./audio";

export interface AppContext {
  audio: AudioController;
  navigate(path: string): void;
}

export type View = (container: HTMLElement, params: Record<string, string>, ctx: AppContext) => void;

const routes: Array<{ pattern: RegExp; view: () => Promise<{ render: View }>; paramNames: string[] }> = [];

export function route(pattern: string, view: () => Promise<{ render: View }>): void {
  const paramNames: string[] = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/:(\w+)/g, (_, name) => {
        paramNames.push(name);
        return "([\\w-]+)";
      }) +
      "$",
  );
  routes.push({ pattern: regex, view, paramNames });
}

export function startRouter(container: HTMLElement, ctx: AppContext): void {
  async function resolve(): Promise<void> {
    const hash = location.hash.replace(/^#/, "") || "/";
    for (const r of routes) {
      const m = hash.match(r.pattern);
      if (m) {
        const params: Record<string, string> = {};
        r.paramNames.forEach((n, i) => (params[n] = m[i + 1]));
        (await r.view()).render(container, params, ctx);
        window.scrollTo(0, 0);
        return;
      }
    }
    location.hash = "#/";
  }
  window.addEventListener("hashchange", resolve);
  resolve();
}
