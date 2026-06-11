import {
  ANIMATED_TITLE_CYCLE_MS,
  ANIMATED_TITLE_LABEL,
  ANIMATED_TITLE_TOKENS,
} from "@/lib/animated-title";

export function AnimatedTitle() {
  return (
    <h1
      className="animated-title text-3xl font-bold drop-shadow-sm sm:text-5xl"
      aria-label={ANIMATED_TITLE_LABEL}
      style={{ "--title-cycle": `${ANIMATED_TITLE_CYCLE_MS}ms` } as React.CSSProperties}
    >
      <span className="animated-title-visual" aria-hidden="true">
        {ANIMATED_TITLE_TOKENS.map((token, index) => (
          <span
            className={`animated-title-token animated-title-token-${token.role}`}
            key={`${token.text}-${index}`}
            style={
              {
                "--title-delay": `${token.delayMs}ms`,
                "--title-tilt": `${token.tilt}deg`,
              } as React.CSSProperties
            }
          >
            {token.text}
          </span>
        ))}
        <span className="animated-title-ball" aria-hidden="true" />
      </span>
    </h1>
  );
}
