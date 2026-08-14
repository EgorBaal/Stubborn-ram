import "./PageScroll.css";

export default function PageScroll({ children, className = "" }) {
  const rootClassName = className ? `page-scroll ${className}` : "page-scroll";

  return <div className={rootClassName}>{children}</div>;
}
