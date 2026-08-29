export function OperationalField({ variant = "hero" }: { variant?: "hero" | "statement" | "closing" }) {
  return (
    <svg
      className={`operational-field operational-field--${variant}`}
      data-operational-field={variant}
      aria-hidden="true"
      viewBox="0 0 720 720"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      <defs>
        <pattern id={`field-grid-${variant}`} width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0H0V36" className="operational-field__grid" />
        </pattern>
      </defs>
      <rect width="720" height="720" fill={`url(#field-grid-${variant})`} />
      <g className="operational-field__geometry">
        <circle cx="574" cy="138" r="204" />
        <circle cx="574" cy="138" r="132" />
        <path d="M-30 576H160L238 498H438L506 430H750" />
        <path d="M108 0V238L184 314V720" />
        <path d="M0 436H94L152 378H326" />
      </g>
      <g className="operational-field__measure">
        <path d="M40 76H250" />
        <path d="M40 68V84M76 72V80M112 68V84M148 72V80M184 68V84M220 72V80M250 68V84" />
      </g>
      <g className="operational-field__signal">
        <path d="M-30 576H160L238 498H438L506 430H750" pathLength="1" />
      </g>
      <g className="operational-field__nodes">
        <circle cx="160" cy="576" r="5" />
        <circle cx="238" cy="498" r="5" />
        <circle cx="438" cy="498" r="5" />
        <circle cx="506" cy="430" r="5" />
      </g>
    </svg>
  );
}
