import React, { useState } from "react";

const ResumeAccordionSection = ({
  title,
  subtitle,
  items,
  onAdd,
  onRemove,
  renderItem,
  addLabel = "Add item",
  itemClassName = "",
}) => {
  const [expanded, setExpanded] = useState(items.length > 0);

  return (
    <section className="resume-section-block">
      <header className="accordion-header" onClick={() => setExpanded((prev) => !prev)}>
        <div>
          <h5>{title}</h5>
          {subtitle ? <p className="text-muted">{subtitle}</p> : null}
        </div>
        <div className="header-actions">
          <button type="button" className="resume-add-btn" onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}>
            <i className="fa fa-plus" aria-hidden="true"></i>
            {addLabel}
          </button>
          <button
            type="button"
            className="accordion-toggle"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <i className={`fa ${expanded ? "fa-chevron-up" : "fa-chevron-down"}`} aria-hidden="true"></i>
          </button>
        </div>
      </header>

      {expanded ? (
        <div className="accordion-body">
          {items.length === 0 ? (
            <p className="text-muted small fst-italic">
              Nothing here yet. Click "{addLabel}" to add your first entry.
            </p>
          ) : null}

          {items.map((item, index) => (
            <div
              className={`card inner-card mb-3 ${itemClassName}`}
              key={item.id || index}
            >
              <div className="card-body">
                <div className="d-flex flex-column gap-3">
                  <div className="w-100">{renderItem(item, index)}</div>
                  <div className="text-end">
                    <button
                      type="button"
                      className="resume-remove-btn"
                      onClick={() => onRemove(index)}
                    >
                      <i className="fa fa-trash" aria-hidden="true"></i>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
};

export default ResumeAccordionSection;
