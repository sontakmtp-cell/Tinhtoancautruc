import React from 'react';

type RouteLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  onNavigate?: (path: string) => void;
};

export default function RouteLink({ href, onNavigate, children, ...props }: RouteLinkProps) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        props.onClick?.(event);
        if (!onNavigate || event.defaultPrevented || event.button !== 0 || event.metaKey ||
            event.ctrlKey || event.shiftKey || event.altKey || props.target || props.download) {
          return;
        }
        event.preventDefault();
        onNavigate(href);
      }}
    >
      {children}
    </a>
  );
}
