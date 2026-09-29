import React from 'react';

const DEFAULT_HOME_GTM_ID = 'GTM-PMHBL76'; //  Home relative, extract somewhere

interface IGTMScript {
  id?: string;
}

export const GTMScript: React.FC<IGTMScript> = (props) => {
  const gtmId = props.id || DEFAULT_HOME_GTM_ID;
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          !(function (e, t, a, n, g) {
              (e[n] = e[n] || []),
              e[n].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
              var m = t.getElementsByTagName(a)[0],
              r = t.createElement(a);
              (r.async = !0),
              (r.src = "https://www.googletagmanager.com/gtm.js?id=${gtmId}");
              window.onload = () => {
                setTimeout(() => {
                  m.parentNode.insertBefore(r, m);
                }, 6000);
              }
          })(window, document, "script", "dataLayer");
        `
      }}
    />
  );
};
