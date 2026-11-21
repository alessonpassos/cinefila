import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";
import { CONFIG_LOCAL, ConfigLocal } from "./app/core/config-local";

async function iniciar(): Promise<void> {
  let config: ConfigLocal = { tmdbToken: "" };
  try {
    const resposta = await fetch("/config.local.json", { cache: "no-store" });
    if (resposta.ok) {
      const valor: unknown = await resposta.json();
      if (
        valor &&
        typeof valor === "object" &&
        "tmdbToken" in valor &&
        typeof valor.tmdbToken === "string"
      ) {
        config = { tmdbToken: valor.tmdbToken.trim() };
      }
    }
  } catch {

  }
  await bootstrapApplication(AppComponent, {
    ...appConfig,
    providers: [
      ...appConfig.providers,
      { provide: CONFIG_LOCAL, useValue: config },
    ],
  });
}
void iniciar();
