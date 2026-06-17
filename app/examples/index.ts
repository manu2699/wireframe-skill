// Registry of sample WFModels for the dev server's ?example= switcher. These are
// the exact JSON shape an agent inlines into #wf-model; they are dev/test/
// authoring inputs only and are never published with the package.

import type { WFModel } from "../src/types";
import recyclerOverview from "./recycler-overview";
import formFlow from "./form-flow";
import emptyAndError from "./empty-and-error";

export interface ExampleEntry {
  slug: string;
  name: string;
  model: WFModel;
}

export const exampleList: ExampleEntry[] = [
  { slug: "recycler-overview", name: "Recycler Overview", model: recyclerOverview },
  { slug: "form-flow", name: "Onboarding Wizard", model: formFlow },
  { slug: "empty-and-error", name: "Orders — States", model: emptyAndError },
];

export const examples: Record<string, WFModel> = Object.fromEntries(
  exampleList.map((e) => [e.slug, e.model]),
);

export const defaultExample = exampleList[0].slug;
