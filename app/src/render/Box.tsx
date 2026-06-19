// Default leaf renderer: a grey box with an optional kind glyph, label, and flow
// tag. The catch-all for `type: "box"` (and any unknown type via the registry).
//
// When a box carries a backend/ds annotation, it's wrapped in a collision-aware
// Radix Tooltip (replaces the old CSS ::after tooltip that was always above and
// clipped on edge rows).

import type { ReactNode } from "react";
import type { WFNode } from "../types";
import { Glyph } from "./Glyph";
import { Pin } from "./Pin";
import { FlowTag } from "./FlowTag";
import { useWF, handleClick } from "./context";
import { modClasses } from "./util";
import { Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { Server, Component, Sparkle } from "../components/ui/icons";
import { ButtonBox } from "./kinds/content/ButtonBox";
import { HeadingBox } from "./kinds/content/HeadingBox";
import { BadgeBox } from "./kinds/content/BadgeBox";
import { AlertBox } from "./kinds/content/AlertBox";
import { AvatarBox } from "./kinds/content/AvatarBox";
import { InputBox } from "./kinds/inputs/InputBox";
import { SliderBox } from "./kinds/inputs/SliderBox";
import { DatepickerBox } from "./kinds/inputs/DatepickerBox";
import { RadioGroupBox } from "./kinds/inputs/RadioGroupBox";
import { CheckboxGroupBox } from "./kinds/inputs/CheckboxGroupBox";
import { ToggleBox } from "./kinds/inputs/ToggleBox";
import { SearchBox } from "./kinds/inputs/SearchBox";
import { UploadBox } from "./kinds/inputs/UploadBox";
import { RatingBox } from "./kinds/inputs/RatingBox";
import { FormBox } from "./kinds/layout/FormBox";
import { CardBox } from "./kinds/layout/CardBox";
import { AccordionBox } from "./kinds/layout/AccordionBox";
import { ModalBox } from "./kinds/layout/ModalBox";
import { SidebarBox } from "./kinds/layout/SidebarBox";
import { TabsBox } from "./kinds/nav/TabsBox";
import { BreadcrumbBox } from "./kinds/nav/BreadcrumbBox";
import { StepperBox } from "./kinds/nav/StepperBox";
import { PaginationBox } from "./kinds/nav/PaginationBox";
import { BarChartBox } from "./kinds/charts/BarChartBox";
import { LineChartBox } from "./kinds/charts/LineChartBox";
import { DonutChartBox } from "./kinds/charts/DonutChartBox";
import { KpiBox } from "./kinds/charts/KpiBox";
import { TableBox } from "./kinds/display/TableBox";
import { ListBox } from "./kinds/display/ListBox";
import { TimelineBox } from "./kinds/display/TimelineBox";
import { NotificationListBox } from "./kinds/display/NotificationListBox";
import { ChatWindowBox } from "./kinds/display/ChatWindowBox";
import { ProgressBox } from "./kinds/display/ProgressBox";
import { Node } from "./Node";

type BoxNode = WFNode & { _id?: string };

const KIND_RENDERERS: Record<string, (props: { node: BoxNode }) => ReactNode | null> = {
  "chart:bars": (props) => <BarChartBox node={props.node} />,
  "chart:donut": (props) => <DonutChartBox node={props.node} />,
  "chart:line": (props) => <LineChartBox node={props.node} />,
  button: (props) => <ButtonBox node={props.node} />,
  heading: (props) => <HeadingBox node={props.node} />,
  input: (props) => <InputBox node={props.node} />,
  kpi: (props) => <KpiBox node={props.node} />,
  stat: (props) => <KpiBox node={props.node} />,
  form: (props) => <FormBox node={props.node} />,
  card: (props) => <CardBox node={props.node} />,
  list: (props) => (props.node.items && props.node.items.length > 0 ? <ListBox node={props.node} /> : null),
  tabs: (props) => (props.node.tabs && props.node.tabs.length > 0 ? <TabsBox node={props.node} /> : null),
  avatar: (props) => (props.node.initials !== undefined ? <AvatarBox node={props.node} /> : null),
  search: (props) => <SearchBox node={props.node} />,
  breadcrumb: (props) => (props.node.crumbs && props.node.crumbs.length > 0 ? <BreadcrumbBox node={props.node} /> : null),
  stepper: (props) => (props.node.steps && props.node.steps.length > 0 ? <StepperBox node={props.node} /> : null),
  accordion: (props) => (props.node.sections && props.node.sections.length > 0 ? <AccordionBox node={props.node} /> : null),
  sidebar: (props) => (props.node.sidebarGroups && props.node.sidebarGroups.length > 0 ? <SidebarBox node={props.node} /> : null),
  pagination: (props) => <PaginationBox node={props.node} />,
  table: (props) => (props.node.headers && props.node.headers.length > 0 ? <TableBox node={props.node} /> : null),
  timeline: (props) => (props.node.events && props.node.events.length > 0 ? <TimelineBox node={props.node} /> : null),
  progress: (props) => <ProgressBox node={props.node} />,
  badge: (props) => <BadgeBox node={props.node} />,
  rating: (props) => <RatingBox node={props.node} />,
  toggle: (props) => <ToggleBox node={props.node} />,
  slider: (props) => <SliderBox node={props.node} />,
  datepicker: (props) => <DatepickerBox node={props.node} />,
  upload: (props) => <UploadBox node={props.node} />,
  "radio-group": (props) => (props.node.options && props.node.options.length > 0 ? <RadioGroupBox node={props.node} /> : null),
  "checkbox-group": (props) => (props.node.options && props.node.options.length > 0 ? <CheckboxGroupBox node={props.node} /> : null),
  alert: (props) => <AlertBox node={props.node} />,
  modal: (props) => <ModalBox node={props.node} />,
  "notification-list": (props) => (props.node.notifications && props.node.notifications.length > 0 ? <NotificationListBox node={props.node} /> : null),
  "chat-window": (props) => (props.node.messages && props.node.messages.length > 0 ? <ChatWindowBox node={props.node} /> : null),
};

export function Box(props: { node: BoxNode }) {
  const wf = useWF();
  const n = props.node;

  if (n.kind && KIND_RENDERERS[n.kind]) {
    const rendered = KIND_RENDERERS[n.kind]({ node: n });
    if (rendered !== null) {
      return rendered;
    }
  }

  // 3. children present -> render children in box frame
  if (n.children && n.children.length > 0) {
    const box = (
      <div
        className={"wf-box wf-box-with-children " + (n.kind ? "wf-kind " : "") + modClasses(n)}
        data-wf-id={n._id}
        data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
        data-kind={n.kind}
        data-backend={n.backend}
        data-ds={n.ds}
        onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
      >
        <Pin id={n._id} />
        {n.new && <span className="wf-new-badge">✦ new</span>}
        {n.changed && <span className="wf-changed-badge">~ changed</span>}
        {n.children.map((child, idx) => (
          <Node key={child._id || idx} node={child} />
        ))}
        <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
      </div>
    );
    return withAnnotation(box, n);
  }

  // 4 & 5. Fallback / default behavior
  const box = (
    <div
      className={"wf-box " + (n.kind ? "wf-kind " : "") + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      {n.new && <span className="wf-new-badge">✦ new</span>}
      {n.changed && <span className="wf-changed-badge">~ changed</span>}
      <Glyph kind={n.kind} />
      {n.label && <span className="wf-box-label">{n.label}</span>}
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );
  return withAnnotation(box, n);
}

// Shared by Box / Table / Nav: wrap a trigger in an annotation tooltip when it
// has backend/ds metadata, otherwise return it untouched. The tooltip spells out
// what each annotation means (endpoint vs. design-system component) rather than
// cryptic BE/DS prefixes, and flags any "guess:" value as inferred.
export function withAnnotation(trigger: ReactNode, n: { backend?: string; ds?: string; goto?: string; opens?: string; action?: string }): ReactNode {
  if (!n.backend && !n.ds && !n.goto && !n.opens && !n.action) return <>{trigger}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>
      <TooltipContent className="flex w-max max-w-[260px] flex-col gap-2 px-3 py-2.5">
        {n.backend && <AnnotationRow icon={<Server className="h-3.5 w-3.5" />} label="Endpoint" value={n.backend} mono />}
        {n.ds && <AnnotationRow icon={<Component className="h-3.5 w-3.5" />} label="Design system" value={n.ds} />}
        {n.goto && <AnnotationRow icon={<span className="text-[12px] font-bold">→</span>} label="Navigates to" value={n.goto} />}
        {n.opens && <AnnotationRow icon={<span className="text-[12px] font-bold">⊕</span>} label="Opens modal" value={n.opens} />}
        {n.action && <AnnotationRow icon={<span className="text-[12px] font-bold">↵</span>} label="Performs" value={n.action} />}
      </TooltipContent>
    </Tooltip>
  );
}

function AnnotationRow(props: { icon: ReactNode; label: string; value: string; mono?: boolean }) {
  const guessed = /^\s*guess:\s*/i.test(props.value);
  const value = props.value.replace(/^\s*guess:\s*/i, "");
  return (
    <div className="flex items-start gap-2">
      <span className="mt-px shrink-0 opacity-50">{props.icon}</span>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-wide opacity-50">
          {props.label}
          {guessed && (
            <span className="inline-flex items-center gap-0.5 rounded-sm bg-[var(--wfc-accent-2)] px-1 py-px text-[8.5px] font-medium normal-case tracking-normal text-[var(--wfc-accent-2-ink)]">
              <Sparkle className="h-2.5 w-2.5" /> guessed
            </span>
          )}
        </div>
        <div className={"text-[11.5px] leading-snug " + (props.mono ? "font-mono" : "")}>{value}</div>
      </div>
    </div>
  );
}
