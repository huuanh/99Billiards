import { Fragment } from "react";

function renderMultilineText(text: string) {
  const lines = text.split(/\r?\n/);
  return lines.map((line, index) => (
    <Fragment key={index}>
      {line}
      {index < lines.length - 1 ? <br /> : null}
    </Fragment>
  ));
}

export function HeroTitle({
  title,
  accent,
  accentClassName = "text-[#2EB958]",
}: {
  title: string;
  accent?: string;
  accentClassName?: string;
}) {
  const normalized = title.replace(/\\n/g, "\n");
  const trimmedAccent = accent?.trim();
  if (!trimmedAccent) return <>{renderMultilineText(normalized)}</>;

  const index = normalized.toLowerCase().indexOf(trimmedAccent.toLowerCase());
  if (index === -1) {
    // Accent không có sẵn trong title — nối thêm xuống dòng riêng dưới cùng.
    return (
      <>
        {renderMultilineText(normalized)}
        <br />
        <span className={accentClassName}>{trimmedAccent}</span>
      </>
    );
  }

  // Accent nằm trong title — luôn ép xuống dòng riêng (last line) để nổi bật.
  const before = normalized.slice(0, index).replace(/\s+$/, "");
  const match = normalized.slice(index, index + trimmedAccent.length);
  const after = normalized.slice(index + trimmedAccent.length).replace(/^\s+/, "");
  return (
    <>
      {before ? (
        <>
          {renderMultilineText(before)}
          <br />
        </>
      ) : null}
      <span className={accentClassName}>{match}</span>
      {after ? (
        <>
          <br />
          {renderMultilineText(after)}
        </>
      ) : null}
    </>
  );
}
