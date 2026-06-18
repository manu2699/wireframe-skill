// Registry of sample WFModels for the dev server's ?example= switcher. These are
// the exact JSON shape an agent inlines into #wf-model; they are dev/test/
// authoring inputs only and are never published with the package.

import type { WFModel } from "../src/types";
import allRenderers from "./all-renderers";
import newsFeed from "./news-feed";

export interface ExampleEntry {
  slug: string;
  name: string;
  model: WFModel;
}

export const exampleList: ExampleEntry[] = [
  { slug: "all-renderers", name: "All Renderers", model: allRenderers },
  { slug: "news-feed", name: "News Feed", model: newsFeed }
];

export const examples: Record<string, WFModel> = Object.fromEntries(
  exampleList.map((e) => [e.slug, e.model]),
);

export const defaultExample = exampleList[0].slug;
