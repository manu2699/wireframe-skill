// Comment pin: the small numbered badge shown on a commented element.

import { useWF } from "./context";

export function Pin(props: { id?: string }) {
  const wf = useWF();
  const n = wf.pinOf(props.id);
  if (n <= 0) return null;
  return <span className="wfc-pin">{n}</span>;
}
