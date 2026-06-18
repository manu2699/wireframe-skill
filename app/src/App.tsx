// Container: wires the model, navigation, comments, and review hooks together
// and hands data + callbacks to the presentational components. All dependencies
// (model, id metadata, storage, transport) are injected — the entry points
// (src/main.tsx for prod, app/dev/main.tsx for dev) construct the concrete ones.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { WFModel } from "./types";
import type { IdMeta } from "./model/stamp";
import type { Storage } from "./ports/storage";
import type { Transport } from "./ports/transport";
import { useNav } from "./hooks/useNav";
import { useComments } from "./hooks/useComments";
import { useReview } from "./hooks/useReview";
import { useTheme } from "./hooks/useTheme";
import { useShortcuts } from "./hooks/useShortcuts";
import type { WFActions } from "./render/Node";
import { Header } from "./ui/Header";
import { Canvas } from "./ui/Canvas";
import { ReviewSidebar } from "./ui/ReviewSidebar";
import { Modal } from "./ui/Modal";
import { CommentPopover } from "./ui/CommentPopover";
import { FlowMap } from "./ui/FlowMap";
import { TooltipProvider } from "./components/ui/tooltip";

const REVIEW_COLLAPSE_KEY = "wfc:review-collapsed";

function readReviewCollapsed(): boolean {
  try {
    return localStorage.getItem(REVIEW_COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
}

export function App(props: {
  model: WFModel;
  meta: Map<string, IdMeta>;
  storage: Storage;
  transport: Transport;
}) {
  const { model, meta, storage, transport } = props;
  const metaOf = (id: string) => meta.get(id);

  const { nav, gotoScreen, setState, openModal, closeModal, setMode } = useNav(model);
  const { comments, order, upsert, remove } = useComments(storage);
  const review = useReview({ model, metaOf, comments, order, upsert, remove, transport });
  const { theme, toggle: toggleTheme } = useTheme();

  const [reviewCollapsed, setReviewCollapsed] = useState(readReviewCollapsed);
  const [showFlow, setShowFlow] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(REVIEW_COLLAPSE_KEY, reviewCollapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [reviewCollapsed]);

  const togglePanel = useCallback(() => setReviewCollapsed((c) => !c), []);
  const setComment = useCallback(() => setMode("comment"), [setMode]);
  const setPrototype = useCallback(() => setMode("prototype"), [setMode]);
  useShortcuts({ togglePanel, setComment, setPrototype, toggleTheme });

  const connected = useSyncExternalStore(transport.subscribe, transport.isConnected);

  const pinOf = (id?: string) => (id ? order.indexOf(id) + 1 : 0);

  const activeScreen = useMemo(
    () => model.screens.find((s) => s.id === nav.screenId),
    [model, nav.screenId],
  );
  const activeState = useMemo(() => {
    if (!activeScreen) return undefined;
    return (activeScreen.states ?? []).find((st) => st.id === nav.stateByScreen[activeScreen.id])
      || (activeScreen.states ?? [])[0];
  }, [activeScreen, nav.stateByScreen]);
  const activeModal = useMemo(
    () => (model.modals || []).find((m) => m.id === nav.modalId),
    [model, nav.modalId],
  );

  const badgeCount = (screenName: string) =>
    order.filter((id) => comments[id] && metaOf(id)?.screen === screenName).length;

  const actions: WFActions = {
    mode: () => nav.mode,
    comment: review.openComment,
    goto: gotoScreen,
    openModal,
    pinOf,
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="wf-app flex h-screen flex-col" data-mode={nav.mode}>
        <Header
          feature={model.feature} screens={model.screens} screenId={nav.screenId}
          badgeCount={badgeCount} onGoto={gotoScreen}
          mode={nav.mode} onMode={setMode}
          theme={theme} onTheme={toggleTheme}
          flows={model.flows} showFlow={showFlow} onToggleFlow={() => setShowFlow((v) => !v)}
        />
        {showFlow && model.flows && model.flows.length > 0 && (
          <FlowMap flows={model.flows} onGoto={gotoScreen} />
        )}

        <div className="flex min-h-0 flex-1">
          <Canvas screen={activeScreen} state={activeState} onSetState={setState} actions={actions} />
          <ReviewSidebar
            model={model} comments={comments} order={order}
            connected={connected} sent={review.sent}
            onFeedback={review.onFeedback} onApprove={review.onApprove} onDelete={remove}
            collapsed={reviewCollapsed} onToggleCollapse={togglePanel}
          />
        </div>

        <Modal modal={activeModal} onClose={closeModal} actions={actions} />

        {review.popover && (
          <CommentPopover
            state={review.popover}
            onClose={review.closeComment}
            onSave={review.saveComment}
            onDelete={() => review.deleteComment(review.popover!.id)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
