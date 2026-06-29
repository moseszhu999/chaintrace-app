import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./WorkspaceViews.module.css";

export type WorkspaceAction = {
  href: string;
  label: string;
  primary?: boolean;
  external?: boolean;
};

export type MetricCardProps = {
  label: string;
  value: string;
  note?: string;
  large?: boolean;
};

export type StatusListItem = {
  id: string;
  title: ReactNode;
  meta?: ReactNode[];
  status?: string;
  statusClassName?: string;
};

export function MetricCard({ label, value, note, large = false }: MetricCardProps) {
  return (
    <article
      style={{
        border: "1px solid var(--border)",
        borderRadius: large ? 28 : 26,
        padding: large ? 22 : 20,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: large ? 14 : 8,
      }}
    >
      <span style={{ color: "var(--success)", fontWeight: 900, fontSize: large ? 14 : 13 }}>{label}</span>
      <strong
        className={styles.rowTitle}
        style={large ? { fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1, letterSpacing: "-0.05em" } : undefined}
      >
        {value}
      </strong>
      {note ? <p className={styles.rowMeta}>{note}</p> : null}
    </article>
  );
}

export function MetricGrid({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>{children}</div>;
}

export function StatusList({ items }: { items: StatusListItem[] }) {
  return (
    <div className={styles.list}>
      {items.map((item) => (
        <article className={styles.listRow} key={item.id}>
          <div className={styles.rowHeader}>
            <div className={styles.rowMain}>
              <h3 className={styles.rowTitle}>{item.title}</h3>
              {item.meta?.map((line, index) => (
                <p className={styles.rowMeta} key={`${item.id}-${index}`}>
                  {line}
                </p>
              ))}
            </div>
            {item.status ? <span className={item.statusClassName ?? styles.statusChip}>{item.status}</span> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ActionRow({ actions }: { actions: WorkspaceAction[] }) {
  if (!actions.length) return null;

  return (
    <div className={styles.rowActions}>
      {actions.map((action) => (
        <Link
          className={action.primary ? "primary-button" : "secondary-button"}
          href={action.href}
          key={action.href}
          target={action.external ? "_blank" : undefined}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}

export function WorkspaceHero({
  eyebrow,
  title,
  subtitle,
  children,
  actions = [],
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: WorkspaceAction[];
}) {
  return (
    <div className="panel">
      <div className="section-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
      {actions.length ? <div style={{ marginTop: 18 }}><ActionRow actions={actions} /></div> : null}
    </div>
  );
}

export function DecisionPanel({
  eyebrow,
  title,
  subtitle,
  children,
  actions = [],
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: WorkspaceAction[];
}) {
  return (
    <div className="panel">
      <div className="section-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children}
      {actions.length ? <ActionRow actions={actions} /> : null}
    </div>
  );
}
