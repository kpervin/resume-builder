import "./global.scss";

export default function PrintLayout(props: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <main className={"h-full"}>{props.children}</main>
      </body>
    </html>
  );
}
