import type { WFNode } from "../../../types";
import { Pin } from "../../Pin";
import { FlowTag } from "../../FlowTag";
import { useWF, handleClick } from "../../context";
import { modClasses } from "../../util";
import { withAnnotation } from "../../Box";

export function FormBox(props: { node: WFNode & { _id?: string } }) {
  const wf = useWF();
  const n = props.node;
  const fields = n.fields || [];

  const fcols = Math.max(...fields.map((f) => f.cols || 1), 1);

  const box = (
    <div
      className={"wf-box wf-form-box " + modClasses(n)}
      data-wf-id={n._id}
      data-wf-commented={wf.pinOf(n._id) > 0 ? "1" : undefined}
      data-kind={n.kind}
      data-backend={n.backend}
      data-ds={n.ds}
      onClick={(e) => handleClick(wf, n._id, n.goto, n.opens, e)}
    >
      <Pin id={n._id} />
      <div className="wf-form-content">
        {n.label && <span className="wf-form-title">{n.label}</span>}
        <div
          className="wf-form-grid"
          style={{ "--fcols": fcols } as React.CSSProperties}
        >
          {fields.map((f, idx) => {
            const fieldType = f.type || "text";
            return (
              <div 
                key={idx} 
                className={`wf-form-field wf-field-type-${fieldType}`}
                style={f.cols ? { gridColumn: `span ${f.cols}` } : undefined}
              >
                <label className="wf-field-label">{f.label}</label>
                {fieldType === "text" && (
                  <div className="wf-field-input wf-input-text" />
                )}
                {fieldType === "select" && (
                  <div className="wf-field-input wf-input-select">
                    <span className="wf-select-arrow">▾</span>
                  </div>
                )}
                {fieldType === "textarea" && (
                  <div className="wf-field-input wf-input-textarea" />
                )}
                {fieldType === "toggle" && (
                  <div className="wf-field-toggle-container">
                    <div className={"wf-toggle-switch" + (f.checked ? " wf-toggle-checked" : "")}>
                      <div className="wf-toggle-knob" />
                    </div>
                  </div>
                )}
                {fieldType === "datepicker" && (
                  <div className="wf-field-input wf-datepicker-field" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px", height: "32px", border: "1px solid var(--wf-line)", borderRadius: "var(--wf-radius)", background: "#fff" }}>
                    <span className="wf-datepicker-value">{f.dateValue || "Select date..."}</span>
                    <svg className="wf-datepicker-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "14px", height: "14px", color: "var(--wf-muted)" }}>
                      <rect x="2" y="3" width="12" height="11" rx="1" />
                      <line x1="2" y1="6" x2="14" y2="6" />
                      <line x1="5" y1="1" x2="5" y2="3" />
                      <line x1="11" y1="1" x2="11" y2="3" />
                    </svg>
                  </div>
                )}
                {fieldType === "upload" && (
                  <div className="wf-field-input wf-upload-field" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80px", border: "1px dashed var(--wf-line)", borderRadius: "var(--wf-radius)", padding: "10px", background: "var(--wf-fill)", width: "100%" }}>
                    <svg className="wf-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "24px", height: "24px", color: "var(--wf-muted)", marginBottom: "4px" }}>
                      <path d="M18 10h-.7c-.3-2.5-2.4-4.5-4.9-4.5-2.2 0-4.1 1.5-4.7 3.6-2.1.3-3.7 2.1-3.7 4.3C4 15.8 6.2 18 9 18h9c2.2 0 4-1.8 4-4s-1.8-4-4-4z" />
                      <path d="M12 12v4M10 14l2-2 2 2" />
                    </svg>
                    <span className="wf-upload-label" style={{ fontSize: "10.5px", color: "var(--wf-muted)" }}>{f.uploadLabel || "Upload file..."}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {n.submitLabel && (
          <div className="wf-form-footer">
            <div
              className="wf-box wf-button-box wf-solid"
              style={{ alignSelf: "flex-end" }}
              data-kind="button"
            >
              <span className="wf-button-label">{n.submitLabel}</span>
            </div>
          </div>
        )}
      </div>
      <FlowTag goto={n.goto} opens={n.opens} action={n.action} />
    </div>
  );

  return withAnnotation(box, n);
}
