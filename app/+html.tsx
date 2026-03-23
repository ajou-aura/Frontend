import { PropsWithChildren } from "react";

import { ScrollViewStyleReset } from "expo-router/html";

export default function HtmlLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </head>
      <body style={{ margin: 0, backgroundColor: "#F7F8FA" }}>
        <ScrollViewStyleReset />
        {children}
      </body>
    </html>
  );
}
