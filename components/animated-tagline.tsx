import {
  ANIMATED_TAGLINE_CYCLE_MS,
  ANIMATED_TAGLINE_LABEL,
  ANIMATED_TAGLINE_TOKENS,
} from "@/lib/animated-tagline";

export function AnimatedTagline() {
  return (
    <p
      className="animated-tagline mt-4 max-w-2xl text-white/85"
      aria-label={ANIMATED_TAGLINE_LABEL}
      style={{ "--tagline-cycle": `${ANIMATED_TAGLINE_CYCLE_MS}ms` } as React.CSSProperties}
    >
      <span className="animated-tagline-visual" aria-hidden="true">
        {ANIMATED_TAGLINE_TOKENS.map((token, index) =>
          token.animated ? (
            <span
              className={`animated-tagline-token${token.accent ? " animated-tagline-token-accent" : ""}`}
              key={`${token.text}-${index}`}
              style={
                {
                  "--tagline-delay": `${token.delayMs}ms`,
                  "--tagline-tilt": `${token.tilt}deg`,
                } as React.CSSProperties
              }
            >
              {token.text}
            </span>
          ) : (
            <span className="animated-tagline-space" key={`space-${index}`}>
              {"\u00a0"}
            </span>
          ),
        )}
      </span>
    </p>
  );
}
